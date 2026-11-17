import { getEmDashCollection } from "emdash";
import type { Locale } from "../../../src/i18n";

export function imageUrl(value: unknown) {
  const source = typeof value === "object" && value !== null ? (value as { src?: unknown }).src : undefined;
  if (typeof source !== "string") return "";
  try {
    const url = new URL(source, "https://guides.scooter.work");
    return url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
}

export async function productCategories(locale: Locale) {
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
      image: imageUrl(entry.data.image),
      alt: String(localized.data.image_alt || localized.data.title || ""),
    };
  });
}
