import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";
import { localizedPath, type Locale } from "../../../../src/i18n";
import { guideCovers } from "../../lib/guide-covers";

const pageSize = 10;
const headers = {
  "Access-Control-Allow-Origin": "https://scooter.work",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function readPage(locale: Locale, offset: number) {
  return getEmDashCollection("guides", {
    status: "published",
    locale,
    limit: pageSize,
    offset,
    orderBy: { published_at: "desc", id: "desc" },
  });
}

export const GET: APIRoute = async ({ url, locals }) => {
  const requested = url.searchParams.get("locale");
  let locale: Locale = requested === "de" || requested === "fr" ? requested : "en";
  const page = Number(url.searchParams.get("page") ?? "1");
  const offset = (page - 1) * pageSize;
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(page) || page < 1) {
    return Response.json({ error: "Invalid page" }, { status: 400, headers });
  }

  let result = await readPage(locale, offset);
  if (!result.error && !result.entries.length && page === 1 && locale !== "en") {
    locale = "en";
    result = await readPage(locale, offset);
  }
  if (result.error) {
    return Response.json({ error: "Recent articles unavailable" }, { status: 503, headers });
  }

  const covers = await guideCovers(result.entries, {
    db: locals.emdash?.db,
    locale,
    resolveMediaUrl: locals.emdash?.getPublicMediaUrl,
  });

  const articles = result.entries.map(({ id, data }) => ({
    title: String(data.title || ""),
    summary: String(data.summary || ""),
    path: localizedPath(locale, `articles/${encodeURIComponent(String(data.slug || id.split("/").pop()))}/`),
    publishedAt: data.publishedAt ?? null,
    image: covers.get(String(data.id || "")) || "",
  }));
  return Response.json({ articles, locale, hasMore: Boolean(result.hasMore) }, { headers });
};
