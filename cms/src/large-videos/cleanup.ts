interface CleanupEnvironment { DB: D1Database; MEDIA: R2Bucket }

export async function cleanupVideoUploads({ DB, MEDIA }: CleanupEnvironment) {
  const now = Date.now();
  const stale = await DB.prepare(`SELECT id, data, revision FROM _plugin_storage
    WHERE plugin_id = 'large-videos' AND collection = 'uploads'
      AND json_extract(data, '$.expiresAt') < ?
      AND (json_extract(data, '$.status') != 'complete' OR json_extract(data, '$.expiresAt') < ?)
      AND coalesce(json_extract(data, '$.lockUntil'), 0) < ? LIMIT 5`).bind(now, now - 6 * 86400_000, now).all<{ id: string; data: string; revision: string }>();
  for (const row of stale.results) {
    const record = JSON.parse(row.data);
    if (!/^videos\/[a-f0-9-]{36}\.(mp4|webm)$/.test(record.key)) continue;
    if (record.status !== "complete") {
      const revision = crypto.randomUUID();
      const claim = await DB.prepare(`UPDATE _plugin_storage SET data = json_set(data, '$.status', 'aborted'), revision = ?
        WHERE plugin_id = 'large-videos' AND collection = 'uploads' AND id = ? AND revision = ?`).bind(revision, row.id, row.revision).run();
      if (!claim.meta.changes) continue;
      row.revision = revision;
      const media = record.mediaId ? await DB.prepare("SELECT status FROM media WHERE id = ? AND storage_key = ?").bind(record.mediaId, record.key).first<{ status: string }>() : null;
      if (media?.status !== "ready") {
        try { await MEDIA.resumeMultipartUpload(record.key, record.uploadId).abort(); }
        catch (error) {
          if (!/does not exist|NoSuchUpload|not found/i.test(String(error))) {
            console.error("[large-videos] Will retry expired upload cleanup", error);
            continue;
          }
        }
        await MEDIA.delete(record.key);
        if (record.mediaId) await DB.prepare("UPDATE media SET status = 'failed' WHERE id = ? AND storage_key = ? AND status = 'pending'").bind(record.mediaId, record.key).run();
      }
    }
    await DB.prepare("DELETE FROM _plugin_storage WHERE plugin_id = 'large-videos' AND collection = 'uploads' AND id = ? AND revision = ?").bind(row.id, row.revision).run();
  }
}
