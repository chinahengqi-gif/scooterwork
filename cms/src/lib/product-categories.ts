import { getEmDashCollection } from "emdash";
import type { Locale } from "../../../src/i18n";

type ResolveMediaUrl = (storageKey: string) => string;

function imageUrl(value: unknown, resolveMediaUrl?: ResolveMediaUrl) {
  if (typeof value !== "object" || value === null) return "";
  const image = value as { src?: unknown; meta?: { storageKey?: unknown } };
  const storageKey = image.meta?.storageKey;
  try {
    const source = (typeof storageKey === "string" && storageKey && resolveMediaUrl?.(storageKey)) || image.src;
    if (typeof source !== "string" || !source) return "";
    const url = new URL(source, "https://guides.scooter.work");
    return url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
}

export async function productCategories(locale: Locale, resolveMediaUrl?: ResolveMediaUrl) {
  const base = await getEmDashCollection("product_categories", { locale: "en", limit: 1000, orderBy: { sort_order: "asc", title: "asc" } });
  if (base.error) throw new Error("Product categories unavailable");
  const translated = locale === "en" ? base : await getEmDashCollection("product_categories", { locale, limit: 1000 });
  if (translated.error) throw new Error("Product translations unavailable");
  const entries = new Map(translated.entries.map(entry => [entry.data.translationGroup, entry]));
  return base.entries.filter(entry => entry.data.enabled === true || entry.data.enabled === 1).map(entry => {
    const localized = entries.get(entry.data.translationGroup) || entry;
    return {
      slug: String(entry.data.slug),
      name: String(localized.data.title || entry.data.title || ""),
      description: String(localized.data.description || ""),
      image: imageUrl(entry.data.image, resolveMediaUrl),
      alt: String(localized.data.image_alt || localized.data.title || ""),
    };
  });
}
