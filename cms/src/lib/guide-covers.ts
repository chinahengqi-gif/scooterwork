import { env } from "cloudflare:workers";
import { getEmDashCollection } from "emdash";
import type { Locale } from "../../../src/i18n";

type ResolveMediaUrl = (storageKey: string) => string;

const INTERNAL_MEDIA_PREFIX = "/_emdash/api/media/file/";
const VIDEO_PATH_RE = /\.(mp4|webm|mov|m4v|ogv)$/i;
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

function safeImageUrl(value: unknown): string {
  const url = safeHttpsUrl(value);
  if (!url) return "";
  return VIDEO_PATH_RE.test(new URL(url).pathname) ? "" : url;
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
  contentIds: string[],
  resolveMediaUrl?: ResolveMediaUrl,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const d1 = (env as unknown as { DB?: D1Database }).DB;
  if (!d1 || !contentIds.length) return map;
  const uniqueIds = [...new Set(contentIds)];

  for (let index = 0; index < uniqueIds.length; index += SQL_CHUNK_SIZE) {
    const chunk = uniqueIds.slice(index, index + SQL_CHUNK_SIZE);
    const placeholders = chunk.map(() => "?").join(", ");
    const { results } = await d1
      .prepare(`SELECT content_id, seo_image FROM _emdash_seo WHERE collection = 'guides' AND content_id IN (${placeholders})`)
      .bind(...chunk)
      .all<{ content_id: string; seo_image: string | null }>();
    for (const row of results ?? []) {
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
  const { locale, resolveMediaUrl } = options;
  const covers = new Map<string, string>();
  if (!entries.length) return covers;

  const ids = entries
    .map((entry) => entry.data.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  const seoImages = await queryGuideSeoImages(ids, resolveMediaUrl);

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
      const enSeoImages = await queryGuideSeoImages(matchedEnIds, resolveMediaUrl);

      for (const { id, group } of missingGroups) {
        const sibling = enByGroup.get(group);
        if (!sibling) continue;
        const siblingId = typeof sibling.id === "string" ? sibling.id : "";
        const siblingSeo = (sibling.seo as { image?: unknown } | undefined)?.image;
        const fallbackImage =
          (siblingId ? enSeoImages.get(siblingId) : "") ||
          resolveSeoImageUrl(siblingSeo, resolveMediaUrl) ||
          safeImageUrl(sibling.poster_url);
        if (fallbackImage) covers.set(id, fallbackImage);
      }
    }
  }

  for (const entry of entries) {
    const id = typeof entry.data.id === "string" ? entry.data.id : "";
    if (!id || covers.has(id)) continue;
    covers.set(id, safeImageUrl(entry.data.poster_url));
  }

  return covers;
}
