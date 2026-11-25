import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "scooterwork-about",
    compatibilityDate: "2026-11-20",
    domains: ["about.scooter.work"],
    workersDev: false,
    assets: {
      htmlHandling: "auto-trailing-slash",
    },
  },
});
