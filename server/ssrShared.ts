import {
  getCurrentTourNinjaSsrRelease,
  getTourNinjaSsrPageOverride,
} from "./ssrTourNinjaRelease";

/**
 * Server-Side Rendered HTML shell for SEO-critical pages.
 *
 * These pages are returned as pure HTML (no React bundle) so Googlebot
 * indexes the content directly without needing to execute JavaScript.
 *
 * The SPA continues to handle interactive routes; SSR pages share visual
 * style with the SPA via the same brand colors, fonts, header and footer.
 */

const BASE_URL = "https://amon-tour.com";

const HREFLANG_LOCALES = [
  "en", "en-MY", "en-SG", "en-AU", "fr",
  "th", "zh-CN", "zh-SG", "zh-MY", "ms", "x-default",
];

export const BRAND = {
  primary: "#084F6E",
  primaryDark: "#063A52",
  gold: "#E6B64C",
  textDark: "#1f2937",
  textMuted: "#4b5563",
  bgLight: "#f8fafc",
  border: "#e5e7eb",
  logo: "/favicon.png",
  phone: "+66 81 956 2849",
  phoneIntl: "+66819562849",
  whatsapp: "+66 86 476 3804",
  whatsappIntl: "66864763804",
  email: "contact@amon-tour.com",
  addressLine1: "Ao Nang, Krabi",
  addressLine2: "Thailand",
  baseUrl: BASE_URL,
};

const NAV_ITEMS = [
  { url: "/", label: "Home" },
  { url: "/tours", label: "Tours" },
  { url: "/experiences", label: "Experiences" },
  { url: "/destinations", label: "Destinations" },
  { url: "/custom-tour", label: "Custom Tour" },
  { url: "/blog", label: "Blog" },
  { url: "/contact", label: "Contact" },
];

export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttr(input: unknown): string {
  return escapeHtml(input);
}

export function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return input.slice(0, max - 1).trimEnd() + "…";
}

export type SsrShellOptions = {
  title: string;
  description: string;
  path: string;          // current path, used for canonical + hreflang
  h1: string;
  bodyHtml: string;      // page-specific HTML (rendered between header and footer)
  schemaJsons?: object[]; // JSON-LD structured data blocks
  lang?: string;         // <html lang>, defaults to "en"
  breadcrumbs?: Array<{ label: string; url?: string }>;
  metaImage?: string;    // og:image
  keywords?: string;     // optional release SEO keywords
  heroDescription?: string; // optional release hero summary
};

function renderBreadcrumbs(items: Array<{ label: string; url?: string }>): string {
  if (!items || items.length === 0) return "";
  const lis = items.map((item, i) => {
    const isLast = i === items.length - 1;
    if (isLast || !item.url) {
      return `<li aria-current="page"><span>${escapeHtml(item.label)}</span></li>`;
    }
    return `<li><a href="${escapeAttr(item.url)}">${escapeHtml(item.label)}</a></li>`;
  });
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${lis.join("")}</ol></nav>`;
}

function renderHeader(currentPath: string): string {
  const links = NAV_ITEMS.map((item) => {
    const isActive = item.url === currentPath || (item.url !== "/" && currentPath.startsWith(item.url));
    return `<a href="${escapeAttr(item.url)}"${isActive ? ' class="active" aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`;
  }).join("");

  return `
<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="brand" aria-label="Amon Tour — Home">
      <img src="${escapeAttr(BRAND.logo)}" alt="Amon Tour Krabi Thailand" width="180" height="48" loading="eager" />
    </a>
    <nav class="main-nav" aria-label="Main navigation">
      ${links}
    </nav>
    <a class="cta-whatsapp" href="https://wa.me/${BRAND.whatsappIntl}" rel="noopener" target="_blank">WhatsApp</a>
  </div>
</header>`;
}

function renderFooter(): string {
  return `
<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <h2 class="footer-title">Amon Tour</h2>
      <p class="footer-text">Krabi-based travel agency run by French and English-speaking guides since 2013. Authentic private tours in Krabi, Phi Phi, Phang Nga Bay and southern Thailand.</p>
    </div>
    <div>
      <h2 class="footer-title">Contact</h2>
      <address class="footer-text">
        ${escapeHtml(BRAND.addressLine1)}<br>
        ${escapeHtml(BRAND.addressLine2)}<br>
        <a href="tel:${escapeAttr(BRAND.phoneIntl)}">${escapeHtml(BRAND.phone)}</a><br>
        <a href="https://wa.me/${BRAND.whatsappIntl}" rel="noopener" target="_blank">WhatsApp ${escapeHtml(BRAND.whatsapp)}</a><br>
        <a href="mailto:${escapeAttr(BRAND.email)}">${escapeHtml(BRAND.email)}</a>
      </address>
    </div>
    <div>
      <h2 class="footer-title">Explore</h2>
      <ul class="footer-links">
        <li><a href="/tours">Our Tours</a></li>
        <li><a href="/destinations">Destinations</a></li>
        <li><a href="/experiences">Experiences</a></li>
        <li><a href="/custom-tour">Custom Tour Request</a></li>
        <li><a href="/blog">Travel Blog</a></li>
        <li><a href="/contact">Contact Us</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <small>© ${new Date().getFullYear()} Amon Tour Co., Ltd. — Krabi, Thailand. All rights reserved.</small>
    </div>
  </div>
</footer>`;
}

const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:${BRAND.textDark};background:#fff;line-height:1.6;font-size:16px}
img{max-width:100%;height:auto;display:block}
a{color:${BRAND.primary};text-decoration:none}
a:hover{text-decoration:underline}
h1,h2,h3,h4{font-family:'Poppins','Inter',system-ui,sans-serif;color:${BRAND.primary};line-height:1.25;margin:0 0 .5em}
h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:700}
h2{font-size:clamp(1.4rem,3vw,1.875rem);font-weight:600;margin-top:2rem}
h3{font-size:1.25rem;font-weight:600;margin-top:1.5rem}
p{margin:0 0 1em}
.container{max-width:1200px;margin:0 auto;padding:0 1.25rem}
.site-header{background:#fff;border-bottom:1px solid ${BRAND.border};position:sticky;top:0;z-index:50;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.header-inner{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.25rem;gap:1rem;flex-wrap:wrap}
.brand img{height:48px;width:auto}
.main-nav{display:flex;gap:1.25rem;flex-wrap:wrap;align-items:center}
.main-nav a{color:${BRAND.textDark};font-weight:500;font-size:.95rem;padding:.4rem 0;border-bottom:2px solid transparent;transition:color .15s,border-color .15s}
.main-nav a:hover{color:${BRAND.primary};text-decoration:none}
.main-nav a.active{color:${BRAND.primary};border-bottom-color:${BRAND.gold}}
.cta-whatsapp{background:${BRAND.gold};color:${BRAND.primary};padding:.55rem 1.1rem;border-radius:9999px;font-weight:600;font-size:.9rem}
.cta-whatsapp:hover{background:#d9a83b;text-decoration:none}
.page-hero{background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.primaryDark} 100%);color:#fff;padding:3rem 0 2.5rem}
.page-hero h1{color:#fff;margin-bottom:.5rem}
.page-hero p{color:rgba(255,255,255,.92);font-size:1.05rem;max-width:780px;margin-bottom:0}
.page-content{padding:2.5rem 0 3rem}
.intro{font-size:1.1rem;color:${BRAND.textMuted};max-width:820px;margin-bottom:1.5rem}
.card-grid{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));margin:1.5rem 0}
.card{border:1px solid ${BRAND.border};border-radius:.75rem;overflow:hidden;background:#fff;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(8,79,110,.1)}
.card-img{aspect-ratio:16/10;background:${BRAND.bgLight};overflow:hidden}
.card-img img{width:100%;height:100%;object-fit:cover}
.card-body{padding:1rem 1.1rem 1.25rem;flex:1;display:flex;flex-direction:column}
.card-title{margin:0 0 .35rem;font-size:1.1rem}
.card-title a{color:${BRAND.primary}}
.card-meta{font-size:.85rem;color:${BRAND.textMuted};margin-bottom:.5rem}
.card-desc{font-size:.93rem;color:${BRAND.textDark};margin:0 0 .75rem;flex:1}
.card-cta{margin-top:auto;font-weight:600;color:${BRAND.primary}}
.btn{display:inline-block;padding:.7rem 1.35rem;border-radius:9999px;font-weight:600;text-decoration:none;transition:background .15s}
.btn-primary{background:${BRAND.primary};color:#fff}
.btn-primary:hover{background:${BRAND.primaryDark};text-decoration:none}
.btn-gold{background:${BRAND.gold};color:${BRAND.primary}}
.btn-gold:hover{background:#d9a83b;text-decoration:none}
.cta-row{display:flex;gap:.75rem;flex-wrap:wrap;margin:1.5rem 0}
.faq{margin:2rem 0}
.faq-item{border-bottom:1px solid ${BRAND.border};padding:1rem 0}
.faq-item h3{margin:0 0 .35rem;font-size:1.05rem;color:${BRAND.primary}}
.faq-item p{margin:0;color:${BRAND.textMuted}}
.breadcrumbs{font-size:.85rem;color:${BRAND.textMuted};margin:0 0 1rem}
.breadcrumbs ol{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:.4rem}
.breadcrumbs li:not(:last-child)::after{content:"›";margin-left:.4rem;color:${BRAND.textMuted}}
.breadcrumbs a{color:${BRAND.textMuted}}
.site-footer{background:${BRAND.primaryDark};color:rgba(255,255,255,.92);margin-top:3rem;padding:2.5rem 0 0}
.site-footer a{color:${BRAND.gold}}
.footer-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:2rem;padding-bottom:2rem}
.footer-title{color:#fff;font-size:1.05rem;margin:0 0 .75rem}
.footer-text{font-size:.93rem;color:rgba(255,255,255,.85);font-style:normal}
.footer-links{list-style:none;padding:0;margin:0}
.footer-links li{margin-bottom:.4rem}
.footer-bottom{border-top:1px solid rgba(255,255,255,.1);padding:1rem 0;text-align:center;font-size:.85rem;color:rgba(255,255,255,.7)}
.tag-list{display:flex;flex-wrap:wrap;gap:.4rem;margin:.5rem 0 1rem}
.tag{background:${BRAND.bgLight};color:${BRAND.primary};padding:.2rem .65rem;border-radius:9999px;font-size:.8rem;font-weight:500}
.section{margin:2rem 0}
.related-list{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));margin:1rem 0}
.related-list a{display:block;padding:.85rem 1rem;background:${BRAND.bgLight};border-radius:.5rem;color:${BRAND.primary};font-weight:500;border:1px solid ${BRAND.border}}
.related-list a:hover{background:#fff;border-color:${BRAND.primary};text-decoration:none}
@media(max-width:640px){
  .header-inner{padding:.6rem 1rem}
  .main-nav{display:none}
  .brand img{height:40px}
  .page-hero{padding:2rem 0 1.75rem}
  .page-content{padding:2rem 0 2.5rem}
}
`;

export function ssrHtmlShell(opts: SsrShellOptions): string {
  const releaseOverride = getTourNinjaSsrPageOverride(getCurrentTourNinjaSsrRelease(), opts);
  // Do not alter any shell field when there is no usable live release. This
  // preserves the existing SSR response (including canonical and JSON-LD).
  const page = releaseOverride ? { ...opts, ...releaseOverride } : opts;
  const lang = page.lang || "en";
  const canonical = `${BASE_URL}${page.path}`;
  const description = truncate(page.description, 320);
  const ogImage = page.metaImage || `${BASE_URL}/amon-tour-team.jpg`;

  const hreflangLinks = HREFLANG_LOCALES
    .map((loc) => `<link rel="alternate" hreflang="${loc}" href="${canonical}" />`)
    .join("\n    ");

  const schemaBlocks = (opts.schemaJsons || [])
    .map((json) => {
      const safe = JSON.stringify(json).replace(/</g, "\\u003c");
      return `<script type="application/ld+json">${safe}</script>`;
    })
    .join("\n    ");

  const breadcrumbsHtml = opts.breadcrumbs ? renderBreadcrumbs(opts.breadcrumbs) : "";

  return `<!DOCTYPE html>
<html lang="${escapeAttr(lang)}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="${BRAND.primary}" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="Amon Tour Thailand" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    ${page.keywords ? `<meta name="keywords" content="${escapeAttr(page.keywords)}" />\n    ` : ""}<link rel="canonical" href="${escapeAttr(canonical)}" />
    ${hreflangLinks}

    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeAttr(page.title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:image" content="${escapeAttr(ogImage)}" />
    <meta property="og:site_name" content="Amon Tour" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(page.title)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(ogImage)}" />

    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" media="print" onload="this.media='all'" />
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" /></noscript>

    <style>${BASE_CSS}</style>

    ${schemaBlocks}
</head>
<body>
${renderHeader(page.path)}
<main>
    <section class="page-hero">
        <div class="container">
            ${breadcrumbsHtml}
            <h1>${escapeHtml(page.h1)}</h1>
            <p>${page.heroDescription
              ? escapeHtml(page.heroDescription)
              : `${escapeHtml(page.description.split(". ")[0])}.`}</p>
        </div>
    </section>
    <section class="page-content">
        <div class="container">
${page.bodyHtml}
        </div>
    </section>
</main>
${renderFooter()}
</body>
</html>`;
}

/**
 * Send an SSR HTML response with proper headers.
 */
export function sendSsrHtml(res: import("express").Response, html: string, statusCode = 200): void {
  res.status(statusCode);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.send(html);
}

export const HREFLANG = HREFLANG_LOCALES;
