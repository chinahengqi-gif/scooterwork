import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { InputConfigSchema, convertToWranglerConfig } from "@cloudflare/config";
import configuration from "./cloudflare.config.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const workerConfig = convertToWranglerConfig(InputConfigSchema.parse(configuration));
const adapterConfig = new URL("./.cloudflare/adapter.json", import.meta.url);
mkdirSync(new URL("./.cloudflare/", import.meta.url), { recursive: true });
writeFileSync(adapterConfig, JSON.stringify({ ...workerConfig, main: fileURLToPath(new URL("./src/worker.ts", import.meta.url)) }));

export default defineConfig({
  site: "https://guides.scooter.work",
  output: "server",
  publicDir: "../public",
  adapter: cloudflare({ configPath: fileURLToPath(adapterConfig), imageService: "passthrough" }),
  i18n: { defaultLocale: "en", locales: ["en", "de", "fr"], routing: { prefixDefaultLocale: false } },
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA", publicUrl: "https://media.scooter.work" }),
      siteUrl: "https://guides.scooter.work",
      coEditing: false,
      fonts: false,
      toolbar: false,
      maxUploadSize: 90 * 1024 * 1024,
      admin: { locales: ["en", "de", "fr"] },
      middleware: { outer: new URL("./src/admin-gate.ts", import.meta.url) },
    }),
  ],
  build: { inlineStylesheets: "always" },
});
