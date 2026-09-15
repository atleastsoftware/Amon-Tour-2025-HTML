import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
// Vérification du pack client : exécute chaque scénario de prompt contre un serveur MCP.
// Usage : MCP_BASE=https://amon-tour.com MCP_TOKEN=... node scripts/migration/mcp-pack-check.mjs
// Par défaut : serveur local (npm run edge:dev avec MCP_AUTH_TOKEN) sur http://127.0.0.1:5000.
// Attention : crée puis supprime une page « test-pack-mcp », un article, une catégorie/un tag de blog, un média et une entrée d'image Tour Ninja (commits réels en production).
const base = process.env.MCP_BASE ?? "http://127.0.0.1:5000";
const token = process.env.MCP_TOKEN ?? "";
if (!token) { console.error("MCP_TOKEN manquant"); process.exit(1); }
const client = new Client({ name: "pack-client-check", version: "1.0" });
await client.connect(new StreamableHTTPClientTransport(new URL(base + "/mcp"), { requestInit: { headers: { Authorization: `Bearer ${token}` } } }));
const tools = (await client.listTools()).tools;
console.log("TOOLS", tools.length);
const results = [];
const call = async (label, name, args) => {
  try {
    const r = await client.callTool({ name, arguments: args });
    const t = r.content?.find((c) => c.type === "text")?.text ?? "";
    results.push({ label, name, ok: !r.isError, out: t.slice(0, 260) });
    console.log((r.isError ? "ERR  " : "OK   ") + label + " [" + name + "] " + t.replace(/\s+/g, " ").slice(0, 220));
    return t;
  } catch (e) {
    results.push({ label, name, ok: false, out: String(e).slice(0, 260) });
    console.log("EXC  " + label + " [" + name + "] " + String(e).slice(0, 220));
    return "";
  }
};
const j = (t) => { try { return JSON.parse(t); } catch { return null; } };

// 1 Inventaire
await call("inv.pages", "list_pages", {});
await call("inv.page", "get_page", { page: "home" });
await call("inv.types", "list_section_types", {});
await call("inv.validate", "validate_content", {});
await call("inv.history", "get_commit_history", { limit: 5 });
// 2 Pages
await call("page.create", "create_page", { slug: "test-pack-mcp", name: "Test pack MCP", type: "secondary", seo: { en: { title: "Test page — Amon Tour", description: "Temporary page created from the MCP pack check." } }, sections: [] });
await call("page.update", "update_page", { page: "test-pack-mcp", active: false, sitemap: { include: false } });
// 3 Sections
await call("sec.list", "list_sections", { page: "test-pack-mcp" });
const add = j(await call("sec.add", "add_section", { page: "test-pack-mcp", type: "text", props: { title: "Bienvenue", content: "<p>Texte de test.</p>" }, i18n: { fr: { title: "Bienvenue (fr)" } } }));
const secId = add?.summary?.match(/section (\S+) ajoutée/)?.[1];
console.log("secId", secId);
await call("sec.add2", "add_section", { page: "test-pack-mcp", type: "cta_banner", props: { title: "Réservez", content: "Contactez-nous", ctaText: "WhatsApp", ctaUrl: "https://wa.me/66000000000" } });
await call("sec.get", "get_section", { page: "test-pack-mcp", sectionId: secId });
await call("sec.update", "update_section", { page: "test-pack-mcp", sectionId: secId, props: { title: "Bienvenue chez Amon Tour" } });
await call("sec.move", "move_section", { page: "test-pack-mcp", sectionId: secId, order: 1 });
await call("sec.badtype", "add_section", { page: "test-pack-mcp", type: "carousel_3d", props: {} });
// 4 SEO
await call("seo.get", "get_seo", { page: "tours" });
await call("seo.update", "update_seo", { page: "test-pack-mcp", lang: "fr", seo: { title: "Page de test — Amon Tour", description: "Description FR de test entre 120 et 160 caractères pour vérifier que la mise à jour SEO multilingue fonctionne correctement.", canonical: "https://amon-tour.com/test-pack-mcp", noindex: true } });
await call("seo.update.og", "update_seo", { page: "test-pack-mcp", lang: "en", seo: { ogImage: "/media/brand/logo-amon.png" } });
await call("seo.audit", "seo_audit", {});
// 5 Navigation & footer
const nav = j(await call("nav.get", "get_navigation", {}));
await call("nav.add", "update_navigation", { operations: [{ op: "add", item: { id: 9901, label: { en: "Test", fr: "Test", es: "Test" }, url: "/test-pack-mcp", order: 99, active: true, target: "_self", iconName: null, description: null, children: [] } }] });
await call("nav.remove", "update_navigation", { operations: [{ op: "remove", id: 9901 }] });
if (nav) await call("nav.restore", "update_navigation", { value: nav });
const footer0 = j(await call("footer.get", "get_footer", {}));
await call("footer.patch", "update_footer", { patch: { copyright: { text: "© 2026 Amon Tour — test pack" } } });
if (footer0) await call("footer.restore", "update_footer", { value: footer0 });
// 6 Thème & annonces
const theme0 = j(await call("theme.get", "get_theme", {}));
await call("theme.patch", "update_theme", { patch: { colors: { primary: "#0A5A7C" } } });
if (theme0) await call("theme.restore", "update_theme", { value: theme0 });
const ann0 = j(await call("ann.get", "get_announcements", {}));
await call("ann.patch", "update_announcements", { patch: { banner: { enabled: true, text: "Offre spéciale test", linkUrl: "/tours", linkText: "Voir" } } });
await call("ann.off", "update_announcements", { patch: { banner: { enabled: false } } });
if (ann0) await call("ann.restore", "update_announcements", { value: ann0 });
// 7 Blog
await call("blog.list", "list_blog_posts", { status: "published" });
await call("blog.cats", "list_blog_categories", {});
await call("blog.tags", "list_blog_tags", {});
await call("blog.create", "create_blog_post", { title: "Test pack MCP : plage de Railay", content: "# Railay\n\nTexte de test.", excerpt: "Extrait de test", category: "tours-and-excursions", tags: ["krabi"], status: "draft", seo: { en: { title: "Railay — test", description: "Description de test." } } });
await call("blog.get", "get_blog_post", { slug: "test-pack-mcp-plage-de-railay" });
await call("blog.update", "update_blog_post", { slug: "test-pack-mcp-plage-de-railay", patch: { status: "published", publishDate: "2026-09-15T08:00:00.000Z" } });
await call("blog.cat.create", "create_blog_categorie", { name: "Test pack" });
await call("blog.tag.create", "create_blog_tag", { name: "test-pack" });
await call("blog.delete", "delete_blog_post", { slug: "test-pack-mcp-plage-de-railay" });
// 8 Pages statiques
await call("static.list", "list_static_pages", {});
const about0 = j(await call("static.get", "get_static_page", { slug: "about" }));
await call("static.update", "update_static_page", { slug: "about", metaDescription: "À propos d'Amon Tour — test pack." });
if (about0?.meta?.metaDescription) await call("static.restore", "update_static_page", { slug: "about", metaDescription: about0.meta.metaDescription });
// 9 Médias
await call("media.list", "list_media", { search: "logo" });
const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const up = j(await call("media.upload", "upload_media", { filename: "Pixel Test.png", data: png, altText: "pixel de test", folder: "tests" }));
if (up?.path) { await call("media.meta", "update_media_metadata", { path: up.path, altText: "pixel de test (modifié)" }); await call("media.usages", "find_media_usages", { path: "/media/brand/logo-amon.png" }); }
// 10 Traductions
const fr0 = j(await call("i18n.get", "get_translations", { lang: "fr" }));
await call("i18n.missing", "list_missing_translations", { page: "home" });
const navHome = fr0?.nav?.home ?? "Accueil";
await call("i18n.update", "update_translations", { lang: "fr", patch: { nav: { home: navHome + " " } } });
await call("i18n.restore", "update_translations", { lang: "fr", patch: { nav: { home: navHome } } });
// 11 Formulaires
await call("forms.list", "list_forms", {});
await call("forms.get", "get_form", { id: 2 });
// 12 Tour Ninja
await call("tn.list", "list_tour_ninja_tours", { language: "fr" });
await call("tn.overrides", "get_tour_image_overrides", {});
await call("tn.set", "set_tour_image_override", { tourNinjaId: "pack-test-id", tourName: "Tour de test", imageUrl: "https://amon-tour.com/media/brand/logo-amon.png", active: false });
await call("tn.feature", "add_section", { page: "test-pack-mcp", type: "tour_ninja_section", props: { title: "Nos coups de cœur", categoryFilter: "", selectedTourIds: ["VNbDPiuZIN"] } });
// 13 Redirections
await call("redir.list", "list_redirects", {});
await call("redir.add", "add_redirect", { from: "/ancienne-page-test", to: "/tours", status: 301, note: "test pack" });
await call("redir.remove", "remove_redirect", { from: "/ancienne-page-test" });
// 14 Prévisualisation / publication
const prev = await call("prev", "preview_page", { page: "test-pack-mcp", lang: "fr", pendingPatch: { sectionId: secId, props: { title: "Titre en attente" } } });
console.log("preview outline", j(prev)?.outline, "pending in html:", prev.includes("Titre en attente"));
await call("pub.status", "publish_status", {});
await call("pub.rebuild", "trigger_rebuild", {});
await call("pub.pr", "update_seo", { page: "test-pack-mcp", lang: "en", seo: { title: "Via PR" }, commitMode: "pr" });
// 15 Suppression et nettoyage
await call("sec.delete", "delete_section", { page: "test-pack-mcp", sectionId: secId });
await call("page.delete", "delete_page", { page: "test-pack-mcp" });
await call("page.delete.again", "delete_page", { page: "test-pack-mcp" });
await call("inv.validate2", "validate_content", {});
await client.close();
console.log("SUMMARY", results.filter((r) => r.ok).length, "/", results.length, "ok");
console.log("FAILED", results.filter((r) => !r.ok).map((r) => r.label + ": " + r.out.slice(0, 120)));
