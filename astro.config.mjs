import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://scooter.work",
  build: {
    inlineStylesheets: "always",
  },
});
