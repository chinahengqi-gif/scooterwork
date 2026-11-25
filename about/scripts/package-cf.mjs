import path from "node:path";
import { loadAndParseConfig } from "@cloudflare/config";
import { cleanBuildOutputDir, writeAssets, writeRootConfig, writeWorkerConfig } from "@cloudflare/build-output-utils";

const root = process.cwd();
const context = { mode: undefined, isPreview: false };
const { result } = await loadAndParseConfig(path.join(root, "cloudflare.config.ts"), context);
if (!result.success) throw result.error;

const config = result.data;
await cleanBuildOutputDir(root);
await writeAssets({ root, sourceDirectory: path.join(root, "dist") });
const { worker, containers, ...settings } = config;
await writeRootConfig(root, settings, context);
await writeWorkerConfig({ root, config: worker });

console.log("Cloudflare static assets output is ready for scooterwork-about.");
