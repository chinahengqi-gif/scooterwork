import { defineConfig, bindings, triggers } from "cf/config";

export default defineConfig({
  worker: {
    name: "scooterwork-guides",
    entrypoint: "./src/worker.ts",
    compatibilityDate: "2026-11-17",
    compatibilityFlags: ["nodejs_compat"],
    domains: ["guides.scooter.work"],
    workersDev: false,
    env: {
      DB: bindings.d1({ id: "06549a6a-d538-47e8-ba03-3ed8af4179d2", name: "scooterwork-cms" }),
      MEDIA: bindings.r2({ name: "scooterwork-media" }),
      SESSION: bindings.kv({ id: "7f0514ba5d344522bf031b2d92cc2dc7" }),
      ASSETS: bindings.assets(),
    },
    triggers: [triggers.scheduled({ schedule: "* * * * *" })],
    observability: { enabled: true },
  },
});
