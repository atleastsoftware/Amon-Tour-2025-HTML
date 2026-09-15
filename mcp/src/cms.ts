import {
  loadContent, memorySource, stringifyJson, stringifyMarkdown, validateContent,
  type SiteContent,
} from "../../site/src/content.js";
import { pagePathFromSlug, type Page, type Section, type SectionType } from "../../site/src/schema.js";
import { decode } from "html-entities";
import sanitizeHtml from "sanitize-html";

export interface Mutation { changes: Map<string, string | null>; summary: string }

const allowedMarkupTags = new Set([
  "a", "address", "blockquote", "br", "code", "div", "em", "h1", "h2", "h3",
  "h4", "h5", "h6", "hr", "li", "ol", "p", "pre", "section", "span", "strong",
  "table", "tbody", "td", "th", "thead", "tr", "ul",
]);

function assertNoExecutableMarkup(changes: Map<string, string | null>) {
  for (const [path, value] of changes) {
    if (value === null) continue;
    const decoded = decode(value);
    let unsafe = /\b(?:javascript|vbscript)\s*:|data\s*:\s*text\/html|srcdoc\s*=/i.test(decoded);
    sanitizeHtml(decoded, {
      allowedTags: false,
      allowedAttributes: false,
      allowVulnerableTags: true,
      nonTextTags: [],
      transformTags: {
        "*": (tagName, attribs) => {
          if (!allowedMarkupTags.has(tagName.toLowerCase())) unsafe = true;
          for (const name of Object.keys(attribs)) {
            if (/^on/i.test(name) || name.toLowerCase() === "style") unsafe = true;
          }
          return { tagName, attribs };
        },
      },
    });
    if (unsafe) {
      throw new Error(`Validation du contenu refusée (${path}): balisage exécutable interdit`);
    }
  }
}

/** Adapte les chemins du dépôt (content/...) au chargeur du site. */
export function contentSource(files: Map<string, string>) {
  return memorySource(new Map(Array.from(files).filter(([k]) => k.startsWith("content/")).map(([k, v]) => [k.slice(8), v])));
}

export function readContent(files: Map<string, string>): SiteContent {
  return loadContent(contentSource(files));
}

export function applyChanges(files: Map<string, string>, changes: Map<string, string | null>) {
  const result = new Map(files);
  for (const [path, value] of Array.from(changes)) value === null ? result.delete(path) : result.set(path, value);
  return result;
}

export function assertValid(files: Map<string, string>, changes = new Map<string, string | null>()) {
  assertNoExecutableMarkup(changes);
  const result = validateContent(contentSource(applyChanges(files, changes)));
  if (!result.ok) throw new Error(`Validation du contenu refusée${result.file ? ` (${result.file})` : ""}: ${result.error}`);
  return result.content;
}

function jsonMutation(files: Map<string, string>, path: string, value: unknown, summary: string): Mutation {
  const changes = new Map<string, string | null>([[path, stringifyJson(value)]]);
  assertValid(files, changes);
  return { changes, summary };
}

export function findPage(files: Map<string, string>, slugOrPath: string): Page {
  const page = readContent(files).pages.find((p) => p.slug === slugOrPath || p.path === slugOrPath);
  if (!page) throw new Error(`Page introuvable: ${slugOrPath}`);
  return structuredClone(page);
}

export function updateSeo(files: Map<string, string>, pageId: string, lang: "en" | "fr" | "es", patch: Record<string, unknown>): Mutation {
  const page = findPage(files, pageId);
  page.seo[lang] = { ...(page.seo[lang] ?? {}), ...patch };
  return jsonMutation(files, `content/pages/${page.slug}.json`, page, `SEO ${lang} de ${page.slug} mis à jour`);
}

export function addSection(files: Map<string, string>, pageId: string, input: {
  type: SectionType; props?: Record<string, unknown>; position?: number; afterSectionId?: string;
  i18n?: Section["i18n"]; id?: string;
}): Mutation {
  const page = findPage(files, pageId);
  let position = input.position ?? page.sections.length;
  if (input.afterSectionId) {
    const index = page.sections.findIndex((s) => s.id === input.afterSectionId);
    if (index < 0) throw new Error(`Section introuvable: ${input.afterSectionId}`);
    position = index + 1;
  }
  position = Math.max(0, Math.min(position, page.sections.length));
  const id = input.id ?? `${input.type}_${Date.now()}`;
  page.sections.splice(position, 0, { id, type: input.type, order: position, active: true, props: input.props ?? {}, i18n: input.i18n });
  page.sections.forEach((s, i) => { s.order = i; });
  return jsonMutation(files, `content/pages/${page.slug}.json`, page, `section ${id} ajoutée à ${page.slug}`);
}

export function updateSection(files: Map<string, string>, pageId: string, id: string, patch: {
  props?: Record<string, unknown>; i18n?: Section["i18n"]; active?: boolean; order?: number;
}): Mutation {
  const page = findPage(files, pageId);
  const section = page.sections.find((s) => s.id === id);
  if (!section) throw new Error(`Section introuvable: ${id}`);
  if (patch.props) section.props = { ...section.props, ...patch.props };
  if (patch.i18n) section.i18n = { ...section.i18n, ...patch.i18n };
  if (patch.active !== undefined) section.active = patch.active;
  if (patch.order !== undefined) {
    page.sections.splice(page.sections.indexOf(section), 1);
    page.sections.splice(Math.max(0, Math.min(patch.order, page.sections.length)), 0, section);
  }
  page.sections.forEach((s, i) => { s.order = i; });
  return jsonMutation(files, `content/pages/${page.slug}.json`, page, `section ${id} mise à jour`);
}

export function deleteSection(files: Map<string, string>, pageId: string, id: string): Mutation {
  const page = findPage(files, pageId);
  const index = page.sections.findIndex((s) => s.id === id);
  if (index < 0) throw new Error(`Section introuvable: ${id}`);
  page.sections.splice(index, 1);
  page.sections.forEach((s, i) => { s.order = i; });
  return jsonMutation(files, `content/pages/${page.slug}.json`, page, `section ${id} supprimée`);
}

export function createPage(files: Map<string, string>, input: Partial<Page> & Pick<Page, "slug" | "name" | "type" | "seo">): Mutation {
  if (files.has(`content/pages/${input.slug}.json`)) throw new Error(`La page ${input.slug} existe déjà`);
  const page = { path: pagePathFromSlug(input.slug), active: true, customCode: false, sections: [], ...input };
  return jsonMutation(files, `content/pages/${input.slug}.json`, page, `page ${input.slug} créée`);
}

export function updatePage(files: Map<string, string>, pageId: string, patch: Partial<Pick<Page, "name" | "active" | "sitemap" | "type">>): Mutation {
  const page = Object.assign(findPage(files, pageId), patch);
  return jsonMutation(files, `content/pages/${page.slug}.json`, page, `page ${page.slug} mise à jour`);
}

export function deletePage(files: Map<string, string>, pageId: string): Mutation {
  const page = findPage(files, pageId);
  const changes = new Map<string, string | null>([[`content/pages/${page.slug}.json`, null]]);
  assertValid(files, changes);
  return { changes, summary: `page ${page.slug} supprimée` };
}

export function replaceJson(files: Map<string, string>, relativePath: string, value: unknown, summary: string) {
  return jsonMutation(files, `content/${relativePath}`, value, summary);
}

export function updateMarkdown(files: Map<string, string>, path: string, meta: Record<string, unknown>, body: string, summary: string) {
  const changes = new Map<string, string | null>([[path, stringifyMarkdown(meta, body)]]);
  assertValid(files, changes);
  return { changes, summary };
}

export function deleteFile(files: Map<string, string>, path: string, summary: string): Mutation {
  const changes = new Map<string, string | null>([[path, null]]);
  assertValid(files, changes);
  return { changes, summary };
}