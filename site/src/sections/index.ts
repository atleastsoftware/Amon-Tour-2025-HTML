import type { SiteContent } from "../content.js";
import type { Language, SectionProps, Section } from "../schema.js";
import { escapeAttr, escapeHtml, localizedProps } from "../html.js";

export interface SectionRenderResult { html: string; supported: boolean }

const buttons = (props: SectionProps) => {
  const all = [...(props.buttons || [])];
  if (props.buttonText) all.push({ text: props.buttonText, url: props.buttonUrl || "#", style: "solid" });
  if (props.ctaText) all.push({ text: props.ctaText, url: props.ctaUrl || "#", style: props.ctaStyle });
  if (!all.length) return "";
  return `<div class="cta-row">${all.map((b) => `<a class="btn ${b.style === "outline" ? "btn-outline" : "btn-primary"}" style="${b.color ? `--button-color:${escapeAttr(b.color)};` : ""}${b.textColor ? `color:${escapeAttr(b.textColor)}` : ""}" href="${escapeAttr(b.url)}"${b.target === "_blank" ? ' target="_blank" rel="noopener"' : ""}>${escapeHtml(b.text)}</a>`).join("")}</div>`;
};

const media = (p: SectionProps) => p.imageUrl
  ? `<img src="${escapeAttr(p.imageUrl)}" alt="${escapeAttr(p.imageAlt || p.title || "")}" loading="lazy">` : "";

const colorStyle = (p: SectionProps) => `background-color:${escapeAttr(p.backgroundColor || "#fff")}`;
const divider = (p: SectionProps) => `<span class="section-divider" style="background:${escapeAttr(p.dividerColor || "#3BA8AF")}"></span>`;
const sectionHeading = (p: SectionProps) => `${p.title ? `<h2 style="color:${escapeAttr(p.titleColor || "#1f2937")}">${escapeHtml(p.title)}</h2>${divider(p)}` : ""}${p.subtitle ? `<p class="section-subtitle" style="color:${escapeAttr(p.subtitleColor || "#374151")}">${escapeHtml(p.subtitle)}</p>` : ""}`;

function accentTitle(title: string, accent: string, titleColor: string, accentColor: string): string {
  if (!accent || !title.includes(accent)) return `<span style="color:${escapeAttr(titleColor)}">${escapeHtml(title)}</span>`;
  const [before, ...after] = title.split(accent);
  return `<span style="color:${escapeAttr(titleColor)}">${escapeHtml(before)}</span><span style="color:${escapeAttr(accentColor)}">${escapeHtml(accent)}</span><span style="color:${escapeAttr(titleColor)}">${escapeHtml(after.join(accent))}</span>`;
}

function renderHero(p: SectionProps, type: string): string {
  const x = p as any, isHeader = type === "header_page";
  const size = isHeader ? (x.frameSize || "small") : (x.heroSize || "grande");
  const bgType = x.backgroundType || (p.imageUrl || p.backgroundImage ? "image" : "gradient");
  let background = "";
  if (bgType === "video" && p.videoUrl) {
    background = `<video class="hero-media" autoplay muted loop playsinline preload="metadata"><source src="${escapeAttr(p.videoUrl)}" type="video/mp4"></video>`;
  } else if ((bgType === "image" || bgType === "images") && (p.imageUrl || p.backgroundImage || x.backgroundImage1)) {
    background = `<img class="hero-media" src="${escapeAttr(p.imageUrl || p.backgroundImage || x.backgroundImage1)}" alt="${escapeAttr(p.imageAlt || "")}">`;
  } else {
    const bg = bgType === "gradient" ? `linear-gradient(135deg,${x.gradientColor1 || "#084F6E"},${x.gradientColor2 || "#3BA8AF"})` : p.backgroundColor || "#084F6E";
    background = `<span class="hero-color" style="background:${escapeAttr(bg)}"></span>`;
  }
  const align = ["left", "right"].includes(x.contentAlignment) ? x.contentAlignment : "center";
  return `<section class="${isHeader ? "page-header" : "hero"} hero-${escapeAttr(size)} align-${align}">${background}${x.overlay !== false && (bgType === "video" || bgType === "image" || bgType === "images") ? '<span class="hero-overlay"></span>' : ""}<div class="container hero-content"><h2 class="hero-title">${accentTitle(p.title || "",x.titleAccentText || "",p.titleColor || "#fff",x.titleAccentColor || "#3BA8AF")}</h2>${p.subtitle ? `<p style="color:${escapeAttr(p.subtitleColor || "#fff")}">${escapeHtml(p.subtitle)}</p>` : ""}${buttons(p)}</div></section>`;
}

function renderCards(p: SectionProps): string {
  const cards = (p as any).cards || (p as any).items || (p as any).features || (p as any).iconBlocks || [];
  return `<section class="section" style="${colorStyle(p)}"><div class="container section-center">${sectionHeading(p)}<div class="card-grid">${cards.map((c: any) => `<article class="card">${c.image || c.imageUrl ? `<div class="card-img"><img src="${escapeAttr(c.image || c.imageUrl)}" alt="${escapeAttr(c.title || "")}" loading="lazy"></div>` : ""}<div class="card-body">${c.mainIcon ? `<span class="feature-icon" style="color:${escapeAttr(c.iconColor || "#084F6E")}">${iconSvg(c.mainIcon)}</span>` : ""}<h3>${escapeHtml(c.title || c.name || c.label)}</h3>${c.description || c.text ? `<div>${c.description || c.text}</div>` : ""}${c.miniIcons?.length ? `<div class="mini-features">${c.miniIcons.map((m:any)=>`<span>${iconSvg(m.icon)} ${escapeHtml(m.text)}</span>`).join("")}</div>` : ""}${c.url ? `<a href="${escapeAttr(c.url)}">Learn more →</a>` : ""}</div></article>`).join("")}</div>${buttons(p)}</div></section>`;
}

function iconSvg(name = ""): string {
  const paths = name.includes("check") ? '<path d="m5 12 4 4L19 6"/>' : name.includes("clock") ? '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' : name.includes("user") ? '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/>' : name.includes("compass") || name.includes("map") ? '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4z"/>' : '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>';
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
}

function renderForm(content: SiteContent, p: SectionProps, lang: Language): string {
  const form = content.forms.find((f) => String(f.id) === String(p.formId)) || content.forms[0];
  if (!form) return "<!-- formulaire introuvable -->";
  const cruise = String(form.id) === "8";
  const hasWhatsapp = form.fields.some((field: any) => field.id === "whatsappNumber" || field.name === "whatsappNumber");
  const cruiseNames = ["fullName", "email", "phone", "numberOfGuests", "duration", "preferredDates", "itinerary", "specialRequests"];
  const schemaName = (field: any, index: number) => {
    const original = field.name || field.key || field.id;
    if (cruise) return cruiseNames[index] || original;
    if (original === "whatsappNumber" || (original === "countrycode" && !hasWhatsapp)) return "phoneNumber";
    return original;
  };
  const tr = form.translations?.[lang] || {};
  const fields = form.fields.filter((f: any) => f.active !== false)
    .filter((f: any) => cruise || !hasWhatsapp || (f.name || f.key || f.id) !== "countrycode")
    .map((f: any, index: number) => {
    const name = schemaName(f, index);
    const label = tr[`${name}_label`] || f.label || f.title || name;
    const width = f.style?.width || "full", attrs = ` name="${escapeAttr(name)}" ${f.required ? "required" : ""}`;
    let control:string;
    if (f.type === "textarea") control = `<textarea${attrs} placeholder="${escapeAttr(f.placeholder || "")}"></textarea>`;
    else if (["numberOfAdults", "numberOfKids", "numberOfGuests"].includes(name)) control = `<input type="number"${attrs} min="${name === "numberOfKids" ? "0" : "1"}"${name === "numberOfGuests" ? ' max="8"' : ""} value="${name === "numberOfKids" ? "0" : "1"}">`;
    else if (f.type === "select") control = `<select${attrs}><option value="">${escapeHtml(f.placeholder || "Select")}</option>${(f.options || []).map((o:any)=>`<option value="${escapeAttr(typeof o==="string"?o:o.value)}">${escapeHtml(typeof o==="string"?o:o.label)}</option>`).join("")}</select>`;
    else if (f.type === "checkbox" || f.type === "radio") control = `<span class="choice-list">${(f.options || []).map((o:any)=>`<label><input type="${f.type}" name="${escapeAttr(name)}" value="${escapeAttr(typeof o==="string"?o:o.value)}"> ${escapeHtml(typeof o==="string"?o:o.label)}</label>`).join("")}</span>`;
    else control = `<input type="${escapeAttr(f.type === "phone" ? "tel" : f.type || "text")}"${attrs} placeholder="${escapeAttr(f.placeholder || "")}">`;
    return `<label class="field-${escapeAttr(width)}">${escapeHtml(label)}${control}</label>`;
  }).join("");
  const settings = form.settings || {};
  const colors=form.colors||{};
  return `<section class="section form-section" style="${colorStyle(p)}"><div class="container section-center">${sectionHeading(p)}<div class="form-frame" style="background:${escapeAttr(colors.frameColor || "#fff")};color:${escapeAttr(colors.textColor || "#030303")}"><h3 style="color:${escapeAttr(colors.primaryColor || "#084F6E")}">${escapeHtml(tr.title || form.title)}</h3>${form.description ? `<p>${escapeHtml(form.description)}</p>` : ""}<form class="js-json-form form-grid ${form.formLayout === "columns" || form.layout === "two-column" ? "two-columns" : ""}" data-endpoint="${cruise ? "/api/cruise-requests" : "/api/custom-tour"}" data-success="${escapeAttr(settings.successMessage || "Thank you. Your request has been sent.")}" data-error="${escapeAttr(settings.errorMessage || "Unable to send your request.")}">${fields}<button class="btn btn-primary form-submit" style="--button-color:${escapeAttr(settings.submitButtonColor || colors.primaryColor || "#084F6E")}" type="submit">${escapeHtml(tr.submitButton || settings.submitButtonText || "Send")}</button><p class="form-status form-submit" aria-live="polite"></p></form></div></div></section>`;
}

function renderTours(p: SectionProps, lang: Language, withFilters = false): string {
  const x=p as any;
  const filters=withFilters?`<div class="tour-filters" style="background:${escapeAttr(x.filtersBgColor||"#fff")};color:${escapeAttr(x.filtersTextColor||"#374151")}"><h2>${escapeHtml(x.filtersTitle||"Filters")}</h2><div><input class="js-tour-search" type="search" placeholder="${escapeAttr(x.searchPlaceholder||"Search for a tour...")}"><select class="js-tour-price"><option value="all">All prices</option><option value="0-2000">0 - 2,000 THB</option><option value="2000-4000">2,000 - 4,000 THB</option><option value="4000-6000">4,000 - 6,000 THB</option><option value="6000+">6,000+ THB</option></select><select class="js-tour-duration"><option value="all">All durations</option><option value="1">1 day</option><option value="2">2+ days</option></select><select class="js-tour-destination"><option value="all">All destinations</option><option>Krabi</option><option>Koh Phi Phi</option><option>Phang Nga Bay</option><option>Railay</option></select></div></div>`:"";
  return `<section class="section" style="${colorStyle(p)}"><div class="container section-center">${withFilters?"":sectionHeading(p)}${filters}<div class="tour-catalogue js-tour-catalogue" style="--catalogue-columns:${x.desktopColumns || 3};--card-color:${escapeAttr(x.cardsColor || "#084F6E")}" data-language="${lang}" data-category="${escapeAttr(p.categoryFilter || "all")}" data-selected="${escapeAttr(JSON.stringify(p.selectedTourIds || []))}" data-desktop="${p.displayCountDesktop || 12}" data-tablet="${p.displayCountTablet || 8}" data-mobile="${p.displayCountMobile || 6}" data-return="/tours"><div class="catalogue-loading">Discovering our experiences…</div></div>${buttons(p)}</div></section>`;
}

export function renderSection(content: SiteContent, section: Section, lang: Language): SectionRenderResult {
  const p = localizedProps(content, section, lang);
  switch (section.type) {
    case "header_page": case "hero": case "hero_banner": case "hero_video":
      return { html: renderHero(p, section.type), supported: true };
    case "text": case "text_section": case "cta_banner": case "cta_section":
      return { html: `<section class="section" style="${colorStyle(p)}"><div class="container section-center">${sectionHeading(p)}${p.content ? `<div class="prose content-text" style="color:${escapeAttr(p.contentColor || p.textColor || "#374151")}">${p.content}</div>` : p.description ? `<p>${escapeHtml(p.description)}</p>` : ""}${buttons(p)}</div></section>`, supported: true };
    case "text_image": case "about_2col": case "who_we_are":
      if (section.type === "who_we_are") {
        const x=p as any, images=x.images||[], parts=x.sections||[];
        return {html:`<section class="section" style="${colorStyle(p)}"><div class="container"><div class="who-grid ${x.layoutStyle==="right"?"image-right":""}"><div class="who-images">${images.map((i:any)=>`<img src="${escapeAttr(i.url||i)}" alt="${escapeAttr(i.alt||p.title||"")}">`).join("")}</div><div>${sectionHeading(p)}${x.introduction?`<p style="color:${escapeAttr(x.textColor||"#374151")}">${escapeHtml(x.introduction)}</p>`:""}${parts.map((s:any)=>`<div class="who-part"><h3 style="color:${escapeAttr(p.subtitleColor||p.titleColor||"#1f2937")}">${escapeHtml(s.subtitle)}</h3><p>${escapeHtml(s.text)}</p></div>`).join("")}${buttons(p)}</div></div></div></section>`,supported:true};
      }
      return { html: `<section class="section" style="${colorStyle(p)}"><div class="split container"><div>${sectionHeading(p)}${p.content ? `<div class="prose">${p.content}</div>` : ""}${buttons(p)}</div><div>${media(p)}</div></div></section>`, supported: true };
    case "contact": case "contact_info": case "contact_cards":
      { const x=p as any, phone=x.phone||content.site.brand.phoneIntl, whatsapp=x.whatsapp||content.site.brand.whatsapp;
      return { html: `<section class="section" style="${colorStyle(p)}"><div class="container section-center">${sectionHeading(p)}<div class="contact-grid"><a class="contact-card" href="mailto:${escapeAttr(x.email || content.site.brand.email)}">${iconSvg("mail")}<span><strong>${escapeHtml(x.emailLabel || "Email")}</strong><small>${escapeHtml(x.email || content.site.brand.email)}</small></span></a><a class="contact-card" href="tel:${escapeAttr(phone.replace(/\s/g,""))}">${iconSvg("phone")}<span><strong>${escapeHtml(x.phoneLabel || "Phone")}</strong><small>${escapeHtml(phone)}</small></span></a><a class="contact-card" href="https://wa.me/${escapeAttr(whatsapp.replace(/[^0-9]/g,""))}" target="_blank" rel="noopener">${iconSvg("message")}<span><strong>${escapeHtml(x.whatsappLabel || "WhatsApp")}</strong><small>${escapeHtml(whatsapp)}</small></span></a>${x.lineId?`<div class="contact-card">${iconSvg("message")}<span><strong>${escapeHtml(x.lineIdLabel||"LINE")}</strong><small>${escapeHtml(x.lineId)}</small></span></div>`:""}</div>${x.showAboutCompany?`<div class="company-about"><h3>${escapeHtml(x.aboutTitle)}</h3><strong>${escapeHtml(x.companyBrand)}</strong><p>${escapeHtml(x.companyName)}</p>${x.companyLicense?`<span class="license-pill">Licence TAT : ${escapeHtml(x.companyLicense)}</span>`:""}<p>${escapeHtml(x.companyDescription)}</p></div>`:""}${buttons(p)}</div></section>`, supported: true };}
    case "form": case "custom_form": case "dynamic_form": case "custom_tour_form":
      return { html: renderForm(content, p, lang), supported: true };
    case "popular_experiences": case "tour_ninja_section": case "search_bar_tours":
      return { html: renderTours(p, lang, section.type === "search_bar_tours"), supported: true };
    case "advantages": case "card_grid": case "cards_grid": case "why_choose_us":
      return { html: renderCards(p), supported: true };
    case "blog_search":
      return { html: `<section class="section" style="${colorStyle(p)}"><div class="container section-center"><h2>${escapeHtml(p.title)}</h2><label class="search-label"><span class="sr-only">${escapeHtml((p as any).searchPlaceholder || "Search articles")}</span><input class="js-blog-search" type="search" placeholder="${escapeAttr((p as any).searchPlaceholder || "Search articles...")}"></label><div class="blog-filter-row"><button>${escapeHtml((p as any).allCategoriesText || "All categories")}</button><button>${escapeHtml((p as any).allTagsText || "All tags")}</button></div></div></section>`, supported: true };
    case "text_gallery": {
      const images = (p as any).images || (p as any).gallery || [];
      return { html: `<section class="section" style="${colorStyle(p)}"><div class="container section-center">${sectionHeading(p)}<div class="gallery gallery-${escapeAttr((p as any).carouselType || "grande")}">${images.map((i: any) => `<img src="${escapeAttr(i.url || i.imageUrl || i)}" alt="${escapeAttr(i.alt || "")}" loading="lazy">`).join("")}</div></div></section>`, supported: true };
    }
    case "text_video":
      { const x=p as any, type=x.videoType||"direct";let player="";if(type==="youtube"){const id=(p.videoUrl||"").match(/(?:youtu\.be\/|v=|embed\/)([^?&/]+)/)?.[1];if(id)player=`<iframe src="https://www.youtube.com/embed/${escapeAttr(id)}" title="${escapeAttr(p.title)}" allowfullscreen></iframe>`}else if(type==="vimeo"){const id=(p.videoUrl||"").match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];if(id)player=`<iframe src="https://player.vimeo.com/video/${escapeAttr(id)}" title="${escapeAttr(p.title)}" allowfullscreen></iframe>`}else if(p.videoUrl)player=`<video controls preload="metadata" src="${escapeAttr(p.videoUrl)}"></video>`;return { html: `<section class="section" style="${colorStyle(p)}"><div class="container section-center">${sectionHeading(p)}<div class="video-frame">${player||"<p>Video unavailable</p>"}</div></div></section>`, supported: true };}
    case "text_listing": {
      const x=p as any;return {html:`<section class="section" style="${colorStyle(p)}"><div class="container section-center">${sectionHeading(p)}<div class="listing">${(x.items||[]).map((i:any)=>`<div class="listing-item"><strong style="color:${escapeAttr(x.labelColor||"#084F6E")}">${escapeHtml(i.label)}</strong><div>${i.description||""}</div></div>`).join("")}</div></div></section>`,supported:true};
    }
    case "text_pricing": {
      const x=p as any;return {html:`<section class="section" style="${colorStyle(p)}"><div class="container section-center">${sectionHeading(p)}<div class="pricing-grid">${(x.pricingCards||[]).map((c:any)=>`<article class="pricing-card"><header style="background:linear-gradient(135deg,${escapeAttr(c.headerGradient||"#084F6E")},${escapeAttr(c.headerGradient||"#084F6E")}dd)"><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.subtitle)}</p></header><div><strong class="price">${escapeHtml(c.price)} <small>${escapeHtml(c.currency)}</small></strong><p>${escapeHtml(c.cycle)}</p><hr><b>${escapeHtml(c.label)}</b><p>${escapeHtml(c.moreText)}</p></div></article>`).join("")}</div>${x.showPickupSection?`<div class="pickup"><h3>${escapeHtml(x.pickupTitle)}</h3><div class="pickup-grid">${(x.pickupTimes||[]).map((v:any)=>`<div><strong>${escapeHtml(v.time)}</strong><span>${escapeHtml(v.location)}</span><b style="color:${escapeAttr(v.supplementColor||x.pickupPriceColor||"#084F6E")}">${escapeHtml(v.price)}</b></div>`).join("")}</div>${x.includedDescription?`<div class="include-card include"><span>${iconSvg("check")}</span><div><h3>${escapeHtml(x.includedTitle)}</h3><p>${escapeHtml(x.includedDescription)}</p></div></div>`:""}${x.notIncludedDescription?`<div class="include-card exclude"><span>×</span><div><h3>${escapeHtml(x.notIncludedTitle)}</h3><p>${escapeHtml(x.notIncludedDescription)}</p></div></div>`:""}</div>`:""}</div></section>`,supported:true};
    }
    default:
      return { html: `<!-- Type de section non pris en charge : ${escapeHtml(section.type)} -->`, supported: false };
  }
}