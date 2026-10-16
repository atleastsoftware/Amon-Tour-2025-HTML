const origin = "https://www.tourninja.io";
const slug = "amon-tour";
function publicImage(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value, origin);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
/** Only the agency's deliberately published projection is consumed. No credentials. */
export function publishedTours(view) {
  if (!view || view.demo || view.config?.slug !== slug || !Array.isArray(view.products) || view.products.length > 1000)
    throw new Error("Invalid published agency catalogue");
  return view.products.map(product => {
    if (typeof product.id !== "string" || !product.id || typeof product.name !== "string" ||
      !/^[A-Z]{3}$/.test(product.currency) || !Number.isSafeInteger(product.price) || product.price < 0)
      throw new Error("Invalid published offer");
    const decimals = new Intl.NumberFormat("en", { style: "currency", currency: product.currency })
      .resolvedOptions().maximumFractionDigits;
    const images = [...new Set([product.image, ...(Array.isArray(product.photos) ? product.photos : [])]
      .map(publicImage).filter(Boolean))];
    const url = origin + "/embed/" + slug + "?offer=" + encodeURIComponent(product.id);
    return {
      id: product.id, externalId: product.id, name: product.name,
      description: String(product.description ?? ""), shortDescription: String(product.description ?? "").slice(0, 150),
      currency: product.currency, price: product.price / (10 ** decimals),
      duration: String(product.duration ?? ""), location: String(product.destination ?? ""),
      category: String(product.category ?? ""), images, primaryImage: images[0] ?? null,
      originalPrimaryImage: images[0] ?? null, presentationImageUrl: images[0] ?? null,
      bookingUrl: url, detailsUrl: url, presentationUrl: url, isActive: true,
    };
  });
}
export async function loadPublishedTours(language, fetcher = globalThis.fetch) {
  const response = await fetcher(origin + "/api/public/sites/" + slug, {
    redirect: "error", signal: AbortSignal.timeout(10_000),
    headers: { Accept: "application/json", "Accept-Language": language === "fr" ? "fr" : "en" },
  });
  if (!response.ok) throw new Error("Published agency catalogue unavailable");
  return publishedTours(await response.json());
}
