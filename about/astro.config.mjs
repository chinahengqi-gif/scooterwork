import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://about.scooter.work",
  build: {
    inlineStylesheets: "always",
  },
});
