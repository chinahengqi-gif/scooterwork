import handler, { createScheduledHandler } from "@emdash-cms/cloudflare/worker";
import { cleanupVideoUploads } from "./large-videos/cleanup";

const maintenance = createScheduledHandler();

export default {
  ...handler,
  scheduled(controller, env, context) {
    maintenance(controller, env, context);
    context.waitUntil(cleanupVideoUploads(env).catch(error => console.error("[large-videos] Cleanup failed", error)));
  },
};
