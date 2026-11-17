import { readFile, mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { applySeed, SchemaRegistry } from "emdash";
import { translations } from "../src/i18n.ts";

const account = "53c684fa14001b113b7b69a16ad1f6aa";
const database = "06549a6a-d538-47e8-ba03-3ed8af4179d2";
const token = process.env.CLOUDFLARE_API_TOKEN || JSON.parse(await readFile(`${homedir()}/Library/Preferences/cloudflare/config/default.json`, "utf8")).oauth_token;
if (!token) throw new Error("Sign in with cf auth login first.");
const endpoint = `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`;

async function query(sql, params = []) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sql, params }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.success || !payload.result?.[0]?.success) {
    throw new Error(`D1 query failed (${response.status}): ${JSON.stringify(payload.errors || payload.result?.[0]?.error)}`);
  }
  return payload.result[0];
}

const existing = await query("SELECT * FROM ec_guides");
if (existing.results.length) throw new Error("Existing guides detected. Migrate their category relations before removing the legacy field.");
const backupDirectory = new URL("../cms/.emdash/backups/", import.meta.url);
await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
const backup = {};
for (const table of ["_emdash_collections", "_emdash_fields", "ec_guides"]) {
  backup[table] = (await query(`SELECT * FROM "${table}"`)).results;
}
await writeFile(new URL(`categories-${Date.now()}.json`, backupDirectory), JSON.stringify(backup), { mode: 0o600 });

const db = new Kysely({ dialect: new D1Dialect({ database: {
  prepare(sql) {
    return { bind(...params) { return { all: () => query(sql, params) }; } };
  },
} }) });

try {
  const seed = JSON.parse(await readFile(new URL("../cms/seed/seed.json", import.meta.url), "utf8"));
  const { settings, ...schema } = seed;
  console.log("Applying category schema...");
  const result = await applySeed(db, schema, { onConflict: "update" });
  if (result.errors?.length) throw new Error(JSON.stringify(result.errors));
  const registry = new SchemaRegistry(db);
  if (await registry.getField("guides", "product")) {
    const check = await query("SELECT COUNT(*) AS count FROM ec_guides");
    if (check.results[0].count) throw new Error("A guide was added during migration; legacy field retained.");
    await registry.deleteField("guides", "product");
  }

  const slugs = ["battery", "alarm", "damper", "speed-kit", "scooter-trailer"];
  const images = ["battery.jpg", "alarm.jpg", "damper.webp", "speed-kit.webp", "scooter-trailer.jpg"];
  const content = [];
  for (const locale of ["en", "de", "fr"]) {
    for (const [index, slug] of slugs.entries()) {
      const details = translations[locale].productDetails[index];
      content.push({
        id: `${slug}-${locale}`, slug, locale, status: "published",
        ...(locale === "en" ? {} : { translationOf: `${slug}-en` }),
        data: {
          title: details.name, description: details.description, image_alt: details.alt,
          image: { $media: { url: `https://scooter.work/images/${images[index]}`, alt: details.alt } },
          sort_order: index * 10, enabled: slug !== "battery",
        },
      });
    }
  }
  console.log("Seeding translated categories without overwriting existing entries...");
  const seeded = await applySeed(db, { version: "1", defaultLocale: "en", content: { product_categories: content } }, {
    includeContent: true, onConflict: "skip", skipMediaDownload: true,
  });
  if (seeded.errors?.length) throw new Error(JSON.stringify(seeded.errors));
  console.log(JSON.stringify({ schema: result, content: seeded }));
} finally {
  await db.destroy();
}
