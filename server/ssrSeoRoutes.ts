/**
 * Server-Side Rendered routes for SEO-critical public pages.
 *
 * These routes intercept requests BEFORE Vite's catch-all and return
 * complete HTML so Googlebot indexes real content (not an empty SPA shell).
 *
 * Registered first in `registerRoutes()` in server/routes.ts.
 */
import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import {
  ssrHtmlShell,
  sendSsrHtml,
  escapeHtml,
  escapeAttr,
  stripTags,
  truncate,
  BRAND,
} from "./ssrShared";

const BASE_URL = BRAND.baseUrl;

/* ──────────────────────────────────────────────────────────────────────────
 * Shared schema builders
 * ────────────────────────────────────────────────────────────────────────── */

function travelAgencySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Amon Tour",
    url: BASE_URL,
    logo: `${BASE_URL}/Logo%20Long%20Blue.png`,
    image: `${BASE_URL}/Logo%20Long%20Blue.png`,
    description:
      "Krabi-based travel agency offering authentic private tours in southern Thailand with French and English-speaking guides since 2013.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ao Nang",
      addressLocality: "Krabi",
      addressRegion: "Krabi Province",
      postalCode: "81180",
      addressCountry: "TH",
    },
    geo: { "@type": "GeoCoordinates", latitude: 8.0319, longitude: 98.8254 },
    telephone: BRAND.phoneIntl,
    email: BRAND.email,
    areaServed: { "@type": "Country", name: "Thailand" },
    availableLanguage: ["English", "French", "Thai"],
    currenciesAccepted: "THB, USD, EUR",
    priceRange: "$$",
    sameAs: [
      "https://www.facebook.com/amontourkrabi",
      "https://www.instagram.com/amon_tour_thailand/",
    ],
  };
}

function breadcrumbSchema(items: Array<{ label: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

function absoluteUrl(maybeRelative: string | null | undefined): string | undefined {
  if (!maybeRelative) return undefined;
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  return `${BASE_URL}${maybeRelative.startsWith("/") ? "" : "/"}${maybeRelative}`;
}

function tourTripSchema(tour: {
  id: number | string;
  title: string;
  description: string;
  price: number;
  duration: string;
  imageUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: stripTags(tour.description).slice(0, 500),
    image: absoluteUrl(tour.imageUrl),
    url: `${BASE_URL}/tour-details/${tour.id}`,
    provider: {
      "@type": "TravelAgency",
      name: "Amon Tour",
      url: BASE_URL,
    },
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: "THB",
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/tour-details/${tour.id}`,
    },
    duration: tour.duration,
    touristType: ["Family", "Couple", "Adventure"],
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Page bodies
 * ────────────────────────────────────────────────────────────────────────── */

function tourCardHtml(tour: { id: number; title: string; shortDescription: string; price: number; duration: string; imageUrl?: string | null; }): string {
  const img = tour.imageUrl
    ? `<img src="${escapeAttr(tour.imageUrl)}" alt="${escapeAttr(tour.title)}" loading="lazy" />`
    : "";
  return `
    <article class="card">
      <div class="card-img">${img}</div>
      <div class="card-body">
        <h3 class="card-title"><a href="/tour-details/${tour.id}">${escapeHtml(tour.title)}</a></h3>
        <div class="card-meta">${escapeHtml(tour.duration)} · From ${tour.price.toLocaleString()} THB</div>
        <p class="card-desc">${escapeHtml(truncate(stripTags(tour.shortDescription || ""), 160))}</p>
        <a class="card-cta" href="/tour-details/${tour.id}">View tour →</a>
      </div>
    </article>`;
}

async function safeGetTours() {
  try {
    return await storage.getTours();
  } catch (e) {
    console.error("[SSR] Failed to fetch tours:", e);
    return [];
  }
}

async function safeGetTour(id: number) {
  try {
    return await storage.getTour(id);
  } catch (e) {
    console.error(`[SSR] Failed to fetch tour ${id}:`, e);
    return undefined;
  }
}

async function safeGetBlogPosts() {
  try {
    return await storage.getBlogPosts({ status: "published" });
  } catch (e) {
    console.error("[SSR] Failed to fetch blog posts:", e);
    return [];
  }
}

/* ────────────────────────── HOMEPAGE ────────────────────────── */

async function ssrHome(_req: Request, res: Response) {
  const tours = await safeGetTours();
  const featured = tours.filter((t) => t.featured).slice(0, 6);
  const display = featured.length > 0 ? featured : tours.slice(0, 6);

  const toursHtml = display.length
    ? `<div class="card-grid">${display.map(tourCardHtml).join("")}</div>`
    : `<p>Discover our private tours and excursions in Krabi and southern Thailand. <a href="/contact">Contact us</a> to plan your trip.</p>`;

  const bodyHtml = `
    <p class="intro">Welcome to Amon Tour — a Krabi-based travel agency run by French and English-speaking guides since 2013. We design authentic private tours and excursions across southern Thailand: Krabi, Phi Phi Islands, Phang Nga Bay, Railay Beach and beyond. Our small-team, personalised approach is loved by travellers from Malaysia, Singapore, Australia and around the world.</p>

    <div class="cta-row">
      <a class="btn btn-primary" href="/tours">Browse our tours</a>
      <a class="btn btn-gold" href="/custom-tour">Plan a custom trip</a>
    </div>

    <section class="section">
      <h2>Featured private tours from Krabi</h2>
      ${toursHtml}
    </section>

    <section class="section">
      <h2>Top destinations we cover</h2>
      <div class="card-grid">
        <article class="card"><div class="card-body">
          <h3 class="card-title"><a href="/destinations/koh-phi-phi">Koh Phi Phi</a></h3>
          <p class="card-desc">Maya Bay, Viking Cave, snorkeling — discover the Phi Phi Islands on a private boat from Ao Nang.</p>
          <a class="card-cta" href="/destinations/koh-phi-phi">Learn more →</a>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title"><a href="/destinations/phang-nga-bay">Phang Nga Bay</a></h3>
          <p class="card-desc">James Bond Island, sea-cave kayaking and the floating village of Ko Panyi from Krabi.</p>
          <a class="card-cta" href="/destinations/phang-nga-bay">Learn more →</a>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title"><a href="/destinations/railay-beach">Railay Beach</a></h3>
          <p class="card-desc">Reachable only by longtail boat — discover Railay's iconic limestone cliffs and Phra Nang Cave Beach.</p>
          <a class="card-cta" href="/destinations/railay-beach">Learn more →</a>
        </div></article>
      </div>
      <p style="margin-top:1rem"><a class="btn btn-primary" href="/destinations">Explore all our destinations →</a></p>
    </section>

    <section class="section">
      <h2>Why choose Amon Tour?</h2>
      <ul>
        <li><strong>Private, small-group tours:</strong> no mass tourism — your day, your pace.</li>
        <li><strong>French & English-speaking guides:</strong> direct communication, no language barrier.</li>
        <li><strong>Krabi-based since 2013:</strong> deep local knowledge of beaches, islands and hidden gems.</li>
        <li><strong>Easy booking:</strong> talk to a real human on <a href="https://wa.me/${BRAND.whatsappIntl}" rel="noopener">WhatsApp</a>.</li>
      </ul>
    </section>`;

  const html = ssrHtmlShell({
    title: "Amon Tour — Private Tours in Krabi Thailand | French & English Guides",
    description:
      "Krabi-based travel agency offering private tours in southern Thailand: Phi Phi, Phang Nga Bay, Railay, James Bond Island. French and English-speaking guides since 2013. Ideal for travellers from Malaysia, Singapore, Australia and worldwide.",
    path: "/",
    h1: "Private tours in Krabi, Thailand",
    bodyHtml,
    schemaJsons: [travelAgencySchema()],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── TOURS LISTING ────────────────────────── */

async function ssrTours(_req: Request, res: Response) {
  const tours = await safeGetTours();

  const bodyHtml = tours.length
    ? `
      <p class="intro">Discover all our private tours and excursions departing from Krabi. Each tour can be fully customised — contact us to adjust the itinerary, add hotel pickup or change the dates.</p>
      <div class="card-grid">${tours.map(tourCardHtml).join("")}</div>
      <div class="cta-row">
        <a class="btn btn-primary" href="/custom-tour">Don't see what you want? Build a custom tour</a>
        <a class="btn btn-gold" href="/destinations">Explore our destinations</a>
      </div>`
    : `<p>Our tour list is being updated. Please <a href="/contact">contact us</a> for current availability.</p>`;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: tours.slice(0, 30).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: tourTripSchema(t),
    })),
  };

  const html = ssrHtmlShell({
    title: "Private Tours in Krabi | Amon Tour Thailand",
    description:
      "Browse all private tours and excursions from Krabi: Phi Phi Islands, Phang Nga Bay, Railay, 4-island tour, sunset cruise, kayaking, jungle trekking and more. Book your private tour in southern Thailand.",
    path: "/tours",
    h1: "Private tours and excursions in Krabi",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Tours" }],
    schemaJsons: [
      itemListSchema,
      breadcrumbSchema([
        { label: "Home", url: "/" },
        { label: "Tours", url: "/tours" },
      ]),
    ],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── INDIVIDUAL TOUR ────────────────────────── */

async function ssrTourDetail(req: Request, res: Response) {
  const idStr = req.params.id;
  const id = Number.parseInt(idStr, 10);

  if (!Number.isFinite(id) || id <= 0) {
    return res.status(404).type("text/html").send("<h1>Tour not found</h1>");
  }

  const tour = await safeGetTour(id);
  if (!tour) {
    const html = ssrHtmlShell({
      title: "Tour not found | Amon Tour",
      description: "The tour you're looking for is not available. Browse our other private tours from Krabi or contact us.",
      path: `/tour-details/${id}`,
      h1: "Tour not found",
      bodyHtml: `<p>This tour is not currently available. <a href="/tours">View all our tours</a> or <a href="/contact">contact us</a> for help.</p>`,
    });
    return sendSsrHtml(res, html, 404);
  }

  const childPriceLine = tour.childPrice
    ? `<li><strong>Child price:</strong> ${tour.childPrice.toLocaleString()} THB</li>`
    : "";

  const descHtml = tour.description.includes("<")
    ? tour.description
    : `<p>${escapeHtml(tour.description).replace(/\n\n/g, "</p><p>")}</p>`;

  const bodyHtml = `
    <section class="section">
      ${tour.imageUrl ? `<img src="${escapeAttr(tour.imageUrl)}" alt="${escapeAttr(tour.title)}" style="border-radius:.75rem;max-height:480px;object-fit:cover;width:100%" loading="eager" />` : ""}
    </section>

    <section class="section">
      <h2>About this tour</h2>
      ${descHtml}
    </section>

    <section class="section">
      <h2>At a glance</h2>
      <ul>
        <li><strong>Duration:</strong> ${escapeHtml(tour.duration)}</li>
        <li><strong>Adult price:</strong> ${tour.price.toLocaleString()} THB</li>
        ${childPriceLine}
        <li><strong>Departure:</strong> Ao Nang, Krabi (hotel pickup available)</li>
        <li><strong>Languages:</strong> English, French, Thai</li>
      </ul>
    </section>

    <section class="section">
      <h2>Book this tour</h2>
      <p>Talk directly to one of our guides — we usually reply on WhatsApp within an hour.</p>
      <div class="cta-row">
        <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent(`Hi! I'm interested in the "${tour.title}" tour.`)}" rel="noopener" target="_blank">WhatsApp us</a>
        <a class="btn btn-primary" href="/contact">Contact form</a>
        <a class="btn btn-primary" href="/tours">All tours</a>
      </div>
    </section>`;

  const breadcrumbs = [
    { label: "Home", url: "/" },
    { label: "Tours", url: "/tours" },
    { label: tour.title },
  ];

  const html = ssrHtmlShell({
    title: truncate(`${tour.title} | Private Tour Krabi — Amon Tour`, 70),
    description: truncate(stripTags(tour.shortDescription || tour.description), 320),
    path: `/tour-details/${id}`,
    h1: tour.title,
    bodyHtml,
    metaImage: tour.imageUrl || undefined,
    breadcrumbs,
    schemaJsons: [
      tourTripSchema(tour),
      breadcrumbSchema([
        { label: "Home", url: "/" },
        { label: "Tours", url: "/tours" },
        { label: tour.title, url: `/tour-details/${id}` },
      ]),
    ],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── EXPERIENCES ────────────────────────── */

async function ssrExperiences(_req: Request, res: Response) {
  const experiences = [
    {
      title: "Island hopping by private long-tail boat",
      desc: "Visit the 4 Islands, Bamboo Island or hidden lagoons at your own pace, with no fixed schedule and no crowds.",
    },
    {
      title: "Sea-kayaking & bivouac at Thalane",
      desc: "Paddle through pristine mangroves to a secret lagoon and spend a night on a deserted beach in Phang Nga.",
    },
    {
      title: "Cultural visits & Thai cooking",
      desc: "Meet a local family, visit a temple off the tourist trail and learn Thai cooking with seasonal Krabi ingredients.",
    },
    {
      title: "Jungle trekking in Khao Sok",
      desc: "Discover one of the oldest rainforests in the world, sleep in floating bungalows on Cheow Lan Lake.",
    },
    {
      title: "Catamaran sunsets",
      desc: "Private catamaran charter for couples, families and small groups — sail past Krabi's limestone cliffs at sunset.",
    },
    {
      title: "Family-friendly adventures",
      desc: "Tailored programmes for families — easy snorkeling spots, safe beaches, kid-friendly meals and pace.",
    },
  ];

  const cards = experiences
    .map(
      (e) => `
    <article class="card"><div class="card-body">
      <h3 class="card-title">${escapeHtml(e.title)}</h3>
      <p class="card-desc">${escapeHtml(e.desc)}</p>
    </div></article>`
    )
    .join("");

  const bodyHtml = `
    <p class="intro">Beyond classic boat tours, Amon Tour designs deeper, more authentic experiences in Krabi and southern Thailand. Whether you're a couple, a family, or a small group of friends, here are some of the experiences we love organising.</p>
    <div class="card-grid">${cards}</div>
    <div class="cta-row">
      <a class="btn btn-primary" href="/custom-tour">Build your own experience</a>
      <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}" rel="noopener" target="_blank">WhatsApp us</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Authentic Experiences in Krabi & Southern Thailand | Amon Tour",
    description:
      "Authentic Thai experiences from Krabi: private island hopping, sea-kayaking and bivouac at Thalane, cultural visits, Thai cooking, Khao Sok jungle trekking, sunset catamaran. Designed by French & English-speaking guides.",
    path: "/experiences",
    h1: "Authentic experiences in Krabi & southern Thailand",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Experiences" }],
    schemaJsons: [
      breadcrumbSchema([
        { label: "Home", url: "/" },
        { label: "Experiences", url: "/experiences" },
      ]),
    ],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── CUSTOM TOUR ────────────────────────── */

async function ssrCustomTour(_req: Request, res: Response) {
  const bodyHtml = `
    <p class="intro">No fixed itinerary fits you perfectly? Let's design a private tour just for you. Tell us when you're coming, who you're travelling with and what you'd like to see — we'll send you a personalised proposal within 24 hours.</p>

    <section class="section">
      <h2>How it works</h2>
      <ol>
        <li><strong>Tell us about your trip</strong> — destinations, dates, group size, interests, budget. Use the form below or message us on <a href="https://wa.me/${BRAND.whatsappIntl}" rel="noopener">WhatsApp</a>.</li>
        <li><strong>We design your itinerary</strong> — a French or English-speaking guide will craft a day-by-day proposal with detailed pricing.</li>
        <li><strong>You confirm and travel</strong> — we handle bookings, hotel pickup, transfers, guides and any last-minute change.</li>
      </ol>
    </section>

    <section class="section">
      <h2>What you can include</h2>
      <ul>
        <li>Krabi islands (Phi Phi, Hong Islands, 4 Islands, Bamboo Island)</li>
        <li>Phang Nga Bay & James Bond Island</li>
        <li>Khao Sok rainforest & Cheow Lan Lake</li>
        <li>Multi-day Krabi → Khao Lak → Phuket trips</li>
        <li>Cultural experiences, Thai cooking, family activities</li>
        <li>Honeymoon, anniversary or wedding-celebration packages</li>
      </ul>
    </section>

    <div class="cta-row">
      <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent("Hi Amon Tour, I'd like to plan a custom trip in Thailand.")}" rel="noopener" target="_blank">Start on WhatsApp</a>
      <a class="btn btn-primary" href="/contact">Contact form</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Custom Private Tour in Thailand | Plan Your Trip — Amon Tour Krabi",
    description:
      "Design your custom private tour in Thailand with Amon Tour. Tell us about your trip and a French or English-speaking guide will send a personalised itinerary within 24 hours. Krabi, Phi Phi, Phang Nga, Khao Sok and beyond.",
    path: "/custom-tour",
    h1: "Plan your custom private tour in Thailand",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Custom Tour" }],
    schemaJsons: [
      breadcrumbSchema([
        { label: "Home", url: "/" },
        { label: "Custom Tour", url: "/custom-tour" },
      ]),
    ],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── CONTACT ────────────────────────── */

async function ssrContact(_req: Request, res: Response) {
  const bodyHtml = `
    <p class="intro">Talk to a real human at Amon Tour — we usually reply within an hour on WhatsApp. Our team speaks English, French and Thai.</p>

    <section class="section">
      <h2>Get in touch</h2>
      <ul>
        <li><strong>WhatsApp:</strong> <a href="https://wa.me/${BRAND.whatsappIntl}" rel="noopener" target="_blank">${escapeHtml(BRAND.whatsapp)}</a> — fastest reply</li>
        <li><strong>Phone:</strong> <a href="tel:${escapeAttr(BRAND.phoneIntl)}">${escapeHtml(BRAND.phone)}</a></li>
        <li><strong>Email:</strong> <a href="mailto:${escapeAttr(BRAND.email)}">${escapeHtml(BRAND.email)}</a></li>
        <li><strong>Office:</strong> ${escapeHtml(BRAND.addressLine1)}, ${escapeHtml(BRAND.addressLine2)}</li>
      </ul>
    </section>

    <section class="section">
      <h2>Office hours</h2>
      <p>We answer messages 7 days a week from 8:00 to 21:00 (ICT, GMT+7). Office visits by appointment.</p>
    </section>

    <section class="section">
      <h2>For travellers from Malaysia, Singapore & Australia</h2>
      <p>We work daily with travellers from Kuala Lumpur, Singapore, Sydney and Melbourne. Tell us your home city and language preference — we'll match you with the right guide.</p>
    </section>`;

  const contactPointSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Amon Tour",
    url: `${BASE_URL}/contact`,
    mainEntity: {
      "@type": "TravelAgency",
      name: "Amon Tour",
      telephone: BRAND.phoneIntl,
      email: BRAND.email,
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: BRAND.phoneIntl,
          contactType: "customer service",
          availableLanguage: ["English", "French", "Thai"],
          areaServed: "TH",
        },
      ],
    },
  };

  const html = ssrHtmlShell({
    title: "Contact Amon Tour Krabi — WhatsApp, Phone, Email",
    description:
      "Contact Amon Tour, your Krabi-based travel agency. WhatsApp +66 86 476 3804, phone +66 81 956 2849, email contact@amon-tour.com. We answer in English, French and Thai.",
    path: "/contact",
    h1: "Contact Amon Tour",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Contact" }],
    schemaJsons: [
      contactPointSchema,
      breadcrumbSchema([
        { label: "Home", url: "/" },
        { label: "Contact", url: "/contact" },
      ]),
    ],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── BLOG LISTING ────────────────────────── */

async function ssrBlog(_req: Request, res: Response) {
  const posts = await safeGetBlogPosts();

  const postsHtml = posts.length
    ? `<div class="card-grid">${posts
        .slice(0, 24)
        .map((p) => {
          const url = `/blog/${p.slug}`;
          const img = p.coverImage
            ? `<img src="${escapeAttr(p.coverImage)}" alt="${escapeAttr(p.title)}" loading="lazy" />`
            : "";
          const excerpt = p.excerpt ? stripTags(p.excerpt) : stripTags(p.content).slice(0, 180);
          return `
          <article class="card">
            <div class="card-img">${img}</div>
            <div class="card-body">
              <h3 class="card-title"><a href="${escapeAttr(url)}">${escapeHtml(p.title)}</a></h3>
              <p class="card-desc">${escapeHtml(truncate(excerpt, 180))}</p>
              <a class="card-cta" href="${escapeAttr(url)}">Read article →</a>
            </div>
          </article>`;
        })
        .join("")}</div>`
    : `<p>New articles coming soon. Meanwhile, browse our <a href="/tours">private tours</a> or <a href="/destinations">destinations</a>.</p>`;

  const bodyHtml = `
    <p class="intro">Travel tips, stories and practical guides for visiting Krabi, the Phi Phi Islands, Phang Nga Bay and southern Thailand — from the team that lives here.</p>
    ${postsHtml}`;

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Amon Tour Travel Blog",
    url: `${BASE_URL}/blog`,
    description: "Travel tips and guides about Krabi and southern Thailand by Amon Tour.",
    publisher: {
      "@type": "TravelAgency",
      name: "Amon Tour",
    },
  };

  const html = ssrHtmlShell({
    title: "Travel Blog — Krabi, Phi Phi, Phang Nga | Amon Tour",
    description:
      "Travel blog about Krabi and southern Thailand: practical tips for visiting Phi Phi, Phang Nga Bay, Railay, best season, what to pack, family travel and more — from a local Krabi-based agency.",
    path: "/blog",
    h1: "Travel blog: Krabi & southern Thailand",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Blog" }],
    schemaJsons: [
      blogSchema,
      breadcrumbSchema([
        { label: "Home", url: "/" },
        { label: "Blog", url: "/blog" },
      ]),
    ],
  });
  sendSsrHtml(res, html);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Crawler detection (dynamic rendering)
 *
 * SSR HTML is served only to search-engine crawlers and social-media
 * preview bots. Real browsers fall through to the existing React SPA, so
 * the interactive user experience is preserved unchanged.
 *
 * Detection is based on the User-Agent header; bots almost universally
 * identify themselves and respect this convention.
 * ────────────────────────────────────────────────────────────────────── */

const BOT_UA_REGEX = new RegExp(
  [
    "googlebot", "google-inspectiontool", "google-extended", "bingbot", "slurp",
    "duckduckbot", "baiduspider", "yandex", "sogou", "exabot",
    "facebookexternalhit", "facebot", "twitterbot", "linkedinbot",
    "embedly", "quora link preview", "showyoubot", "outbrain", "pinterest",
    "slackbot", "vkshare", "w3c_validator", "redditbot", "applebot",
    "whatsapp", "flipboard", "tumblr", "bitlybot", "skypeuripreview",
    "nuzzel", "discordbot", "google page speed", "qwantify", "petalbot",
    "bytespider", "telegrambot", "ahrefsbot", "semrushbot", "mj12bot",
    "dotbot", "screaming frog", "rogerbot", "sitebulb", "lighthouse",
    "chrome-lighthouse", "headlesschrome", "snapchat", "viber",
    "yahoo! slurp", "ia_archiver",
    // Generic catch-alls (always last so specific matches win in logs)
    "bot/", "crawler", "spider", "headless",
  ].join("|"),
  "i"
);

export function isCrawler(ua: string | undefined): boolean {
  if (!ua) return false;
  return BOT_UA_REGEX.test(ua);
}

function ssrIfBot(handler: (req: Request, res: Response) => Promise<unknown> | unknown) {
  return async (req: Request, res: Response, next: import("express").NextFunction) => {
    const ua = req.get("user-agent") || "";
    // Allow forcing SSR for testing via ?_ssr=1 query
    const force = req.query._ssr === "1";
    if (!force && !isCrawler(ua)) {
      return next();
    }
    try {
      await handler(req, res);
    } catch (err) {
      console.error("[SSR] handler error:", err);
      next(err);
    }
  };
}

export function registerSsrRoutes(app: Express): void {
  app.get("/", ssrIfBot(ssrHome));
  app.get("/tours", ssrIfBot(ssrTours));
  app.get("/tour-details/:id", ssrIfBot(ssrTourDetail));
  app.get("/experiences", ssrIfBot(ssrExperiences));
  app.get("/custom-tour", ssrIfBot(ssrCustomTour));
  app.get("/contact", ssrIfBot(ssrContact));
  app.get("/blog", ssrIfBot(ssrBlog));
}
