import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import type { SiteContent } from "./content.js";
import type { Language, Page } from "./schema.js";
import { absoluteUrl, escapeAttr, escapeHtml, safeJson, stripTags, truncate } from "./html.js";
import { renderSection } from "./sections/index.js";
import { renderCustom } from "./templates/custom/index.js";
import { createHash } from "node:crypto";
/** Version des assets (cache-busting) : empreinte du CSS + JS générés. */
const ASSET_VERSION = createHash("sha1").update(String(SITE_CSS)).update(String(SITE_JS)).digest("hex").slice(0, 10);
import { SITE_CSS, SITE_JS } from "./assets.js";

export type RouteKind = "page"|"custom"|"destination"|"destinations-hub"|"static"|"blog-index"|"blog-post"|"tour-detail"|"tour-ninja-iframe"|"tour-showcase"|"system";
export interface RouteDef { path: string; kind: RouteKind; slug?: string; sitemap?: { changefreq: string; priority: number; lastmod?: string } }
export interface BuildReport { routes: RouteDef[]; files: number; sitemapUrls: string[]; unsupportedSections: Record<string, number>; duration: number; routesByKind: Record<string, number> }

const SITEMAP_BASE: Record<string, [string, number]> = {
  "/":["daily",1], "/tours":["weekly",.9], "/experiences":["weekly",.8], "/destinations":["monthly",.8],
  "/stays":["weekly",.8], "/external-stays":["weekly",.7], "/custom-tour":["monthly",.7], "/blog":["weekly",.6],
  "/contact":["monthly",.5], "/group-corporate":["monthly",.5], "/become-partner":["monthly",.4],
  "/krabi-celebration":["monthly",.6], "/brochure":["monthly",.5], "/villas-krabi":["monthly",.6],
  "/privacy-policy":["yearly",.3], "/terms-conditions":["yearly",.3], "/legal-notice":["yearly",.3],
};
const customPaths = ["/stays","/external-stays","/krabi-celebration","/become-partner","/group-corporate","/brochure","/villas-krabi"];

export function listRoutes(content: SiteContent): RouteDef[] {
  const out: RouteDef[] = [];
  const add = (r: RouteDef) => { if (!out.some((x) => x.path === r.path)) out.push(r); };
  for (const page of content.pages.filter((p) => p.active && !p.externalUrl)) {
    const sm = SITEMAP_BASE[page.path];
    add({ path: page.path, kind: page.customCode ? "custom" : page.path === "/blog" ? "blog-index" : "page", slug: page.slug, sitemap: sm ? { changefreq: sm[0], priority: sm[1] } : undefined });
  }
  add({ path: "/experiences", kind: "page", slug: "tours", sitemap: { changefreq: "weekly", priority: .8 } });
  for (const p of customPaths) { const sm = SITEMAP_BASE[p]; add({ path:p, kind:"custom", slug:p.slice(1), sitemap: sm && {changefreq:sm[0],priority:sm[1]} }); }
  add({ path:"/destinations", kind:"destinations-hub", sitemap:{changefreq:"monthly",priority:.8} });
  for (const d of content.destinations) add({ path:`/destinations/${d.slug}`, kind:"destination", slug:d.slug, sitemap:{changefreq:"monthly",priority:d.sitemapPriority} });
  for (const s of content.staticPages.filter((s) => s.meta.published)) {
    const sm = SITEMAP_BASE[`/${s.meta.slug}`];
    add({ path:`/${s.meta.slug}`, kind:"static", slug:s.meta.slug, sitemap: sm && {changefreq:sm[0],priority:sm[1]} });
  }
  for (const p of content.blog.posts.filter((p) => p.meta.status === "published")) add({ path:`/blog/${p.meta.slug}`, kind:"blog-post",slug:p.meta.slug,sitemap:{changefreq:"monthly",priority:.6,lastmod:(p.meta.legacy?.updatedAt || p.meta.publishDate || "").slice(0,10) || undefined} });
  const today = new Date().toISOString().slice(0, 10);
  for (const t of content.legacyTours) add({path:`/tour-detail/${t.id}`,kind:"tour-detail",slug:String(t.id),sitemap:{changefreq:"weekly",priority:.8,lastmod:today}});
  add({path:"/tour-ninja-iframe",kind:"tour-ninja-iframe"});
  // Vitrine /tour/:token : page unique hydratée côté client depuis /api/public/tour-showcase/:token (le edge mappe /tour/* dessus).
  add({path:"/tour/_token",kind:"tour-showcase"});
  add({path:"/404",kind:"system"});
  return out;
}

const defaults: Record<string, [string,string,string]> = {
  "/":["Amon Tour — Private Tours in Krabi Thailand | French & English Guides","Krabi-based travel agency offering private tours in southern Thailand: Phi Phi, Phang Nga Bay, Railay, James Bond Island. French and English-speaking guides since 2013. Ideal for travellers from Malaysia, Singapore, Australia and worldwide.","Private tours in Krabi, Thailand"],
  "/tours":["Private Tours in Krabi | Amon Tour Thailand","Browse all private tours and excursions from Krabi: Phi Phi Islands, Phang Nga Bay, Railay, 4-island tour, sunset cruise, kayaking, jungle trekking and more. Book your private tour in southern Thailand.","Private tours and excursions in Krabi"],
  "/experiences":["Authentic Experiences in Krabi & Southern Thailand | Amon Tour","Authentic Thai experiences from Krabi: private island hopping, sea-kayaking and bivouac at Thalane, cultural visits, Thai cooking, Khao Sok jungle trekking, sunset catamaran. Designed by French & English-speaking guides.","Authentic experiences in Krabi & southern Thailand"],
  "/custom-tour":["Custom Private Tour in Thailand | Plan Your Trip — Amon Tour Krabi","Design your custom private tour in Thailand with Amon Tour. Tell us about your trip and a French or English-speaking guide will send a personalised itinerary within 24 hours. Krabi, Phi Phi, Phang Nga, Khao Sok and beyond.","Plan your custom private tour in Thailand"],
  "/contact":["Contact Amon Tour Krabi — WhatsApp, Phone, Email","Contact Amon Tour, your Krabi-based travel agency. WhatsApp +66 86 476 3804, phone +66 81 956 2849, email contact@amon-tour.com. We answer in English, French and Thai.","Contact Amon Tour"],
  "/blog":["Travel Blog — Krabi, Phi Phi, Phang Nga | Amon Tour","Travel blog about Krabi and southern Thailand: practical tips for visiting Phi Phi, Phang Nga Bay, Railay, best season, what to pack, family travel and more — from a local Krabi-based agency.","Travel blog: Krabi & southern Thailand"],
  "/destinations":["Destinations & Excursions Privées à Krabi | Amon Tour","Découvrez toutes les destinations couvertes par Amon Tour depuis Krabi : Koh Phi Phi, Phang Nga Bay, Railay Beach, bivouac Thalane, catamaran privatif, agence francophone. Tours privés avec guides bilingues.","Nos destinations à Krabi et en Thaïlande du Sud"],
  "/cruise":["Cruises & Catamaran Charters in Krabi, Thailand | Amon Tour","Private catamaran charters and cruises from Krabi.","Private cruises and catamaran charters in Krabi"],
};

function agencySchema(c: SiteContent) {
  return {"@context":"https://schema.org","@type":"TravelAgency",name:c.site.name,url:c.site.baseUrl,logo:absoluteUrl(c.site.baseUrl,c.site.brand.logo),telephone:c.site.brand.phoneIntl,email:c.site.brand.email,address:{"@type":"PostalAddress",addressLocality:"Krabi",addressCountry:"TH"},sameAs:c.site.social};
}
function breadcrumbSchema(c: SiteContent, route: string, title: string) {
  const chunks = route.split("/").filter(Boolean); return {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:`${c.site.baseUrl}/`},...chunks.map((x,i)=>({"@type":"ListItem",position:i+2,name:i===chunks.length-1?title:x,item:`${c.site.baseUrl}/${chunks.slice(0,i+1).join("/")}`}))]};
}

function languagePath(route: string, lang: Language): string { return lang === "en" ? route : `/${lang}${route === "/" ? "" : route}`; }
function layout(c: SiteContent, route: string, lang: Language, meta: {title:string;description:string;keywords?:string;image?:string;noindex?:boolean;h1:string}, body: string, schemas: unknown[]): string {
  const canonical = `${c.site.baseUrl}${route}`, current = languagePath(route, lang);
  const nav = c.navigation.items.filter((i:any)=>i.active).sort((a:any,b:any)=>a.order-b.order).map((i:any)=>`<a href="${escapeAttr(languagePath(i.url,lang))}"${route===i.url?' class="active" aria-current="page"':""}${i.target==="_blank"?' target="_blank" rel="noopener"':""}>${escapeHtml(i.label[lang]||i.label.en)}</a>`).join("");
  const announcement = c.announcements.notificationBar.enabled ? `<div class="announcement">${escapeHtml(c.announcements.notificationBar.text)}</div>` : "";
  const footerLinks = c.footer.usefulLinks.map((x)=>`<li><a href="${escapeAttr(languagePath(x.url,lang))}">${escapeHtml(x.text)}</a></li>`).join("");
  const contacts = c.footer.contactInfo.map((x)=>`<p class="${escapeAttr(x.style||"")}">${escapeHtml(x.value).replace(/\n/g,"<br>")}</p>`).join("");
  const social = c.footer.socialMedia.map((x)=>`<a href="${escapeAttr(x.url)}" target="_blank" rel="noopener" aria-label="${escapeAttr(x.name)}">${escapeHtml(x.name.slice(0,1))}</a>`).join("");
  const alternates = c.site.hreflangLocales.map((x)=>`<link rel="alternate" hreflang="${escapeAttr(x)}" href="${escapeAttr(canonical)}">`).join("");
  const image = absoluteUrl(c.site.baseUrl,meta.image) || `${c.site.baseUrl}/amon-tour-team.jpg`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="${escapeAttr(c.site.brand.primary)}"><meta name="robots" content="${lang!=="en"||meta.noindex?"noindex, follow":"index, follow"}"><title>${escapeHtml(meta.title)}</title><meta name="description" content="${escapeAttr(truncate(meta.description,320))}">${meta.keywords?`<meta name="keywords" content="${escapeAttr(meta.keywords)}">`:""}<link rel="canonical" href="${escapeAttr(canonical)}">${alternates}<meta property="og:type" content="website"><meta property="og:title" content="${escapeAttr(meta.title)}"><meta property="og:description" content="${escapeAttr(meta.description)}"><meta property="og:url" content="${escapeAttr(canonical)}"><meta property="og:image" content="${escapeAttr(image)}"><meta property="og:site_name" content="${escapeAttr(c.site.name)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeAttr(meta.title)}"><meta name="twitter:description" content="${escapeAttr(meta.description)}"><meta name="twitter:image" content="${escapeAttr(image)}"><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/assets/site.css?v=${ASSET_VERSION}">${schemas.map(s=>`<script type="application/ld+json">${safeJson(s)}</script>`).join("")}<script defer src="/assets/site.js?v=${ASSET_VERSION}"></script></head><body>${announcement}<header class="site-header${route==="/"?" header-home":""}"><div class="container header-inner"><a class="brand" href="${languagePath("/",lang)}"><img src="${escapeAttr(c.navigation.logoUrl||c.site.brand.logo)}" alt="${escapeAttr(c.site.name)}" width="180" height="80"><span class="brand-name">${escapeHtml(c.site.name)}</span></a><button class="menu-toggle" aria-label="Menu">☰</button><nav class="main-nav" aria-label="Main navigation">${nav}</nav><div class="language-switcher">${(["en","fr","es"] as Language[]).map(l=>`<a href="${languagePath(route,l)}" data-language-switch="${l}"${l===lang?' aria-current="true"':""}>${l.toUpperCase()}</a>`).join("")}</div></div></header><main>${body}</main><footer class="site-footer"><div class="container"><div class="footer-grid"><div><h2>Contact</h2>${contacts}<div class="footer-social">${social}</div></div><div><h2>Useful links</h2><ul class="footer-links">${footerLinks}</ul></div>${c.footer.newsletter.enabled?`<div><h2>${escapeHtml(c.footer.newsletter.title)}</h2><p>${escapeHtml(c.footer.newsletter.description)}</p><form class="newsletter-form"><label><span class="sr-only">Email</span><input name="email" type="email" required placeholder="${escapeAttr(c.footer.newsletter.placeholder||"Email")}"></label><button class="btn btn-gold">${escapeHtml(c.footer.newsletter.buttonText||"Subscribe")}</button><p class="form-status" aria-live="polite"></p></form><small>${escapeHtml(c.footer.newsletter.privacyText||"")}</small></div>`:""}</div><div class="footer-bottom"><span>${escapeHtml(c.footer.copyright.text)}</span><span class="footer-legal"><a href="${languagePath("/legal-notice",lang)}">Legal notice</a><a href="${languagePath("/privacy-policy",lang)}">Privacy policy</a><a href="${languagePath("/terms-conditions",lang)}">Terms</a></span></div></div></footer></body></html>`;
}

function contactForm(): string {
  return `<section class="section container"><div class="form-frame"><h2>Send us a message</h2><form class="js-json-form" data-endpoint="/api/contact-messages"><label>Name<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Subject<input name="subject" required></label><label>Message<textarea name="message" required></textarea></label><button class="btn btn-primary" type="submit">Send message</button><p class="form-status" aria-live="polite"></p></form></div></section>`;
}

function renderPage(c: SiteContent, page: Page, route: string, lang: Language) {
  const seo = page.seo[lang] || page.seo.en || {}, d = defaults[route] || [page.name,c.site.description,page.name];
  let body="", unsupported:string[]=[];
  for (const section of page.sections.filter(s=>s.active).sort((a,b)=>a.order-b.order)) { const r=renderSection(c,section,lang); body+=r.html;if(!r.supported)unsupported.push(section.type); }
  if (route === "/blog") body += blogCards(c);
  if (route === "/contact") body += contactForm();
  const h1 = seo.h1 || d[2];
  body = `<h1 class="sr-only">${escapeHtml(h1)}</h1>${body}`;
  const schemas: any[] = [];
  if (route === "/") schemas.push(agencySchema(c));
  else {
    if (route === "/blog") schemas.push({"@context":"https://schema.org","@type":"Blog",name:"Amon Tour Travel Blog",url:`${c.site.baseUrl}/blog`});
    schemas.push(breadcrumbSchema(c,route,h1));
    if (route === "/tours") schemas.push({"@context":"https://schema.org","@type":"ItemList",itemListElement:[]});
    if (route === "/contact") schemas.push({"@context":"https://schema.org","@type":"ContactPage",name:"Contact Amon Tour",url:`${c.site.baseUrl}/contact`});
  }
  return { meta:{title:seo.title||d[0],description:seo.description||d[1],keywords:seo.keywords,image:seo.ogImage,noindex:seo.noindex,h1}, body, schemas, unsupported };
}
function blogCards(c: SiteContent): string {
  return `<section class="section container"><div class="card-grid">${c.blog.posts.filter(p=>p.meta.status==="published").map(p=>`<article class="card" data-blog-card>${p.meta.coverImage?`<div class="card-img"><img src="${escapeAttr(p.meta.coverImage)}" alt="${escapeAttr(p.meta.title)}" loading="lazy"></div>`:""}<div class="card-body"><h2><a href="/blog/${escapeAttr(p.meta.slug)}">${escapeHtml(p.meta.title)}</a></h2><p>${escapeHtml(truncate(p.meta.excerpt||stripTags(p.body),180))}</p></div></article>`).join("")}</div></section>`;
}

export function renderRoute(content: SiteContent, routePath: string, lang: Language): {html:string;status:number}|null {
  const route = listRoutes(content).find(r=>r.path===routePath);
  if (!route) return null;
  if (route.kind === "system") return {html:layout(content,"/404",lang,{title:"Page not found | Amon Tour",description:"The requested page could not be found.",h1:"Page not found",noindex:true},`<section class="section container"><h1>Page not found</h1><p><a href="/">Return home</a></p></section>`,[agencySchema(content)]),status:404};
  let body="", meta:{title:string;description:string;h1:string;keywords?:string;image?:string;noindex?:boolean}, schemas:any[]=[];
  if (route.kind==="page" || route.kind==="blog-index") {
    const page=content.pages.find(p=>p.slug===route.slug); if(!page)return null; const r=renderPage(content,page,routePath,lang);body=r.body;meta=r.meta;schemas.push(...r.schemas);
  } else if(route.kind==="custom") {
    const x=renderCustom(content,routePath);if(!x)return null;body=`<h1 class="sr-only">${escapeHtml(x.h1)}</h1>${x.html}`;meta=x;schemas.push(breadcrumbSchema(content,routePath,x.h1));
  } else if(route.kind==="destinations-hub") {
    const d=defaults["/destinations"];meta={title:d[0],description:d[1],h1:d[2]};body=`<section class="page-header" style="background:linear-gradient(135deg,#084F6E,#063A52)"><div class="container"><h1>${escapeHtml(meta.h1)}</h1></div></section><section class="section container"><div class="card-grid">${content.destinations.map(x=>`<article class="card"><div class="card-body"><h2><a href="/destinations/${x.slug}">${escapeHtml(x.h1)}</a></h2><p>${escapeHtml(truncate(x.intro,180))}</p></div></article>`).join("")}</div></section>`;schemas.push(breadcrumbSchema(content,routePath,meta.h1),{"@context":"https://schema.org","@type":"ItemList",itemListElement:content.destinations.map((x,i)=>({"@type":"ListItem",position:i+1,item:x.tripSchema}))});
  } else if(route.kind==="destination") {
    const d=content.destinations.find(x=>x.slug===route.slug)!;meta={title:d.title,description:d.metaDescription,h1:d.h1};body=`<section class="page-header" style="background:linear-gradient(135deg,#084F6E,#063A52)"><div class="container"><h1>${escapeHtml(d.h1)}</h1><p>${escapeHtml(d.intro)}</p></div></section><div class="container">${d.sections.map(s=>`<section class="section"><h2>${escapeHtml(s.heading)}</h2><div class="prose">${s.content}</div></section>`).join("")}<section class="section"><h2>Frequently asked questions</h2>${d.faq.map(f=>`<div class="faq-item"><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></div>`).join("")}</section><section class="section"><h2>Other destinations</h2>${d.relatedSlugs.map(s=>`<p><a href="/destinations/${escapeAttr(s)}">${escapeHtml(content.destinations.find(x=>x.slug===s)?.h1||s)}</a></p>`).join("")}</section></div>`;schemas.push(d.schema,d.tripSchema,{"@context":"https://schema.org","@type":"FAQPage",mainEntity:d.faq.map(f=>({"@type":"Question",name:f.question,acceptedAnswer:{"@type":"Answer",text:f.answer}}))},breadcrumbSchema(content,routePath,d.h1));
  } else if(route.kind==="static") {
    const s=content.staticPages.find(x=>x.meta.slug===route.slug)!;meta={title:s.meta.metaTitle||s.meta.title,description:s.meta.metaDescription||truncate(stripTags(s.body),320),h1:s.meta.title};body=`<section class="section container prose"><h1>${escapeHtml(s.meta.title)}</h1>${String(marked.parse(s.body))}</section>`;schemas.push(breadcrumbSchema(content,routePath,s.meta.title));
  } else if(route.kind==="blog-post") {
    const p=content.blog.posts.find(x=>x.meta.slug===route.slug)!;const seo=p.meta.seo?.[lang]||p.meta.seo?.en||{};meta={title:truncate(seo.title||`${p.meta.title} | Amon Tour Blog`,70),description:seo.description||truncate(p.meta.excerpt||stripTags(p.body),320),h1:seo.h1||p.meta.title,image:p.meta.coverImage||seo.ogImage};body=`<article class="section container prose"><h1>${escapeHtml(p.meta.title)}</h1>${p.meta.coverImage?`<img src="${escapeAttr(p.meta.coverImage)}" alt="${escapeAttr(p.meta.title)}">`:""}<p><time>${escapeHtml(p.meta.publishDate||"")}</time>${p.meta.authorName?` · ${escapeHtml(p.meta.authorName)}`:""}</p>${String(marked.parse(p.body))}</article>`;schemas.push({"@context":"https://schema.org","@type":"BlogPosting",headline:p.meta.title,description:meta.description,url:`${content.site.baseUrl}${routePath}`,image:absoluteUrl(content.site.baseUrl,p.meta.coverImage),datePublished:p.meta.publishDate,author:{"@type":"Person",name:p.meta.authorName||"Amon Tour"},publisher:{"@type":"TravelAgency",name:"Amon Tour"}},breadcrumbSchema(content,routePath,p.meta.title));
  } else if(route.kind==="tour-detail") {
    const t=content.legacyTours.find(x=>String(x.id)===route.slug)!;meta={title:"Private Tour in Krabi, Thailand | Amon Tour",description:"Book this private tour from Ao Nang, Krabi with Amon Tour — French and English-speaking guides, flexible itineraries, small group sizes. Contact us on WhatsApp for availability.",h1:"Private tour in Krabi, Thailand",image:t.imageUrl};body=`<article class="section container prose"><h1>${escapeHtml(meta.h1)}</h1><img src="${escapeAttr(t.imageUrl)}" alt="${escapeAttr(t.title)}"><h2>${escapeHtml(t.title)}</h2>${t.description.includes("<")?t.description:`<p>${escapeHtml(t.description)}</p>`}<h2>At a glance</h2><ul><li>Duration: ${escapeHtml(t.duration)}</li><li>Adult price: ${t.price.toLocaleString()} THB</li></ul><a class="btn btn-gold" href="${escapeAttr(t.tourNinjaUrl)}">Book this tour</a></article>`;schemas.push(breadcrumbSchema(content,routePath,meta.h1));
  } else if(route.kind==="tour-showcase") {
    meta={title:"Tour | Amon Tour Krabi",description:"Discover this private tour from Krabi with Amon Tour — French and English-speaking guides.",h1:"Tour",noindex:true};
    body=`<section class="section container js-tour-showcase" data-language="${lang}"><h1 class="showcase-title">Tour</h1><p class="showcase-status">Loading tour…</p></section>`;
  } else {
    meta={title:"Tour Details | Amon Tour Krabi",description:"Book a private, small-group Krabi tour with Amon Tour.",h1:"Tour Details"};body=`<div class="sr-only"><h1 data-iframe-title>Tour Details</h1><p>This is a private, small-group experience by Amon Tour with French and English-speaking guides.</p><nav><a href="/tours">All tours</a> <a href="/custom-tour">Custom tour</a> <a href="/contact">Contact</a></nav></div><div class="iframe-wrap"><iframe data-tour-ninja-iframe title="Tour Details" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe></div>`;
  }
  return {html:layout(content,routePath,lang,meta,body,schemas),status:200};
}

const robots=`User-agent: *\nAllow: /\n\nDisallow: /admin\nDisallow: /admin-*\nDisallow: /tour-card-builder\nDisallow: /api/\nDisallow: /uploads/\n\nSitemap: https://amon-tour.com/sitemap.xml`;
function sitemap(content:SiteContent,routes:RouteDef[]):string {
  const included=routes.filter(r=>r.sitemap);return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${included.map(r=>`  <url>\n    <loc>${content.site.baseUrl}${r.path}</loc>\n    <changefreq>${r.sitemap!.changefreq}</changefreq>\n    <priority>${r.sitemap!.priority.toFixed(1)}</priority>${r.sitemap!.lastmod?`\n    <lastmod>${r.sitemap!.lastmod}</lastmod>`:""}\n${content.site.hreflangLocales.map(l=>`    <xhtml:link rel="alternate" hreflang="${l}" href="${content.site.baseUrl}${r.path}" />`).join("\n")}\n  </url>`).join("\n")}\n</urlset>`;
}
function outputFile(out:string,route:string,lang:Language):string { const rel=route==="/"?[]:route.split("/").filter(Boolean);return path.join(out,...(lang==="en"?[]:[lang]),...rel,"index.html"); }
function withFormEndpoints(html:string):string {
  return html.replaceAll('<form class="newsletter-form"', '<form class="newsletter-form" data-endpoint="/api/newsletter/subscribe"');
}
function copyPublic(src:string,dst:string){if(!fs.existsSync(src))return 0;let n=0;for(const e of fs.readdirSync(src,{withFileTypes:true})){if(["uploads","attached_assets","media"].includes(e.name))continue;const a=path.join(src,e.name),b=path.join(dst,e.name);if(e.isDirectory())n+=copyPublic(a,b);else{fs.mkdirSync(path.dirname(b),{recursive:true});fs.copyFileSync(a,b);n++}}return n}
export async function buildSite(content:SiteContent,{outDir,mediaRoots:_mediaRoots}:{outDir:string;mediaRoots?:string[]}):Promise<BuildReport>{
  const started=Date.now(),routes=listRoutes(content),unsupportedSections:Record<string,number>={};fs.rmSync(outDir,{recursive:true,force:true});fs.mkdirSync(path.join(outDir,"assets"),{recursive:true});let files=0;
  for(const route of routes.filter(r=>r.kind!=="system"))for(const lang of ["en","fr","es"] as Language[]){const r=renderRoute(content,route.path,lang);if(!r)continue;const f=outputFile(outDir,route.path,lang);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,withFormEndpoints(r.html));files++}
  for(const p of content.pages)for(const s of p.sections){const r=renderSection(content,s,"en");if(!r.supported)unsupportedSections[s.type]=(unsupportedSections[s.type]||0)+1}
  const notFound=renderRoute(content,"/404","en")!;fs.writeFileSync(path.join(outDir,"404.html"),withFormEndpoints(notFound.html));files++;
  fs.writeFileSync(path.join(outDir,"assets/site.css"),`:root{--primary:${content.theme.colors.primary};--secondary:${content.theme.colors.secondary};--dark:${content.site.brand.primaryDark};--gold:${content.site.brand.gold}}\n${SITE_CSS}`);fs.writeFileSync(path.join(outDir,"assets/site.js"),SITE_JS);files+=2;
  const map=sitemap(content,routes);fs.writeFileSync(path.join(outDir,"sitemap.xml"),map);fs.writeFileSync(path.join(outDir,"robots.txt"),robots);fs.writeFileSync(path.join(outDir,"_redirects.json"),JSON.stringify(content.redirects,null,2)+"\n");files+=3;
  files+=copyPublic(path.resolve("client/public"),outDir);const routesByKind:Record<string,number>={};routes.forEach(r=>routesByKind[r.kind]=(routesByKind[r.kind]||0)+1);
  return {routes,files,sitemapUrls:routes.filter(r=>r.sitemap).map(r=>`${content.site.baseUrl}${r.path}`),unsupportedSections,duration:Date.now()-started,routesByKind};
}