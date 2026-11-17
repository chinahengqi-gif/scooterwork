import { cp, readdir } from "node:fs/promises";
import path from "node:path";
import { loadAndParseConfig } from "@cloudflare/config";
import { cleanBuildOutputDir, getWorkerBundleDir, writeAssets, writeRootConfig, writeWorkerConfig } from "@cloudflare/build-output-utils";

const root = process.cwd();
const context = { mode: undefined, isPreview: false };
const { result } = await loadAndParseConfig(path.join(root, "cloudflare.config.ts"), context);
if (!result.success) throw result.error;
const config = result.data;
const modules = {};
async function collect(directory, prefix = "") {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = `${prefix}${entry.name}`;
    if (entry.isDirectory()) await collect(path.join(directory, entry.name), `${name}/`);
    else if (!name.endsWith(".json") && !name.endsWith(".map")) {
      modules[name] = { type: name.endsWith(".wasm") ? "wasm" : name.endsWith(".html") ? "text" : "esm" };
    }
  }
}
await collect(path.join(root, "dist/server"));
const mainModule = modules["entry.mjs"] ? "entry.mjs" : "index.js";
if (!modules[mainModule]) throw new Error("Astro Worker entry was not found.");
await cleanBuildOutputDir(root);
await cp(path.join(root, "dist/server"), getWorkerBundleDir(root), { recursive: true });
await writeAssets({ root, sourceDirectory: path.join(root, "dist/client") });
const { worker, containers, ...settings } = config;
await writeRootConfig(root, settings, context);
await writeWorkerConfig({ root, config: config.worker, manifest: { type: "complete", mainModule, modules } });
console.log("Cloudflare CMS deployment output is ready.");
