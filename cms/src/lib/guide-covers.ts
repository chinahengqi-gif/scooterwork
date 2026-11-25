import { getEmDashCollection } from "emdash";
import { sql, type Kysely } from "kysely";
import type { Locale } from "../../../src/i18n";

type ResolveMediaUrl = (storageKey: string) => string;

const INTERNAL_MEDIA_PREFIX = "/_emdash/api/media/file/";
const SQL_CHUNK_SIZE = 80;

function safeHttpsUrl(value: unknown, base?: string): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = base ? new URL(value.trim(), base) : new URL(value.trim());
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export function resolveSeoImageUrl(raw: unknown, resolveMediaUrl?: ResolveMediaUrl): string {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value) return "";
  try {
    if (value.startsWith(INTERNAL_MEDIA_PREFIX)) {
      const encodedKey = value.slice(INTERNAL_MEDIA_PREFIX.length).split(/[?#]/, 1)[0] ?? "";
      const storageKey = decodeURIComponent(encodedKey);
      const resolved = (storageKey && resolveMediaUrl?.(storageKey)) || value;
      return safeHttpsUrl(resolved, "https://guides.scooter.work");
    }
    if (/^https?:\/\//i.test(value) || value.startsWith("//") || value.startsWith("/")) {
      return safeHttpsUrl(value, "https://guides.scooter.work");
    }
    const resolved = resolveMediaUrl?.(value) || `${INTERNAL_MEDIA_PREFIX}${encodeURIComponent(value)}`;
    return safeHttpsUrl(resolved, "https://guides.scooter.work");
  } catch {
    return "";
  }
}

async function queryGuideSeoImages(
  db: unknown,
  contentIds: string[],
  resolveMediaUrl?: ResolveMediaUrl,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!db || !contentIds.length) return map;
  const kyselyDb = db as Kysely<Record<string, never>>;
  const uniqueIds = [...new Set(contentIds)];

  for (let index = 0; index < uniqueIds.length; index += SQL_CHUNK_SIZE) {
    const chunk = uniqueIds.slice(index, index + SQL_CHUNK_SIZE);
    const { rows } = await sql<{ content_id: string; seo_image: string | null }>`
      SELECT content_id, seo_image
      FROM _emdash_seo
      WHERE collection = 'guides'
        AND content_id IN (${sql.join(chunk)})
    `.execute(kyselyDb);
    for (const row of rows) {
      const resolved = resolveSeoImageUrl(row.seo_image, resolveMediaUrl);
      if (resolved) map.set(row.content_id, resolved);
    }
  }
  return map;
}

export async function guideCovers(
  entries: ReadonlyArray<{ data: Record<string, unknown> }>,
  options: { db?: unknown; locale: Locale; resolveMediaUrl?: ResolveMediaUrl },
): Promise<Map<string, string>> {
  const { db, locale, resolveMediaUrl } = options;
  const covers = new Map<string, string>();
  if (!entries.length) return covers;

  const ids = entries
    .map((entry) => entry.data.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  const seoImages = await queryGuideSeoImages(db, ids, resolveMediaUrl);

  const missingGroups: Array<{ id: string; group: string }> = [];
  for (const entry of entries) {
    const id = typeof entry.data.id === "string" ? entry.data.id : "";
    if (!id) continue;
    const inlineSeo = (entry.data.seo as { image?: unknown } | undefined)?.image;
    const direct = seoImages.get(id) || resolveSeoImageUrl(inlineSeo, resolveMediaUrl);
    if (direct) {
      covers.set(id, direct);
      continue;
    }
    const group = typeof entry.data.translationGroup === "string" ? entry.data.translationGroup : "";
    if (locale !== "en" && group) {
      missingGroups.push({ id, group });
    }
  }

  if (locale !== "en" && missingGroups.length) {
    const english = await getEmDashCollection("guides", {
      status: "published",
      locale: "en",
      limit: 1000,
    });
    if (!english.error) {
      const enByGroup = new Map<string, Record<string, unknown>>();
      for (const entry of english.entries) {
        const group = typeof entry.data.translationGroup === "string" ? entry.data.translationGroup : "";
        if (group) enByGroup.set(group, entry.data);
      }
      const matchedEnIds = missingGroups
        .map(({ group }) => enByGroup.get(group)?.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0);
      const enSeoImages = await queryGuideSeoImages(db, matchedEnIds, resolveMediaUrl);

      for (const { id, group } of missingGroups) {
        const sibling = enByGroup.get(group);
        if (!sibling) continue;
        const siblingId = typeof sibling.id === "string" ? sibling.id : "";
        const siblingSeo = (sibling.seo as { image?: unknown } | undefined)?.image;
        const fallbackImage =
          (siblingId ? enSeoImages.get(siblingId) : "") ||
          resolveSeoImageUrl(siblingSeo, resolveMediaUrl) ||
          safeHttpsUrl(sibling.poster_url);
        if (fallbackImage) covers.set(id, fallbackImage);
      }
    }
  }

  for (const entry of entries) {
    const id = typeof entry.data.id === "string" ? entry.data.id : "";
    if (!id || covers.has(id)) continue;
    covers.set(id, safeHttpsUrl(entry.data.poster_url));
  }

  return covers;
}
