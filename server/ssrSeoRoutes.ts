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
    logo: `${BASE_URL}/favicon.png`,
    image: `${BASE_URL}/amon-tour-team.jpg`,
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
    url: `${BASE_URL}/tour-detail/${tour.id}`,
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
      url: `${BASE_URL}/tour-detail/${tour.id}`,
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
        <h3 class="card-title"><a href="/tour-detail/${tour.id}">${escapeHtml(tour.title)}</a></h3>
        <div class="card-meta">${escapeHtml(tour.duration)} · From ${tour.price.toLocaleString()} THB</div>
        <p class="card-desc">${escapeHtml(truncate(stripTags(tour.shortDescription || ""), 160))}</p>
        <a class="card-cta" href="/tour-detail/${tour.id}">View tour →</a>
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

async function safeGetBlogPostBySlug(slug: string) {
  try {
    return await storage.getBlogPostBySlug(slug);
  } catch (e) {
    console.error(`[SSR] Failed to fetch blog post by slug "${slug}":`, e);
    return undefined;
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
      path: `/tour-detail/${id}`,
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
    path: `/tour-detail/${id}`,
    h1: tour.title,
    bodyHtml,
    metaImage: tour.imageUrl || undefined,
    breadcrumbs,
    schemaJsons: [
      tourTripSchema(tour),
      breadcrumbSchema([
        { label: "Home", url: "/" },
        { label: "Tours", url: "/tours" },
        { label: tour.title, url: `/tour-detail/${id}` },
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

/* ────────────────────────── BLOG POST (individual) ────────────────────────── */

async function ssrBlogPost(req: Request, res: Response) {
  const slug = req.params.slug;
  const post = await safeGetBlogPostBySlug(slug);

  if (!post) {
    const html = ssrHtmlShell({
      title: "Article not found | Amon Tour Blog",
      description: "This article is not available. Browse our travel blog about Krabi and southern Thailand.",
      path: `/blog/${slug}`,
      h1: "Article not found",
      bodyHtml: `<p>This article is not currently available. <a href="/blog">Browse all articles</a> or <a href="/contact">contact us</a>.</p>`,
    });
    return sendSsrHtml(res, html, 404);
  }

  const coverImg = post.coverImage
    ? `<img src="${escapeAttr(post.coverImage)}" alt="${escapeAttr(post.imageAltText || post.title)}" style="border-radius:.75rem;max-height:480px;object-fit:cover;width:100%" loading="eager" />`
    : "";

  const tagListHtml = post.tags && post.tags.length
    ? `<div class="tag-list">${post.tags.map((t) => `<span class="tag">${escapeHtml(t.name)}</span>`).join("")}</div>`
    : "";

  const contentHtml = post.content.includes("<")
    ? post.content
    : `<p>${escapeHtml(post.content).replace(/\n\n/g, "</p><p>")}</p>`;

  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : "";

  const bodyHtml = `
    <div class="section">${coverImg}</div>

    <div class="section">
      <p class="card-meta">
        ${dateStr ? `<time datetime="${escapeAttr(String(post.createdAt))}">${escapeHtml(dateStr)}</time>` : ""}
        ${post.authorName ? ` · By ${escapeHtml(post.authorName)}` : ""}
        ${post.category ? ` · ${escapeHtml(post.category.name)}` : ""}
      </p>
      ${tagListHtml}
    </div>

    <div class="section">${contentHtml}</div>

    <div class="section">
      <h2>Plan your trip to Krabi</h2>
      <p>Ready to experience southern Thailand for yourself? Our French and English-speaking guides are available 7 days a week.</p>
      <div class="cta-row">
        <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}" rel="noopener" target="_blank">WhatsApp us</a>
        <a class="btn btn-primary" href="/tours">Browse our tours</a>
        <a class="btn btn-primary" href="/blog">Back to blog</a>
      </div>
    </div>`;

  const description = truncate(
    post.metaDescription || (post.excerpt ? stripTags(post.excerpt) : stripTags(post.content)),
    320,
  );

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: description.slice(0, 200),
    url: `${BASE_URL}/blog/${post.slug}`,
    image: post.coverImage || undefined,
    datePublished: post.createdAt,
    author: { "@type": "Person", name: post.authorName || "Amon Tour" },
    publisher: {
      "@type": "TravelAgency",
      name: "Amon Tour",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/Logo%20Long%20Blue.png` },
    },
  };

  const html = ssrHtmlShell({
    title: truncate(`${post.title} | Amon Tour Blog`, 70),
    description,
    path: `/blog/${post.slug}`,
    h1: post.title,
    bodyHtml,
    metaImage: post.coverImage || undefined,
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Blog", url: "/blog" },
      { label: post.title },
    ],
    schemaJsons: [articleSchema, breadcrumbSchema([
      { label: "Home", url: "/" },
      { label: "Blog", url: "/blog" },
      { label: post.title, url: `/blog/${post.slug}` },
    ])],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── STAYS ────────────────────────── */

async function ssrStays(_req: Request, res: Response) {
  const bodyHtml = `
    <p class="intro">Discover carefully selected accommodations in Thailand — from luxury villas with private pools to authentic beach bungalows and modern city apartments. Each stay is handpicked for comfort, location, and authentic local character.</p>

    <section class="section">
      <h2>Our accommodation selection</h2>
      <div class="card-grid">
        <article class="card"><div class="card-body">
          <h3 class="card-title">Luxury villas with pool</h3>
          <p class="card-desc">Private villas with sea views, infinity pools and full-service housekeeping — ideal for families or couples seeking exclusivity in Krabi or Phuket.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Traditional Thai bungalows</h3>
          <p class="card-desc">Experience an authentic stay surrounded by lush tropical gardens, steps from the beach on Koh Samui, Koh Lanta or Koh Yao Noi.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Boutique hotels in Bangkok</h3>
          <p class="card-desc">Contemporary apartments and boutique hotels ideally located for exploring Bangkok's temples, markets and vibrant neighbourhoods.</p>
        </div></article>
      </div>
    </section>

    <section class="section">
      <h2>Why book accommodation with Amon Tour?</h2>
      <ul>
        <li><strong>Local expertise:</strong> our team knows which properties truly deliver on their promises.</li>
        <li><strong>Bundle with tours:</strong> combine your accommodation with private tours, airport transfers and day trips.</li>
        <li><strong>Personal service:</strong> direct contact with a French or English-speaking guide throughout your stay.</li>
        <li><strong>Best areas:</strong> we advise on the right location for your travel style — Ao Nang, Railay, Koh Lanta and beyond.</li>
      </ul>
    </section>

    <div class="cta-row">
      <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent("Hi! I'm looking for accommodation in Thailand.")}" rel="noopener" target="_blank">Ask us on WhatsApp</a>
      <a class="btn btn-primary" href="/custom-tour">Plan a full trip</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Thailand Accommodations — Villas, Hotels & Bungalows | Amon Tour",
    description:
      "Discover exceptional accommodations in Thailand curated by Amon Tour: luxury villas in Krabi, beachfront bungalows, boutique hotels in Bangkok. Bundle with private tours for the complete Thailand experience.",
    path: "/stays",
    h1: "Thailand accommodations — villas, hotels & bungalows",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Stays" }],
    schemaJsons: [breadcrumbSchema([{ label: "Home", url: "/" }, { label: "Stays", url: "/stays" }])],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── KRABI CELEBRATION ────────────────────────── */

async function ssrKrabiCelebration(_req: Request, res: Response) {
  const bodyHtml = `
    <p class="intro">Celebrate your most important moments in one of the world's most stunning settings. Amon Tour specialises in private celebrations in Krabi — from intimate anniversary dinners on a deserted beach to bespoke wedding days on Railay or Koh Phi Phi.</p>

    <section class="section">
      <h2>Celebrations we organise</h2>
      <div class="card-grid">
        <article class="card"><div class="card-body">
          <h3 class="card-title">Honeymoon experiences</h3>
          <p class="card-desc">Private sunset catamaran, candlelit beach dinners, couples kayaking through sea caves — we design honeymoon days that feel truly extraordinary.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Anniversary getaways</h3>
          <p class="card-desc">Surprise your partner with a private boat charter, a secluded picnic on Phra Nang Cave Beach, or a floating breakfast on Phang Nga Bay.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Birthday celebrations</h3>
          <p class="card-desc">From intimate dinners with live music to group island-hopping adventures — we tailor every detail to the guest of honour.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Family reunions</h3>
          <p class="card-desc">Multi-generation trips with activities for every age — snorkelling, cooking classes, cultural visits and relaxed beach days.</p>
        </div></article>
      </div>
    </section>

    <section class="section">
      <h2>Why celebrate in Krabi?</h2>
      <ul>
        <li>Dramatic limestone cliffs as a natural backdrop for photos and ceremonies.</li>
        <li>Private beaches accessible only by longtail boat — no crowds, no noise.</li>
        <li>Year-round warm weather (best November–April for celebrations).</li>
        <li>World-class Thai cuisine and fresh seafood for celebration dinners.</li>
        <li>French &amp; English-speaking guides who understand European and international guests.</li>
      </ul>
    </section>

    <div class="cta-row">
      <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent("Hi! I'd like to organise a celebration in Krabi.")}" rel="noopener" target="_blank">Plan your celebration</a>
      <a class="btn btn-primary" href="/contact">Contact form</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Events & Celebrations in Krabi — Honeymoon, Anniversary, Birthday | Amon Tour",
    description:
      "Plan your perfect celebration in Krabi, Thailand with Amon Tour. Private honeymoon experiences, anniversary dinners on deserted beaches, birthday island-hopping, and family reunions. French and English-speaking guides.",
    path: "/krabi-celebration",
    h1: "Events & celebrations in Krabi, Thailand",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Celebrations" }],
    schemaJsons: [breadcrumbSchema([{ label: "Home", url: "/" }, { label: "Celebrations", url: "/krabi-celebration" }])],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── BECOME A PARTNER ────────────────────────── */

async function ssrBecomePartner(_req: Request, res: Response) {
  const bodyHtml = `
    <p class="intro">Are you a hotel, resort, travel agent, concierge service or content creator? Partner with Amon Tour to offer your clients exceptional private tours and authentic Thai experiences from Krabi.</p>

    <section class="section">
      <h2>Partnership opportunities</h2>
      <div class="card-grid">
        <article class="card"><div class="card-body">
          <h3 class="card-title">Hotels & resorts</h3>
          <p class="card-desc">Enhance your guests' experience by offering curated day tours and island excursions. We handle all logistics; you provide the recommendation.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Travel agencies</h3>
          <p class="card-desc">Add private Krabi tours to your programme with competitive wholesale rates, reliable on-the-ground service and excellent guest satisfaction.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Concierge & DMCs</h3>
          <p class="card-desc">We work seamlessly with destination management companies and concierge teams — flexible, responsive and always professional.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Content creators</h3>
          <p class="card-desc">Travel bloggers, YouTubers and photographers: collaborate with us to share authentic Krabi experiences with your audience.</p>
        </div></article>
      </div>
    </section>

    <section class="section">
      <h2>What we offer partners</h2>
      <ul>
        <li>Competitive commission structure and wholesale rates.</li>
        <li>Private, English and French-speaking guides since 2013.</li>
        <li>Real-time availability and fast WhatsApp response.</li>
        <li>Fully insured tours with excellent safety record.</li>
        <li>Custom itinerary design for groups and special requests.</li>
      </ul>
    </section>

    <div class="cta-row">
      <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent("Hi! I'm interested in a partnership with Amon Tour.")}" rel="noopener" target="_blank">WhatsApp us</a>
      <a class="btn btn-primary" href="/contact">Send a message</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Partner with Amon Tour Krabi — Hotels, Agencies & Concierge | Amon Tour",
    description:
      "Partner with Amon Tour to offer your clients private tours in Krabi, Thailand. Competitive rates for hotels, travel agencies, DMCs and concierge services. French and English-speaking guides since 2013.",
    path: "/become-partner",
    h1: "Partner with Amon Tour Krabi",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Become a Partner" }],
    schemaJsons: [breadcrumbSchema([{ label: "Home", url: "/" }, { label: "Become a Partner", url: "/become-partner" }])],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── GROUP & CORPORATE ────────────────────────── */

async function ssrGroupCorporate(_req: Request, res: Response) {
  const bodyHtml = `
    <p class="intro">Amon Tour designs bespoke group and corporate travel programmes in Thailand — team building adventures, incentive travel, and multi-day group tours tailored to your company's culture and your team's interests.</p>

    <section class="section">
      <h2>Group travel programmes</h2>
      <div class="card-grid">
        <article class="card"><div class="card-body">
          <h3 class="card-title">Team building</h3>
          <p class="card-desc">Sea-kayaking challenges, cooking competitions, beach Olympics and sunset cruises — activities designed to bring your team closer in a stunning setting.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Incentive travel</h3>
          <p class="card-desc">Reward top performers with unforgettable private island experiences, VIP catamaran charters and exclusive dinners in Krabi.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Conference add-ons</h3>
          <p class="card-desc">Half-day and full-day excursions for conference attendees — Phi Phi Islands, Phang Nga Bay, 4-Islands Tour and more from Krabi.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Large group logistics</h3>
          <p class="card-desc">We coordinate transportation, meals, accommodation and activities for groups from 10 to 200+ participants across southern Thailand.</p>
        </div></article>
      </div>
    </section>

    <section class="section">
      <h2>Why choose Amon Tour for group travel?</h2>
      <ul>
        <li>Experienced in managing groups of 10–200+ participants.</li>
        <li>English and French-speaking coordinators available 7 days a week.</li>
        <li>Full-service logistics: transfers, hotels, meals, activities.</li>
        <li>Competitive group rates and volume discounts.</li>
        <li>Based in Krabi since 2013 — deep local network and contacts.</li>
      </ul>
    </section>

    <div class="cta-row">
      <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent("Hi! I'm interested in group/corporate travel in Thailand.")}" rel="noopener" target="_blank">Get a group quote</a>
      <a class="btn btn-primary" href="/contact">Contact form</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Group & Corporate Travel in Thailand — Team Building & Incentive | Amon Tour",
    description:
      "Group and corporate travel programmes in Thailand by Amon Tour Krabi. Team building, incentive travel, conference excursions and large group logistics across southern Thailand. French and English-speaking coordinators.",
    path: "/group-corporate",
    h1: "Group & corporate travel in Thailand",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Group & Corporate" }],
    schemaJsons: [breadcrumbSchema([{ label: "Home", url: "/" }, { label: "Group & Corporate", url: "/group-corporate" }])],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── BROCHURE ────────────────────────── */

async function ssrBrochure(_req: Request, res: Response) {
  const bodyHtml = `
    <p class="intro">Download the Amon Tour travel brochure — your comprehensive guide to private tours, island excursions and authentic experiences in Krabi and southern Thailand. Available in English and French.</p>

    <section class="section">
      <h2>What's inside the brochure</h2>
      <ul>
        <li>Complete listing of private tours departing from Ao Nang, Krabi.</li>
        <li>Destination guides: Phi Phi Islands, Phang Nga Bay, Railay Beach, 4 Islands, Hong Islands, Thalane Bivouac.</li>
        <li>Practical information: best season to visit, what to pack, transport tips.</li>
        <li>Pricing guidelines and custom tour options.</li>
        <li>French and English editions available.</li>
      </ul>
    </section>

    <section class="section">
      <h2>Plan your Thailand trip</h2>
      <p>Our guides are available on WhatsApp every day from 8:00 to 21:00 (ICT). Share the brochure with your travel companions and then contact us to plan your personalised itinerary.</p>
    </section>

    <div class="cta-row">
      <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent("Hi! I'd like to receive the Amon Tour brochure.")}" rel="noopener" target="_blank">Request brochure on WhatsApp</a>
      <a class="btn btn-primary" href="/tours">Browse our tours</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Download Our Travel Brochure — Krabi Tours Guide | Amon Tour",
    description:
      "Download the Amon Tour travel brochure — comprehensive guide to private tours in Krabi, Thailand. Phi Phi Islands, Phang Nga Bay, Railay Beach and more. Available in English and French.",
    path: "/brochure",
    h1: "Amon Tour travel brochure — Krabi & southern Thailand",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Brochure" }],
    schemaJsons: [breadcrumbSchema([{ label: "Home", url: "/" }, { label: "Brochure", url: "/brochure" }])],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── VILLAS KRABI ────────────────────────── */

async function ssrVillasKrabi(_req: Request, res: Response) {
  const bodyHtml = `
    <p class="intro">Amon Tour curates a selection of premium villas in Krabi for travellers who want the perfect base for their southern Thailand adventure — private pools, stunning sea views and easy access to all our island tours.</p>

    <section class="section">
      <h2>Our villa selection in Krabi</h2>
      <div class="card-grid">
        <article class="card"><div class="card-body">
          <h3 class="card-title">Pool villas in Ao Nang</h3>
          <p class="card-desc">Private pool villas within walking distance of Ao Nang Beach — the ideal base for day trips to Railay, Phi Phi and Phang Nga Bay.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Cliff-top villas with sea views</h3>
          <p class="card-desc">Breathtaking panoramic views over the Andaman Sea and Krabi's iconic limestone karsts. Perfect for sunset lovers and photographers.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Family villas with multiple bedrooms</h3>
          <p class="card-desc">Spacious 3–6 bedroom villas with large gardens, private pools and full staff — ideal for families or groups of friends.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Romantic couples retreats</h3>
          <p class="card-desc">Intimate one or two bedroom villas with plunge pools, outdoor showers and jungle views — designed for privacy and romance.</p>
        </div></article>
      </div>
    </section>

    <section class="section">
      <h2>Bundle villa + private tours</h2>
      <p>Combine your villa rental with Amon Tour's private excursions for the ultimate Krabi experience. Our guides provide hotel pickup, tailored itineraries and local insight that no booking platform can offer.</p>
    </section>

    <div class="cta-row">
      <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent("Hi! I'm looking for a villa in Krabi.")}" rel="noopener" target="_blank">Ask us on WhatsApp</a>
      <a class="btn btn-primary" href="/custom-tour">Plan a full trip</a>
      <a class="btn btn-primary" href="/tours">Browse our tours</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Luxury Villas in Krabi — Private Pool, Sea Views | Amon Tour",
    description:
      "Discover curated luxury villas in Krabi, Thailand with Amon Tour. Private pool villas, cliff-top retreats with sea views, family villas and romantic couples escapes — all bookable with private island tours.",
    path: "/villas-krabi",
    h1: "Luxury villas in Krabi, Thailand",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Villas in Krabi" }],
    schemaJsons: [breadcrumbSchema([{ label: "Home", url: "/" }, { label: "Villas in Krabi", url: "/villas-krabi" }])],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── TOUR DETAIL (Tour Ninja external tours) ────────────────────────── */

async function ssrTourDetailExternal(req: Request, res: Response) {
  const id = req.params.id;

  const bodyHtml = `
    <p class="intro">Discover this private tour departing from Krabi, Thailand — organised by Amon Tour with French and English-speaking guides since 2013.</p>

    <section class="section">
      <h2>About this tour</h2>
      <p>This private tour departs from Ao Nang, Krabi. You'll benefit from personalised service, small group sizes and a guide who speaks English or French fluently.</p>
      <ul>
        <li><strong>Departure:</strong> Ao Nang, Krabi (hotel pickup available)</li>
        <li><strong>Languages:</strong> English, French, Thai</li>
        <li><strong>Group type:</strong> Private — your group only</li>
        <li><strong>Flexibility:</strong> itinerary can be adapted to your preferences</li>
      </ul>
    </section>

    <section class="section">
      <h2>Book this tour</h2>
      <p>Contact us directly for the latest availability and pricing. We usually reply within an hour on WhatsApp.</p>
      <div class="cta-row">
        <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent("Hi! I'm interested in booking a private tour in Krabi.")}" rel="noopener" target="_blank">WhatsApp us</a>
        <a class="btn btn-primary" href="/contact">Contact form</a>
        <a class="btn btn-primary" href="/tours">All tours</a>
      </div>
    </section>`;

  const html = ssrHtmlShell({
    title: "Private Tour in Krabi, Thailand | Amon Tour",
    description:
      "Book this private tour from Ao Nang, Krabi with Amon Tour — French and English-speaking guides, flexible itineraries, small group sizes. Contact us on WhatsApp for availability.",
    path: `/tour-detail/${id}`,
    h1: "Private tour in Krabi, Thailand",
    bodyHtml,
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Tours", url: "/tours" },
      { label: "Tour Detail" },
    ],
    schemaJsons: [
      breadcrumbSchema([
        { label: "Home", url: "/" },
        { label: "Tours", url: "/tours" },
        { label: "Tour Detail", url: `/tour-detail/${id}` },
      ]),
    ],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── EXTERNAL STAYS (partner tours via Tour Ninja) ── */

async function ssrExternalStays(_req: Request, res: Response) {
  const bodyHtml = `
    <p class="intro">Explore additional tour and accommodation options in Thailand from our trusted partner network. These carefully selected partner services complement Amon Tour's private tours for a complete Thailand travel experience.</p>

    <section class="section">
      <h2>Partner tours & stays in Thailand</h2>
      <p>Through our partner network, we offer access to a wider range of tours across Thailand — including options in Phuket, Koh Samui, Khao Lak and beyond Krabi. Our French and English-speaking team can help you combine these with our private Krabi tours for a full itinerary.</p>
      <ul>
        <li>Snorkelling and diving excursions from Phuket</li>
        <li>Koh Samui island tours and beach retreats</li>
        <li>Khao Lak national park adventures</li>
        <li>Multi-destination Thailand packages</li>
      </ul>
    </section>

    <section class="section">
      <h2>How to book</h2>
      <p>Contact us on WhatsApp or by email to get the best selection matched to your travel dates and group. Our team will help you pick the right combination of Amon Tour private experiences and partner services.</p>
    </section>

    <div class="cta-row">
      <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent("Hi! I'm looking for partner tours or stays in Thailand.")}" rel="noopener" target="_blank">Ask on WhatsApp</a>
      <a class="btn btn-primary" href="/tours">Our own private tours</a>
      <a class="btn btn-primary" href="/stays">Accommodation options</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Partner Tours & Stays in Thailand | Amon Tour",
    description:
      "Discover partner tours and stays in Thailand curated by Amon Tour — excursions in Phuket, Koh Samui, Khao Lak and beyond, complementing our private Krabi tours.",
    path: "/external-stays",
    h1: "Partner tours & stays in Thailand",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Partner Stays" }],
    schemaJsons: [breadcrumbSchema([{ label: "Home", url: "/" }, { label: "Partner Stays", url: "/external-stays" }])],
  });
  sendSsrHtml(res, html);
}

/* ────────────────────────── CRUISE ────────────────────────── */

async function ssrCruise(_req: Request, res: Response) {
  const bodyHtml = `
    <p class="intro">Experience the Andaman Sea from the deck of a private catamaran or traditional longtail boat. Amon Tour organises sunset cruises, full-day sailing trips and private yacht charters departing from Krabi and Ao Nang.</p>

    <section class="section">
      <h2>Cruise experiences in Krabi</h2>
      <div class="card-grid">
        <article class="card"><div class="card-body">
          <h3 class="card-title">Sunset catamaran cruise</h3>
          <p class="card-desc">Sail past Krabi's dramatic limestone karsts as the sun sets over the Andaman Sea. Private charter for couples, families and small groups — drinks and snacks included.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Full-day sailing to Phi Phi</h3>
          <p class="card-desc">A full day at sea aboard a sailing catamaran — visiting Phi Phi Don, Maya Bay and snorkelling spots along the way. The most comfortable way to see the islands.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Private longtail island hop</h3>
          <p class="card-desc">Charter a traditional wooden longtail boat for the day. Visit hidden beaches, sea caves and lagoons unreachable by large tour boats.</p>
        </div></article>
        <article class="card"><div class="card-body">
          <h3 class="card-title">Phang Nga Bay overnight cruise</h3>
          <p class="card-desc">Spend a night anchored among the limestone towers of Phang Nga Bay — kayaking, swimming and stargazing away from crowds.</p>
        </div></article>
      </div>
    </section>

    <section class="section">
      <h2>Why cruise with Amon Tour?</h2>
      <ul>
        <li><strong>Private charter only:</strong> no shared tours — your boat, your pace, your itinerary.</li>
        <li><strong>Expert local crew:</strong> experienced captains who know the best anchoring spots and tide windows.</li>
        <li><strong>Flexible itineraries:</strong> we adapt to weather, your interests and the size of your group.</li>
        <li><strong>All-inclusive options:</strong> meals, drinks, snorkelling gear and hotel pickup available.</li>
      </ul>
    </section>

    <div class="cta-row">
      <a class="btn btn-gold" href="https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent("Hi! I'm interested in a cruise or catamaran charter in Krabi.")}" rel="noopener" target="_blank">Book a cruise on WhatsApp</a>
      <a class="btn btn-primary" href="/custom-tour">Plan a custom trip</a>
      <a class="btn btn-primary" href="/tours">All our tours</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Cruises & Catamaran Charters in Krabi, Thailand | Amon Tour",
    description:
      "Private sunset cruises, catamaran charters and sailing trips from Krabi, Thailand. Phi Phi Islands, Phang Nga Bay overnight, longtail island hopping — exclusive for your group. Book with Amon Tour.",
    path: "/cruise",
    h1: "Cruises & catamaran charters from Krabi",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Cruise" }],
    schemaJsons: [breadcrumbSchema([{ label: "Home", url: "/" }, { label: "Cruise", url: "/cruise" }])],
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
    // Traditional search engines
    "googlebot", "google-inspectiontool", "google-extended", "bingbot", "slurp",
    "duckduckbot", "baiduspider", "yandex", "sogou", "exabot",
    // Social preview bots
    "facebookexternalhit", "facebot", "twitterbot", "linkedinbot",
    "embedly", "quora link preview", "showyoubot", "outbrain", "pinterest",
    "slackbot", "vkshare", "w3c_validator", "redditbot", "applebot",
    "whatsapp", "flipboard", "tumblr", "bitlybot", "skypeuripreview",
    "nuzzel", "discordbot", "snapchat", "viber", "telegrambot",
    // SEO & technical tools
    "google page speed", "qwantify", "petalbot",
    "bytespider", "ahrefsbot", "semrushbot", "mj12bot",
    "dotbot", "screaming frog", "rogerbot", "sitebulb", "lighthouse",
    "chrome-lighthouse", "headlesschrome",
    "yahoo! slurp", "ia_archiver",
    // AI crawlers (GEO — Generative Engine Optimization)
    "gptbot",           // OpenAI / ChatGPT
    "chatgpt-user",     // OpenAI browsing plugin
    "oai-searchbot",    // OpenAI SearchGPT
    "claudebot",        // Anthropic / Claude
    "anthropic-ai",     // Anthropic general
    "perplexitybot",    // Perplexity AI
    "youbot",           // You.com
    "cohere-ai",        // Cohere
    "amazonbot",        // Amazon Alexa / Amazon AI
    "meta-externalagent", // Meta AI
    "omgilibot",        // Omgili / Meltwater AI
    "diffbot",          // Diffbot AI extraction
    "imagesiftbot",     // AI image indexing
    "friendlycrawler",  // AI-friendly crawler
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
  // Core pages
  app.get("/", ssrIfBot(ssrHome));
  app.get("/tours", ssrIfBot(ssrTours));
  app.get("/tour-details/:id", ssrIfBot(ssrTourDetail));
  app.get("/tour-detail/:id", ssrIfBot(ssrTourDetailExternal));
  app.get("/experiences", ssrIfBot(ssrExperiences));
  app.get("/custom-tour", ssrIfBot(ssrCustomTour));
  app.get("/contact", ssrIfBot(ssrContact));
  // Blog
  app.get("/blog", ssrIfBot(ssrBlog));
  app.get("/blog/:slug", ssrIfBot(ssrBlogPost));
  // Landing & lead-gen pages
  app.get("/stays", ssrIfBot(ssrStays));
  app.get("/krabi-celebration", ssrIfBot(ssrKrabiCelebration));
  app.get("/become-partner", ssrIfBot(ssrBecomePartner));
  app.get("/group-corporate", ssrIfBot(ssrGroupCorporate));
  app.get("/brochure", ssrIfBot(ssrBrochure));
  app.get("/villas-krabi", ssrIfBot(ssrVillasKrabi));
  app.get("/external-stays", ssrIfBot(ssrExternalStays));
  app.get("/cruise", ssrIfBot(ssrCruise));
}
