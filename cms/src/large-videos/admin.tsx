import * as React from "react";
import { API_PATH, MAX_VIDEO_SIZE, type VideoUpload } from "./protocol";

const STORAGE_KEY = "scooterwork-large-video-upload";
const buttonStyle: React.CSSProperties = { padding: "10px 16px", border: "1px solid #555", borderRadius: 6, background: "#242424", color: "#fff", cursor: "pointer", minHeight: 44 };
const panelStyle: React.CSSProperties = { padding: 24, border: "1px solid #444", borderRadius: 10, display: "grid", gap: 18 };

class RequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function api(path: string, method = "GET", body?: unknown, signal?: AbortSignal): Promise<VideoUpload> {
  const response = await fetch(`${API_PATH}${path}`, {
    method, credentials: "same-origin", signal,
    headers: { "X-EmDash-Request": "1", ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new RequestError(result.error || "请求失败，请稍后重试。", response.status);
  return result;
}

function uploadPart(id: string, number: number, data: Blob, signal: AbortSignal, progress: (bytes: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const finish = (error?: Error) => {
      signal.removeEventListener("abort", abort);
      error ? reject(error) : resolve();
    };
    xhr.open("PUT", `${API_PATH}/${id}/parts/${number}`);
    xhr.setRequestHeader("X-EmDash-Request", "1");
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.timeout = 10 * 60 * 1000;
    xhr.upload.onprogress = event => progress(event.loaded);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return finish();
      let message = "上传失败，进度已保留，请重试。";
      try { message = JSON.parse(xhr.responseText).error || message; } catch { }
      finish(new RequestError(message, xhr.status));
    };
    xhr.onerror = () => finish(new RequestError("网络连接中断，进度已保留。", 0));
    xhr.ontimeout = () => finish(new RequestError("分片上传超时，进度已保留。", 0));
    xhr.onabort = () => finish(new DOMException("Upload paused", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) return finish(new DOMException("Upload paused", "AbortError"));
    xhr.send(data);
  });
}

function wait(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException("Upload paused", "AbortError")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, delay);
    if (signal.aborted) return abort();
    signal.addEventListener("abort", abort, { once: true });
  });
}

async function fingerprint(file: File) {
  const bytes = await new Blob([`${file.name}:${file.size}:${file.lastModified}:`, file.slice(0, 65536), file.slice(Math.max(0, file.size - 65536))]).arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(value => value.toString(16).padStart(2, "0")).join("");
}

function uploadedBytes(upload: VideoUpload) {
  return upload.completedParts.reduce((total, number) => total + Math.min(upload.partSize, upload.size - (number - 1) * upload.partSize), 0);
}

function sizeLabel(bytes: number) {
  return bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GiB` : `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
}

export function VideoUploadPage() {
  const [file, setFile] = React.useState<File>();
  const [upload, setUpload] = React.useState<VideoUpload>();
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const controller = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    const abort = new AbortController();
    const id = localStorage.getItem(STORAGE_KEY);
    if (!id || !/^[a-f0-9-]{36}$/.test(id)) { localStorage.removeItem(STORAGE_KEY); setLoading(false); return; }
    api(`/${id}`, "GET", undefined, abort.signal).then(saved => {
      setUpload(saved);
      setProgress(saved.status === "complete" ? saved.size : uploadedBytes(saved));
    }).catch(problem => {
      if (problem.name === "AbortError") return;
      if (problem.status === 404) localStorage.removeItem(STORAGE_KEY);
      else setError("无法恢复上传进度，请刷新页面或重新登录。");
    }).finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => { abort.abort(); controller.current?.abort(); };
  }, []);

  React.useEffect(() => {
    if (!busy) return;
    const preventClose = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", preventClose);
    return () => window.removeEventListener("beforeunload", preventClose);
  }, [busy]);

  async function start() {
    if (busy || loading) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true); setError(""); setMessage("正在准备视频……");
    try {
      let current = upload ? await api(`/${upload.id}`, "GET", undefined, abort.signal) : undefined;
      if (current?.status === "complete") { setUpload(current); setProgress(current.size); return; }
      if (current?.status === "aborted") throw new Error("这个上传已经取消，请开始新上传。");
      if (current && current.expiresAt < Date.now()) throw new Error("上传已超过 24 小时，请取消后重新上传。");
      const needsFile = !current || current.completedParts.length < current.totalParts;
      if (needsFile) {
        if (!file) throw new Error("请选择视频文件；续传时请重新选择同一个原文件。");
        if (!/\.(mp4|webm)$/i.test(file.name) || file.size > MAX_VIDEO_SIZE || file.size < 12) throw new Error("请选择不超过 20 GiB 的 MP4 或 WebM 视频。");
        const hash = await fingerprint(file);
        if (abort.signal.aborted) throw new DOMException("Upload paused", "AbortError");
        if (current && current.fingerprint !== hash) throw new Error("所选文件与之前上传的文件不同，请重新选择原视频。");
        if (!current) {
          current = await api("", "POST", { filename: file.name, size: file.size, fingerprint: hash }, abort.signal);
          localStorage.setItem(STORAGE_KEY, current.id);
          setUpload(current);
        }
      }
      if (!current) throw new Error("上传未初始化，请重试。");
      let completed = uploadedBytes(current);
      setProgress(completed);
      for (let number = 1; number <= current.totalParts; number++) {
        if (current.completedParts.includes(number)) continue;
        const data = file!.slice((number - 1) * current.partSize, Math.min(number * current.partSize, current.size));
        for (let attempt = 0; ; attempt++) {
          setMessage(`正在上传第 ${number} / ${current.totalParts} 个分片${attempt ? `（重试 ${attempt}/3）` : ""}，请保持此页面打开。`);
          try {
            await uploadPart(current.id, number, data, abort.signal, bytes => setProgress(completed + bytes));
            break;
          } catch (problem) {
            if (!(problem instanceof RequestError) || (problem.status > 0 && problem.status < 500 && problem.status !== 429) || attempt >= 3) throw problem;
            setProgress(completed);
            await wait(1000 * 2 ** attempt, abort.signal);
          }
        }
        completed += data.size;
        current = { ...current, completedParts: [...current.completedParts, number] };
        setUpload(current); setProgress(completed);
      }
      setMessage("上传完成，正在合并并加入媒体库，请稍候……");
      const result = await api(`/${current.id}/complete`, "POST", undefined, abort.signal);
      setUpload(result); setProgress(result.size); setMessage("视频已加入媒体库，可以在正文中插入了。");
    } catch (problem) {
      if (problem instanceof Error && problem.name === "AbortError") setMessage("已暂停。点击继续上传即可恢复，已完成的分片不会重新上传。");
      else setError(problem instanceof Error ? problem.message : "上传失败，已完成的进度会保留。");
    } finally { setBusy(false); controller.current = null; }
  }

  async function cancel() {
    if (!upload || busy || !window.confirm("确定取消这个上传并清理已上传的分片吗？")) return;
    setBusy(true); setError("");
    try {
      await api(`/${upload.id}`, "DELETE");
      localStorage.removeItem(STORAGE_KEY); setUpload(undefined); setFile(undefined); setProgress(0); setMessage("已取消并清理上传。");
    } catch (problem) { setError(problem instanceof Error ? problem.message : "取消失败，请重试。"); }
    finally { setBusy(false); }
  }

  const complete = upload?.status === "complete";
  const percentage = upload ? Math.min(100, Math.floor(progress / upload.size * 100)) : 0;
  return <section style={{ display: "grid", gap: 24, maxWidth: 900, marginInline: "auto", padding: 24 }}>
    <h1 style={{ fontSize: 28, fontWeight: 700 }}>大视频上传</h1>
    <p>选择原视频即可，系统自动分片上传到 R2，无需手动切割。支持 MP4 / WebM，单文件最大 20 GiB；推荐 MP4（H.264 视频 + AAC 音频）。</p>
    <div style={panelStyle}>
      {loading ? <p role="status">正在恢复上传进度……</p> : <>
        {!complete && <label style={{ display: "grid", gap: 12 }}>
          {upload ? `续传文件：${upload.filename}（${sizeLabel(upload.size)}）` : "选择视频文件"}
          <input type="file" accept=".mp4,.webm,video/mp4,video/webm" disabled={busy} onChange={event => { setFile(event.target.files?.[0]); setError(""); }} />
        </label>}
        {upload && <div style={{ display: "grid", gap: 8 }}>
          <strong style={{ overflowWrap: "anywhere" }}>{upload.filename}</strong>
          <progress max={100} value={percentage} style={{ width: "100%", height: 18 }} aria-label="视频上传进度" />
          <span>{percentage}% · {sizeLabel(progress)} / {sizeLabel(upload.size)}</span>
          {!complete && <small>进度保留 24 小时。刷新或关闭页面后，重新选择同一个原文件即可继续。</small>}
        </div>}
        {complete ? <>
          <p role="status">视频已加入媒体库。在文章正文点击「＋ → Video」，选择刚上传的视频即可。</p>
          <label style={{ display: "grid", gap: 8 }}>视频链接<input readOnly value={upload.url || ""} style={{ width: "100%", padding: 12, background: "transparent", border: "1px solid #666", borderRadius: 4 }} /></label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="button" style={buttonStyle} onClick={() => navigator.clipboard.writeText(upload.url || "").then(() => setMessage("链接已复制。")).catch(() => setError("请手动选择并复制上方链接。"))}>复制视频链接</button>
            <a href="/_emdash/admin/media" style={buttonStyle}>打开媒体库</a>
            <button type="button" style={buttonStyle} onClick={() => { localStorage.removeItem(STORAGE_KEY); setUpload(undefined); setFile(undefined); setProgress(0); setMessage(""); }}>上传下一个视频</button>
          </div>
        </> : <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="button" style={buttonStyle} disabled={busy || (!file && (!upload || upload.completedParts.length < upload.totalParts))} onClick={() => void start()}>{upload ? "继续上传 / 完成入库" : "开始上传"}</button>
          {busy && <button type="button" style={buttonStyle} onClick={() => controller.current?.abort()}>暂停上传</button>}
          {upload && !busy && <button type="button" style={buttonStyle} onClick={() => void cancel()}>取消并清理</button>}
        </div>}
      </>}
      {message && <p role="status" aria-live="polite">{message}</p>}
      {error && <p role="alert" style={{ color: "#ffb4a2" }}>{error}</p>}
    </div>
    <p>这个入口专门用于大视频；普通图片和小文件仍可用原来的媒体库上传。不要在上传中切换后台页面，暂停后再离开更稳妥。</p>
  </section>;
}

export const pages = { "/upload": VideoUploadPage };
