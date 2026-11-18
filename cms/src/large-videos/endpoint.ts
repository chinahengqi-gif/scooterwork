import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { handleVideoUpload } from "./server";

export const ALL: APIRoute = async ({ request, params, locals }) => {
  if (!locals.emdash?.db) return new Response("CMS unavailable", { status: 503 });
  return handleVideoUpload(request, params.path || "", {
    db: locals.emdash.db, bucket: (env as unknown as { MEDIA: R2Bucket }).MEDIA, user: locals.user,
  });
};
