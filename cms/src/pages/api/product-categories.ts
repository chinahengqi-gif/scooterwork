import type { APIRoute } from "astro";
import { productCategories } from "../../lib/product-categories";

export const GET: APIRoute = async ({ url }) => {
  const requested = url.searchParams.get("locale");
  const locale = requested === "de" || requested === "fr" ? requested : "en";
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "https://scooter.work",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  try {
    return new Response(JSON.stringify({ products: await productCategories(locale) }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: "Product categories unavailable" }), { status: 503, headers });
  }
};
