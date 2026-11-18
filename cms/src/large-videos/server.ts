import { hasPermission, type User } from "@emdash-cms/auth";
import { MediaRepository, PluginStorageRepository } from "emdash";
import { MAX_VIDEO_SIZE, PART_SIZE, SESSION_LIFETIME, type VideoUpload } from "./protocol";

type Database = ConstructorParameters<typeof MediaRepository>[0];
interface UploadRecord extends Omit<VideoUpload, "completedParts" | "url"> {
  ownerId: string;
  key: string;
  uploadId: string;
  mimeType: string;
  parts: { partNumber: number; etag: string }[];
  lockUntil?: number;
}
interface Dependencies {
  db: Database;
  bucket: R2Bucket;
  user?: Pick<User, "id" | "role">;
}

class UploadError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

function response(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
}

function publicRecord(record: UploadRecord): VideoUpload {
  return {
    id: record.id, filename: record.filename, size: record.size, fingerprint: record.fingerprint,
    partSize: record.partSize, totalParts: record.totalParts, expiresAt: record.expiresAt,
    status: record.status, completedParts: record.parts.map(part => part.partNumber),
    ...(record.status === "complete" ? { mediaId: record.mediaId, url: `https://media.scooter.work/${record.key}` } : {}),
  };
}

async function readJson(request: Request) {
  const text = await readBytes(request, 4096);
  try {
    const value = JSON.parse(new TextDecoder().decode(text));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid object");
    return value;
  }
  catch { throw new UploadError("Invalid JSON request."); }
}

async function readBytes(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new UploadError("Request is too large.", 413);
  if (!request.body) throw new UploadError("Missing request body.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new UploadError("Request is too large.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export async function handleVideoUpload(request: Request, path: string, { db, bucket, user }: Dependencies) {
  if (!user) return response({ error: "Sign in to upload videos." }, 401);
  if (!hasPermission(user, "media:upload")) return response({ error: "You do not have upload permission." }, 403);
  if (request.method !== "GET" && (request.headers.get("X-EmDash-Request") !== "1" || (request.headers.get("Origin") && request.headers.get("Origin") !== new URL(request.url).origin))) {
    return response({ error: "Request verification failed." }, 403);
  }
  const sessions = new PluginStorageRepository<UploadRecord>(db, "large-videos", "uploads", []);
  const media = new MediaRepository(db);
  try {
    const segments = path.split("/").filter(Boolean);
    if (!segments.length && request.method === "POST") {
      const body = await readJson(request);
      if (typeof body.filename !== "string" || body.filename.length > 180 || /[\x00-\x1f/\\]/.test(body.filename)) throw new UploadError("Invalid filename.");
      const extension = body.filename.toLowerCase().match(/\.(mp4|webm)$/)?.[1];
      if (!extension) throw new UploadError("Please choose an MP4 or WebM video.");
      if (!Number.isSafeInteger(body.size) || body.size < 12 || body.size > MAX_VIDEO_SIZE) throw new UploadError("Video size must be between 12 bytes and 20 GiB.");
      if (typeof body.fingerprint !== "string" || !/^[a-f0-9]{64}$/.test(body.fingerprint)) throw new UploadError("Missing file fingerprint.");
      const id = crypto.randomUUID();
      const key = `videos/${id}.${extension}`;
      const mimeType = extension === "mp4" ? "video/mp4" : "video/webm";
      const upload = await bucket.createMultipartUpload(key, { httpMetadata: { contentType: mimeType }, customMetadata: { videoUpload: id, ownerId: user.id } });
      const record: UploadRecord = {
        id, key, uploadId: upload.uploadId, ownerId: user.id, filename: body.filename, size: body.size,
        fingerprint: body.fingerprint, mimeType, partSize: PART_SIZE, totalParts: Math.ceil(body.size / PART_SIZE),
        parts: [], expiresAt: Date.now() + SESSION_LIFETIME, status: "uploading",
      };
      try { await sessions.put(id, record); }
      catch (error) { await upload.abort(); throw error; }
      return response(publicRecord(record), 201);
    }
    const id = segments[0];
    if (!id || !/^[a-f0-9-]{36}$/.test(id)) throw new UploadError("Upload not found.", 404);
    let current = await sessions.getVersioned(id);
    if (!current || current.value.ownerId !== user.id) throw new UploadError("Upload not found.", 404);
    let record = current.value;
    if (segments.length === 1 && request.method === "GET") return response(publicRecord(record));
    if (record.status === "aborted") {
      if (segments.length === 1 && request.method === "DELETE") return response(publicRecord(record));
      throw new UploadError("Upload was cancelled. Start a new upload.", 410);
    }
    const multipart = bucket.resumeMultipartUpload(record.key, record.uploadId);

    if (segments.length === 1 && request.method === "DELETE") {
      if (record.status === "complete") throw new UploadError("This video is already in the media library. Delete it there if necessary.", 409);
      if (record.status === "completing" && (record.lockUntil || 0) > Date.now()) throw new UploadError("Video is being finalized. Please try again shortly.", 409);
      if (record.mediaId && (await media.findById(record.mediaId))?.status === "ready") throw new UploadError("Video is already in the media library. Retry completion to recover its link.", 409);
      const cancelled = { ...record, status: "aborted" as const, parts: [], expiresAt: Date.now() - 1 };
      if (!(await sessions.compareAndSet(id, current.revision, cancelled)).applied) throw new UploadError("Upload changed. Please try again.", 409);
      try { await multipart.abort(); }
      catch (error) { if (!/does not exist|NoSuchUpload|not found/i.test(String(error))) throw error; }
      if (record.mediaId) {
        const item = await media.findById(record.mediaId);
        if (item?.status === "ready") throw new UploadError("Video is already in the media library.", 409);
        await media.markFailed(record.mediaId, record.key);
      }
      await bucket.delete(record.key);
      return response(publicRecord(cancelled));
    }
    if (record.status === "complete") {
      if (segments[1] === "complete" && segments.length === 2 && request.method === "POST") return response(publicRecord(record));
      throw new UploadError("Upload has already completed.", 409);
    }
    if (record.expiresAt < Date.now()) throw new UploadError("This upload expired after 24 hours. Cancel it and start a new upload.", 410);

    if (segments.length === 3 && segments[1] === "parts" && request.method === "PUT") {
      if (record.status !== "uploading") throw new UploadError("Upload is being finalized.", 409);
      const partNumber = Number(segments[2]);
      if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > record.totalParts) throw new UploadError("Invalid part number.");
      const expectedSize = Math.min(record.partSize, record.size - (partNumber - 1) * record.partSize);
      const bytes = await readBytes(request, expectedSize);
      if (bytes.byteLength !== expectedSize) throw new UploadError("Part size does not match the file.");
      if (partNumber === 1) {
        const isMp4 = new TextDecoder().decode(bytes.slice(4, 8)) === "ftyp";
        const isWebm = bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
        if (!(record.mimeType === "video/mp4" ? isMp4 : isWebm)) throw new UploadError("The file is not a supported MP4/WebM video.");
      }
      const existing = record.parts.find(part => part.partNumber === partNumber);
      if (existing) return response({ partNumber });
      const part = await multipart.uploadPart(partNumber, bytes);
      for (let attempt = 0; attempt < 5; attempt++) {
        current = await sessions.getVersioned(id);
        if (!current || current.value.status !== "uploading") throw new UploadError("Upload state changed. Please reload.", 409);
        record = current.value;
        if (record.parts.some(item => item.partNumber === partNumber)) return response({ partNumber });
        const updated = { ...record, parts: [...record.parts, { partNumber, etag: part.etag }] };
        if ((await sessions.compareAndSet(id, current.revision, updated)).applied) return response({ partNumber });
      }
      throw new UploadError("Please retry this part.", 409);
    }

    if (segments.length === 2 && segments[1] === "complete" && request.method === "POST") {
      if (record.parts.length !== record.totalParts) throw new UploadError("Some parts are missing.", 409);
      if (record.status === "completing" && (record.lockUntil || 0) > Date.now()) throw new UploadError("Video is being finalized. Please try again shortly.", 409);
      record = { ...record, status: "completing", lockUntil: Date.now() + 120_000 };
      const locked = await sessions.compareAndSet(id, current.revision, record);
      if (!locked.applied) throw new UploadError("Upload changed. Please try again.", 409);
      try {
        let item = record.mediaId ? await media.findById(record.mediaId) : await media.findPendingByStorageKey(record.key);
        if (!item) item = await media.createPending({ filename: record.filename, mimeType: record.mimeType, size: record.size, storageKey: record.key, authorId: user.id });
        record.mediaId = item.id;
        await sessions.put(id, record);
        let object = await bucket.head(record.key);
        if (!object) {
          await multipart.complete([...record.parts].sort((first, second) => first.partNumber - second.partNumber));
          object = await bucket.head(record.key);
        }
        if (!object || object.size !== record.size || object.customMetadata?.videoUpload !== id) throw new UploadError("Stored video verification failed.", 409);
        if (item.status !== "ready") {
          item = await media.confirmUpload(item.id, { size: object.size }, record.key) || await media.findById(item.id);
        }
        if (!item || item.status !== "ready") throw new UploadError("Could not register this video. Please retry.", 409);
        const completed = { ...record, status: "complete" as const, lockUntil: undefined, parts: [] };
        await sessions.put(id, completed);
        return response(publicRecord(completed));
      } catch (error) {
        await sessions.put(id, { ...record, status: "uploading", lockUntil: undefined });
        throw error;
      }
    }
    throw new UploadError("Endpoint not found.", 404);
  } catch (error) {
    if (error instanceof UploadError) return response({ error: error.message }, error.status);
    console.error("[large-videos] Upload operation failed", error);
    return response({ error: "Upload service temporarily unavailable. Your progress is saved; please retry." }, 503);
  }
}
