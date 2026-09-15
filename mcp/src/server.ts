import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { renderRoute } from "../../site/src/build.js";
import { z } from "zod";
import matter from "gray-matter";
import {
  addSection, applyChanges, assertValid, createPage, deleteFile, deletePage, deleteSection, findPage,
  readContent, replaceJson, updateMarkdown, updatePage, updateSection, updateSeo, type Mutation,
} from "./cms.js";
import { SECTION_TYPES } from "../../site/src/schema.js";
import type { ContentRepo } from "./repo/types.js";

type Options = {
  repo: ContentRepo; siteBaseUrl?: string; edgeBaseUrl?: string;
  tourNinja: { proxyUrl: string }; clientName?: string;
};
const writeOptions = {
  commitMode: z.enum(["main", "pr"]).default("main").optional(),
  commitMessage: z.string().optional(), branch: z.string().optional(),
};
const anyObject = z.record(z.any());

const sectionDescriptions: Record<string, string> = {
  hero: "title, subtitle, imageUrl/backgroundImage, buttons", text: "title, content",
  text_image: "title, content, imageUrl, imageAlt", cta_banner: "title, content, ctaText, ctaUrl",
  form: "title, formId", tour_ninja_section: "title, categoryFilter, selectedTourIds",
};

function result(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }], structuredContent: (Array.isArray(value) || value === null || typeof value !== "object" ? { result: value } : value) as Record<string, unknown> };
}
function slugify(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function deepMerge(base: any, patch: any): any {
  if (!base || !patch || typeof base !== "object" || typeof patch !== "object" || Array.isArray(base) || Array.isArray(patch)) return patch;
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) out[k] = k in out ? deepMerge(out[k], v) : v;
  return out;
}

export function createMcpServer(options: Options): McpServer {
  const { repo } = options;
  const server = new McpServer({ name: "amon-tour-cms", version: "1.0.0" });
  const register = (name: string, description: string, schema: any, handler: (args: any) => Promise<unknown> | unknown) =>
    server.registerTool(name, { description: `${description} / ${description.includes("Lire") ? "Read CMS content." : "Gestion du CMS Amon Tour."}`, inputSchema: schema },
      async (args: any) => result(await handler(args)));
  const write = (name: string, area: string, description: string, schema: any, mutate: (files: Map<string, string>, args: any) => Mutation | Promise<Mutation>) =>
    register(name, description, { ...schema, ...writeOptions }, async (args) => {
      const tree = await repo.readTree();
      const mutation = await mutate(tree.files, args);
      const mode = args.commitMode ?? "main";
      const branch = mode === "pr" ? (args.branch ?? `cms/${area}-${Date.now()}`) : undefined;
      const commit = await repo.commit(mutation.changes, {
        message: args.commitMessage ?? `cms(${area}): ${mutation.summary} [via MCP${options.clientName ? `/${options.clientName}` : ""}]`,
        branch, createPr: mode === "pr" ? { title: mutation.summary, body: "Modification proposée via le CMS MCP Amon Tour." } : undefined,
      });
      return { commit, summary: mutation.summary };
    });
  const read = async () => (await repo.readTree()).files;

  register("list_pages", "List all dynamic pages. Lister les pages.", {}, async () => readContent(await read()).pages.map(({ sections, ...p }) => ({ ...p, sectionCount: sections.length })));
  register("get_page", "Get full page JSON and section summary. Lire une page.", { page: z.string() }, async ({ page }) => {
    const p = findPage(await read(), page);
    return { ...p, sectionSummary: p.sections.map((s) => ({ id: s.id, type: s.type, title: s.props.title })) };
  });
  write("create_page", "pages", "Create a validated page. Créer une page.", {
    slug: z.string(), name: z.string(), type: z.enum(["main", "secondary", "legal", "system"]), seo: anyObject, sections: z.array(z.any()).optional(),
  }, (f, a) => createPage(f, a));
  write("update_page", "pages", "Update page metadata. Modifier une page.", {
    page: z.string(), name: z.string().optional(), active: z.boolean().optional(), sitemap: anyObject.optional(), type: z.enum(["main", "secondary", "legal", "system"]).optional(),
  }, (f, { page, ...patch }) => updatePage(f, page, patch));
  write("delete_page", "pages", "Delete a page. Supprimer une page.", { page: z.string() }, (f, a) => deletePage(f, a.page));
  register("list_sections", "List sections of a page. Lister les sections.", { page: z.string() }, async (a) => findPage(await read(), a.page).sections);
  register("get_section", "Get one section. Lire une section.", { page: z.string(), sectionId: z.string() }, async (a) => {
    const s = findPage(await read(), a.page).sections.find((x) => x.id === a.sectionId);
    if (!s) throw new Error(`Section introuvable: ${a.sectionId}`); return s;
  });
  write("add_section", "sections", "Add and validate a section. Ajouter une section.", {
    page: z.string(), type: z.enum(SECTION_TYPES), props: anyObject, position: z.number().int().optional(), afterSectionId: z.string().optional(), i18n: anyObject.optional(),
  }, (f, { page, ...a }) => addSection(f, page, a));
  write("update_section", "sections", "Patch section props/translations. Modifier une section.", {
    page: z.string(), sectionId: z.string(), props: anyObject.optional(), i18n: anyObject.optional(), active: z.boolean().optional(), order: z.number().int().optional(),
  }, (f, { page, sectionId, ...a }) => updateSection(f, page, sectionId, a));
  write("move_section", "sections", "Move a section. Déplacer une section.", { page: z.string(), sectionId: z.string(), order: z.number().int() },
    (f, a) => updateSection(f, a.page, a.sectionId, { order: a.order }));
  write("delete_section", "sections", "Delete a section. Supprimer une section.", { page: z.string(), sectionId: z.string() },
    (f, a) => deleteSection(f, a.page, a.sectionId));
  register("list_section_types", "List allowed section types and expected props. Types de sections.", {}, () =>
    SECTION_TYPES.map((type) => ({ type, expectedProps: sectionDescriptions[type] ?? "Heterogeneous legacy props; title/content are commonly supported." })));

  register("get_seo", "Get page SEO. Lire le SEO.", { page: z.string(), lang: z.enum(["en", "fr", "es"]).optional() }, async (a) => {
    const seo = findPage(await read(), a.page).seo; return a.lang ? (seo as any)[a.lang] ?? {} : seo;
  });
  write("update_seo", "seo", "Update localized SEO fields. Modifier le SEO.", {
    page: z.string(), lang: z.enum(["en", "fr", "es"]), seo: anyObject,
  }, (f, a) => updateSeo(f, a.page, a.lang, a.seo));
  register("seo_audit", "Audit title and description fields and lengths. Auditer le SEO.", {}, async () =>
    readContent(await read()).pages.flatMap((p) => (["en", "fr", "es"] as const).map((lang) => {
      const seo = p.seo[lang] ?? {}; return { page: p.slug, lang, titleLength: seo.title?.length ?? 0,
        descriptionLength: seo.description?.length ?? 0, missing: ["title", "description"].filter((k) => !(seo as any)[k]) };
    })));

  for (const [tool, key] of [["navigation", "navigation"], ["footer", "footer"], ["theme", "theme"], ["announcements", "announcements"]] as const) {
    register(`get_${tool}`, `Get ${tool} configuration. Lire ${tool}.`, {}, async () => (readContent(await read()) as any)[key]);
    write(`update_${tool}`, tool, `Update ${tool} configuration. Modifier ${tool}.`, {
      patch: anyObject.optional(), value: anyObject.optional(), items: z.array(z.any()).optional(), operations: z.array(z.any()).optional(),
      colors: anyObject.optional(), typography: anyObject.optional(), buttons: anyObject.optional(),
      banner: anyObject.optional(), notificationBar: anyObject.optional(), popup: anyObject.optional(),
      contactInfo: z.array(z.any()).optional(), usefulLinks: z.array(z.any()).optional(), socialMedia: z.array(z.any()).optional(),
      newsletter: anyObject.optional(), copyright: anyObject.optional(),
    }, (f, a) => {
      const current = (readContent(f) as any)[key];
      const { value, patch, commitMode, commitMessage, branch, operations, ...direct } = a;
      let next = value ?? deepMerge(current, patch ?? direct);
      if (tool === "navigation" && operations) {
        next = structuredClone(current);
        for (const op of operations) {
          if (op.op === "add") next.items.splice(op.position ?? next.items.length, 0, op.item);
          else if (op.op === "remove") next.items = next.items.filter((x: any) => String(x.id) !== String(op.id));
          else if (op.op === "reorder") {
            const index = next.items.findIndex((x: any) => String(x.id) === String(op.id));
            if (index >= 0) next.items.splice(op.position, 0, next.items.splice(index, 1)[0]);
          } else throw new Error(`Opération de navigation inconnue: ${op.op}`);
        }
        next.items.forEach((x: any, i: number) => { x.order = i; });
      }
      return replaceJson(f, `${tool}.json`, next, `${tool} mis à jour`);
    });
  }

  register("list_blog_posts", "List blog posts, optionally by status. Lister les articles.", { status: z.enum(["draft", "published", "archived"]).optional() }, async (a) =>
    readContent(await read()).blog.posts.filter((p) => !a.status || p.meta.status === a.status).map((p) => ({ ...p.meta, file: p.file })));
  register("get_blog_post", "Get a blog post. Lire un article.", { slug: z.string() }, async (a) => {
    const p = readContent(await read()).blog.posts.find((x) => x.meta.slug === a.slug); if (!p) throw new Error("Article introuvable"); return p;
  });
  write("create_blog_post", "blog", "Create a Markdown/HTML blog post. Créer un article.", {
    title: z.string(), slug: z.string().optional(), content: z.string(), excerpt: z.string().nullable().optional(), coverImage: z.string().nullable().optional(),
    category: z.string().nullable().optional(), tags: z.array(z.string()).default([]), status: z.enum(["draft", "published", "archived"]),
    publishDate: z.string().nullable().optional(), seo: anyObject.optional(),
  }, (f, a) => {
    const slug = a.slug ?? slugify(a.title); const { content, ...meta } = { ...a, slug };
    if (f.has(`content/blog/posts/${slug}.md`)) throw new Error("Cet article existe déjà");
    return updateMarkdown(f, `content/blog/posts/${slug}.md`, meta, content, `article ${slug} créé`);
  });
  write("update_blog_post", "blog", "Update a blog post. Modifier un article.", { slug: z.string(), patch: anyObject, content: z.string().optional() }, (f, a) => {
    const raw = f.get(`content/blog/posts/${a.slug}.md`); if (!raw) throw new Error("Article introuvable");
    const doc = matter(raw); return updateMarkdown(f, `content/blog/posts/${a.slug}.md`, { ...doc.data, ...a.patch }, a.content ?? doc.content, `article ${a.slug} mis à jour`);
  });
  write("delete_blog_post", "blog", "Delete a blog post. Supprimer un article.", { slug: z.string() },
    (f, a) => deleteFile(f, `content/blog/posts/${a.slug}.md`, `article ${a.slug} supprimé`));
  for (const kind of ["categories", "tags"] as const) {
    register(`list_blog_${kind}`, `List blog ${kind}. Lister les ${kind}.`, {}, async () => (readContent(await read()).blog as any)[kind]);
    write(`create_blog_${kind.slice(0, -1)}`, "blog", `Create a blog ${kind.slice(0, -1)}. Créer une entrée.`, { name: z.string(), slug: z.string().optional(), description: z.string().optional() }, (f, a) => {
      const list = (readContent(f).blog as any)[kind]; const id = Math.max(0, ...list.map((x: any) => x.id)) + 1;
      list.push({ id, name: a.name, slug: a.slug ?? slugify(a.name), ...(kind === "categories" ? { description: a.description ?? null } : {}) });
      return replaceJson(f, `blog/${kind}.json`, list, `${kind.slice(0, -1)} créé`);
    });
  }

  register("list_static_pages", "List static/legal pages. Lister les pages statiques.", {}, async () => readContent(await read()).staticPages.map((p) => p.meta));
  register("get_static_page", "Get static page front matter and body. Lire une page statique.", { slug: z.string() }, async (a) => {
    const p = readContent(await read()).staticPages.find((x) => x.meta.slug === a.slug); if (!p) throw new Error("Page statique introuvable"); return p;
  });
  write("update_static_page", "static", "Update a static/legal page. Modifier une page statique.", {
    slug: z.string(), title: z.string().optional(), metaTitle: z.string().optional(), metaDescription: z.string().optional(), body: z.string().optional(), published: z.boolean().optional(),
  }, (f, a) => {
    const path = `content/static-pages/${a.slug}.md`, raw = f.get(path); if (!raw) throw new Error("Page statique introuvable");
    const doc = matter(raw), { body, slug, ...meta } = a; return updateMarkdown(f, path, { ...doc.data, ...meta }, body ?? doc.content, `page statique ${slug} mise à jour`);
  });
  write("create_static_page", "static", "Create a static/legal page. Créer une page statique.", {
    slug: z.string(), title: z.string(), metaTitle: z.string().optional(), metaDescription: z.string().optional(), body: z.string(), published: z.boolean().default(true),
  }, (f, { body, ...meta }) => updateMarkdown(f, `content/static-pages/${meta.slug}.md`, meta, body, `page statique ${meta.slug} créée`));

  register("list_media", "Search the media manifest. Chercher les médias.", { search: z.string().optional(), folder: z.string().optional() }, async (a) => {
    const manifest = JSON.parse((await read()).get("media/manifest.json") ?? '{"items":[]}');
    return manifest.items.filter((x: any) => (!a.folder || x.folder === a.folder) && (!a.search || JSON.stringify(x).toLowerCase().includes(a.search.toLowerCase())));
  });
  register("upload_media", "Upload media up to 5 MB and update its manifest. Envoyer un média.", {
    filename: z.string(), data: z.string(), altText: z.string().optional(), folder: z.string().optional(),
  }, async (a) => {
    const data = Buffer.from(a.data, "base64"); if (data.length > 5 * 1024 * 1024) throw new Error("Le fichier dépasse la limite de 5 Mo");
    const safe = a.filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-"), now = new Date();
    const rel = `media/uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${safe}`;
    const uploaded = await repo.uploadBinary(rel, a.data, `cms(media): upload ${safe} [via MCP]`);
    const tree = await repo.readTree(), manifest = JSON.parse(tree.files.get("media/manifest.json") ?? '{"generatedAt":"","items":[]}');
    const publicPath = `/${rel}`; manifest.generatedAt = now.toISOString();
    manifest.items.push({ path: publicPath, filename: safe, originalName: a.filename, fileSize: data.length, altText: a.altText ?? null, folder: a.folder ?? null, source: "mcp_upload", createdAt: now.toISOString() });
    const commit = await repo.commit(new Map([["media/manifest.json", JSON.stringify(manifest, null, 2) + "\n"]]), { message: `cms(media): index ${safe} [via MCP]` });
    return { path: publicPath, upload: uploaded, commit };
  });
  write("update_media_metadata", "media", "Update media metadata. Modifier les métadonnées média.", { path: z.string(), altText: z.string().nullable().optional(), caption: z.string().nullable().optional(), folder: z.string().nullable().optional() }, (f, a) => {
    const manifest = JSON.parse(f.get("media/manifest.json") ?? '{"generatedAt":"","items":[]}'), item = manifest.items.find((x: any) => x.path === a.path);
    if (!item) throw new Error("Média introuvable"); Object.assign(item, a); const changes = new Map([["media/manifest.json", JSON.stringify(manifest, null, 2) + "\n"]]);
    assertValid(f, changes); return { changes, summary: `métadonnées de ${a.path} mises à jour` };
  });
  register("find_media_usages", "Find content files referencing a media path. Trouver les usages média.", { path: z.string() }, async (a) =>
    Array.from(await read()).filter(([p, text]) => p.startsWith("content/") && text.includes(a.path)).map(([p]) => p));

  register("get_translations", "Get a translation catalog or section. Lire les traductions.", { lang: z.enum(["en", "fr", "es"]), section: z.string().optional() }, async (a) => {
    const catalog = (readContent(await read()).translations as any)[a.lang]; return a.section ? catalog[a.section] : catalog;
  });
  write("update_translations", "translations", "Deep merge translation keys. Modifier les traductions.", { lang: z.enum(["en", "fr", "es"]), patch: anyObject }, (f, a) =>
    replaceJson(f, `translations/ui.${a.lang}.json`, deepMerge((readContent(f).translations as any)[a.lang], a.patch), `traductions ${a.lang} mises à jour`));
  register("list_missing_translations", "Compare canonical section props with fr/es overrides. Traductions manquantes.", { page: z.string() }, async (a) => {
    const p = findPage(await read(), a.page); return p.sections.flatMap((s) => ["fr", "es"].flatMap((lang) =>
      Object.keys(s.props).filter((k) => typeof (s.props as any)[k] === "string" && !(s.i18n as any)?.[lang]?.[k]).map((key) => ({ sectionId: s.id, lang, key }))));
  });

  register("list_forms", "List forms. Lister les formulaires.", {}, async () => readContent(await read()).forms);
  register("get_form", "Get a form. Lire un formulaire.", { id: z.union([z.string(), z.number()]) }, async (a) => {
    const form = readContent(await read()).forms.find((f) => String(f.id) === String(a.id)); if (!form) throw new Error("Formulaire introuvable"); return form;
  });
  write("update_form", "forms", "Update form fields/settings/translations. Modifier un formulaire.", {
    id: z.union([z.string(), z.number()]), fields: z.array(z.any()).optional(), settings: anyObject.optional(), translations: anyObject.optional(),
  }, (f, a) => {
    const form = readContent(f).forms.find((x) => String(x.id) === String(a.id)); if (!form) throw new Error("Formulaire introuvable");
    Object.assign(form, { ...(a.fields ? { fields: a.fields } : {}), ...(a.settings ? { settings: a.settings } : {}), ...(a.translations ? { translations: a.translations } : {}) });
    return replaceJson(f, `forms/${form.id}.json`, form, `formulaire ${form.id} mis à jour`);
  });

  register("list_tour_ninja_tours", "Read Tour Ninja catalogue. Lire le catalogue Tour Ninja.", { language: z.string().optional(), fresh: z.boolean().optional() }, async (a) => {
    const base = options.edgeBaseUrl ? `${options.edgeBaseUrl}/api/proxy/tours` : options.tourNinja.proxyUrl;
    const response = await fetch(`${base}?${new URLSearchParams({ ...(a.language ? { language: a.language } : {}), ...(a.fresh ? { fresh: "true" } : {}) })}`);
    if (!response.ok) throw new Error(`Tour Ninja: HTTP ${response.status}`); const data: any = await response.json();
    const tours = Array.isArray(data) ? data : data.tours ?? data.data ?? [];
    return tours.map((t: any) => ({ id: String(t.id), name: t.name ?? t.title, price: t.price, duration: t.duration, category: t.category, image: t.image ?? t.imageUrl,
      detailsUrl: `https://tourninja.io/details/${t.id}`, bookUrl: t.bookUrl ?? `https://tourninja.io/book/${t.id}` }));
  });
  register("get_tour_image_overrides", "Get Tour Ninja image overrides. Lire les images remplacées.", {}, async () => readContent(await read()).imageOverrides);
  write("set_tour_image_override", "tour-ninja", "Set a Tour Ninja image override. Remplacer une image Tour Ninja.", {
    tourNinjaId: z.string(), tourName: z.string(), imageUrl: z.string(), active: z.boolean(),
  }, (f, a) => {
    const list: any[] = readContent(f).imageOverrides, existing = list.find((x) => x.tourNinjaId === a.tourNinjaId);
    const item = { tourNinjaId: a.tourNinjaId, tourName: a.tourName, imageSourceType: a.imageUrl.startsWith("https") ? "direct_url" : "media",
      customImageUrl: a.imageUrl, directImageUrl: a.imageUrl.startsWith("https") ? a.imageUrl : null, active: a.active };
    existing ? Object.assign(existing, item) : list.push(item);
    return replaceJson(f, "tour-ninja/image-overrides.json", list, `image Tour Ninja ${a.tourNinjaId} mise à jour`);
  });

  register("list_redirects", "List redirects. Lister les redirections.", {}, async () => readContent(await read()).redirects);
  write("add_redirect", "redirects", "Add a redirect. Ajouter une redirection.", { from: z.string(), to: z.string(), status: z.union([z.literal(301), z.literal(302)]).default(301), note: z.string().optional() }, (f, a) => {
    const list = readContent(f).redirects; if (list.some((x) => x.from === a.from)) throw new Error("Cette source existe déjà");
    list.push(a); return replaceJson(f, "redirects.json", list, `redirection ${a.from} ajoutée`);
  });
  write("remove_redirect", "redirects", "Remove a redirect. Supprimer une redirection.", { from: z.string() }, (f, a) =>
    replaceJson(f, "redirects.json", readContent(f).redirects.filter((x) => x.from !== a.from), `redirection ${a.from} supprimée`));

  register("validate_content", "Validate the complete current content tree. Valider le contenu.", {}, async () => {
    const files = await read(); assertValid(files); return { ok: true, fileCount: files.size };
  });
  register("preview_page", "Render a page preview and heading outline. Prévisualiser une page.", {
    page: z.string(), lang: z.enum(["en", "fr", "es"]).default("en"), pendingPatch: z.object({ sectionId: z.string(), props: anyObject }).optional(),
  }, async (a) => {
    let files = await read();
    if (a.pendingPatch) files = applyChanges(files, updateSection(files, a.page, a.pendingPatch.sectionId, { props: a.pendingPatch.props }).changes);
    const content = readContent(files), page = findPage(files, a.page);
    let html: string;
    try {
      html = renderRoute(content, page.path, a.lang)?.html ?? "";
    } catch { html = `<h1>${(page.seo as any)[a.lang]?.title ?? page.name}</h1>`; }
    const localizedSeo = (page.seo as any)[a.lang] ?? {};
    const outline: string[] = [], heading = /<(h[12])[^>]*>([\s\S]*?)<\/\1>/gi;
    let match: RegExpExecArray | null;
    while ((match = heading.exec(html))) outline.push(`${match[1].toUpperCase()}: ${match[2].replace(/<[^>]+>/g, "")}`);
    return { html, outline, title: localizedSeo.title, description: localizedSeo.description, page };
  });
  register("publish_status", "Aggregate repository and deployed edge status. Statut de publication.", {}, async () => {
    const status: any = { repository: await repo.getStatus() };
    if (options.edgeBaseUrl) try { status.edge = await (await fetch(`${options.edgeBaseUrl}/api/publish/status`)).json(); } catch (e) { status.edgeError = String(e); }
    return status;
  });
  register("trigger_rebuild", "Trigger an edge rebuild. Relancer la publication.", {}, async () => {
    if (!options.edgeBaseUrl) throw new Error("edgeBaseUrl non configuré");
    const token = process.env.MCP_AUTH_TOKEN; const response = await fetch(`${options.edgeBaseUrl}/api/publish/rebuild`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) throw new Error(`Rebuild: HTTP ${response.status}`); return response.json();
  });
  register("get_commit_history", "List recent commits touching content. Historique du contenu.", { limit: z.number().int().min(1).max(100).default(20) }, async (a) => {
    const capable = repo as ContentRepo & { getCommitHistory?: (limit: number) => Promise<unknown> };
    return capable.getCommitHistory ? capable.getCommitHistory(a.limit) : [];
  });

  server.registerResource("pages", "content://pages", { mimeType: "application/json" }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(readContent(await read()).pages.map((p) => ({ slug: p.slug, name: p.name, path: p.path }))) }],
  }));
  server.registerResource("page", new ResourceTemplate("content://pages/{slug}", { list: undefined }), { mimeType: "application/json" }, async (uri, vars) => ({
    contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(findPage(await read(), String(vars.slug)), null, 2) }],
  }));
  server.registerResource("site", "content://site", { mimeType: "application/json" }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(readContent(await read()).site, null, 2) }],
  }));
  (server.registerPrompt as any)("edit_page_seo", { description: "Guide an SEO edit for one page.", argsSchema: { page: z.string(), lang: z.enum(["en", "fr", "es"]).default("en") } }, ({ page, lang }: any) => ({
    messages: [{ role: "user", content: { type: "text", text: `Audit page "${page}" in ${lang}, propose concise title and description, then call update_seo after confirmation.` } }],
  }));
  return server;
}