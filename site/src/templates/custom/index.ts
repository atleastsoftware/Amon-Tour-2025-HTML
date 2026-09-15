import type { SiteContent } from "../../content.js";
import { escapeAttr, escapeHtml } from "../../html.js";

const COPY: Record<string, { title: string; description: string; body: string }> = {
  "/stays": { title: "Thailand Accommodations — Villas, Hotels & Bungalows | Amon Tour", description: "Discover exceptional accommodations in Thailand curated by Amon Tour: luxury villas in Krabi, beachfront bungalows, boutique hotels in Bangkok. Bundle with private tours for the complete Thailand experience.", body: "<h2>Thailand accommodations — villas, hotels & bungalows</h2><p>Discover hand-picked villas, hotels and bungalows selected by our local team.</p>" },
  "/external-stays": { title: "Partner Tours & Stays in Thailand | Amon Tour", description: "Discover partner tours and stays in Thailand curated by Amon Tour — excursions in Phuket, Koh Samui, Khao Lak and beyond, complementing our private Krabi tours.", body: "<h2>Partner tours & stays in Thailand</h2><p>Explore accommodation and experiences offered by selected local partners.</p>" },
  "/krabi-celebration": { title: "Events & Celebrations in Krabi — Honeymoon, Anniversary, Birthday | Amon Tour", description: "Plan your perfect celebration in Krabi, Thailand with Amon Tour. Private honeymoon experiences, anniversary dinners on deserted beaches, birthday island-hopping, and family reunions. French and English-speaking guides.", body: "<h2>Events & celebrations in Krabi, Thailand</h2><p>Private boats, romantic dinners, decorations and tailor-made experiences for your special day.</p>" },
  "/become-partner": { title: "Partner with Amon Tour Krabi — Hotels, Agencies & Concierge | Amon Tour", description: "Partner with Amon Tour to offer your clients private tours in Krabi, Thailand. Competitive rates for hotels, travel agencies, DMCs and concierge services. French and English-speaking guides since 2013.", body: "<h2>Partner with Amon Tour Krabi</h2><p>We work with hotels, travel agencies and concierge services. Tell us about your business and our team will contact you.</p>" },
  "/group-corporate": { title: "Group & Corporate Travel in Thailand — Team Building & Incentive | Amon Tour", description: "Group and corporate travel programmes in Thailand by Amon Tour Krabi. Team building, incentive travel, conference excursions and large group logistics across southern Thailand. French and English-speaking coordinators.", body: "<h2>Group & corporate travel in Thailand</h2><p>We create incentive trips, team-building programmes and private group experiences across southern Thailand.</p>" },
  "/brochure": { title: "Download Our Travel Brochure — Krabi Tours Guide | Amon Tour", description: "Download the Amon Tour travel brochure — comprehensive guide to private tours in Krabi, Thailand. Phi Phi Islands, Phang Nga Bay, Railay Beach and more. Available in English and French.", body: "<h2>Amon Tour travel brochure — Krabi & southern Thailand</h2><p>Discover our private tours, cruises and tailor-made journeys. Contact us to receive the latest brochure.</p>" },
  "/villas-krabi": { title: "Luxury Villas in Krabi — Private Pool, Sea Views | Amon Tour", description: "Discover curated luxury villas in Krabi, Thailand with Amon Tour. Private pool villas, cliff-top retreats with sea views, family villas and romantic couples escapes — all bookable with private island tours.", body: "<h2>Luxury villas in Krabi, Thailand</h2><p>Our local team can arrange exceptional villas, transfers and private experiences for your stay.</p>" },
};

const FORM_FIELDS: Record<string, Array<{ name: string; label: string; type?: string; required?: boolean }>> = {
  "/krabi-celebration": [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "whatsapp", label: "WhatsApp", type: "tel" },
    { name: "celebrationType", label: "Type of celebration", required: true },
    { name: "guests", label: "Number of guests", type: "number", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "budget", label: "Budget" },
    { name: "description", label: "Tell us about your celebration", type: "textarea" },
  ],
  "/become-partner": [
    { name: "contactName", label: "Contact name", required: true },
    { name: "companyName", label: "Company name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "website", label: "Website", type: "url" },
    { name: "partnershipType", label: "Type of business", required: true },
    { name: "description", label: "Tell us about your partnership", type: "textarea" },
  ],
  "/group-corporate": [
    { name: "contactName", label: "Contact name", required: true },
    { name: "companyName", label: "Company name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "groupSize", label: "Number of people", type: "number", required: true },
    { name: "travelDates", label: "Travel dates" },
    { name: "budget", label: "Budget" },
    { name: "description", label: "Tell us about your group", type: "textarea" },
  ],
};

function formHtml(route: string, endpoint: string): string {
  const fields = FORM_FIELDS[route] || [];
  return `<form class="js-json-form" data-endpoint="${escapeAttr(endpoint)}">${fields.map((field) => {
    const attrs = ` name="${escapeAttr(field.name)}"${field.required ? " required" : ""}`;
    const control = field.type === "textarea"
      ? `<textarea${attrs}></textarea>`
      : `<input type="${escapeAttr(field.type || "text")}"${attrs}${field.type === "number" ? ' min="1"' : ""}>`;
    return `<label>${escapeHtml(field.label)}${control}</label>`;
  }).join("")}<button class="btn btn-primary" type="submit">Send request</button><p class="form-status" aria-live="polite"></p></form>`;
}

export function renderCustom(content: SiteContent, route: string): { title: string; description: string; h1: string; html: string } | null {
  const item = COPY[route];
  if (!item) return null;
  const forms = ["/krabi-celebration", "/become-partner", "/group-corporate"].includes(route);
  const endpoints: Record<string, string> = {
    "/krabi-celebration": "/api/krabi-celebration",
    "/become-partner": "/api/partnership-requests",
    "/group-corporate": "/api/group-requests",
  };
  return {
    ...item,
    h1: item.body.match(/<h2>(.*?)<\/h2>/)?.[1] || item.title,
    html: `<section class="section container prose">${item.body}${forms ? formHtml(route, endpoints[route]) : ""}<p><a class="btn btn-gold" href="https://wa.me/${escapeHtml(content.site.brand.whatsappIntl)}">Contact us on WhatsApp</a></p></section>`,
  };
}