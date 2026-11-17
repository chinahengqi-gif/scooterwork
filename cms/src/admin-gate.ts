import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const isManagement = path.startsWith("/_emdash/") &&
    !path.startsWith("/_emdash/api/media/file/") &&
    !path.startsWith("/_emdash/image/");
  if (isManagement) {
    const password = (env as Record<string, unknown>).CMS_ADMIN_PASSWORD;
    if (typeof password !== "string" || !password) {
      return new Response("Administration is not configured.", { status: 503 });
    }
    const expected = `Basic ${btoa(`admin:${password}`)}`;
    const actual = context.request.headers.get("Authorization") || "";
    const encoder = new TextEncoder();
    const [expectedHash, actualHash] = await Promise.all([expected, actual].map(value =>
      crypto.subtle.digest("SHA-256", encoder.encode(value))
    ));
    const left = new Uint8Array(expectedHash);
    const right = new Uint8Array(actualHash);
    let difference = 0;
    for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index];
    if (difference !== 0) {
      return new Response("Sign in to manage Scooter.work guides.", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Scooter.work administration", charset="UTF-8"', "Cache-Control": "no-store" },
      });
    }
  }
  const response = await next();
  if (isManagement) response.headers.set("Cache-Control", "no-store");
  return response;
});
