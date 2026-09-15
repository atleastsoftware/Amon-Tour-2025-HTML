import type { Language, Section, SectionProps } from "./schema.js";
import type { SiteContent } from "./content.js";

export const escapeHtml = (value: unknown): string => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
export const escapeAttr = escapeHtml;
export const stripTags = (value: string): string => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
export const truncate = (value: string, max: number): string => value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
export const absoluteUrl = (base: string, value?: string | null): string | undefined =>
  value ? (/^https?:\/\//i.test(value) ? value : `${base}${value.startsWith("/") ? "" : "/"}${value}`) : undefined;

function setIndexed(target: Record<string, any>, key: string, value: any): boolean {
  const match = key.match(/^(button|buttons|feature|item|card|icon_block|section|image)_(\d+)_(.+)$/);
  if (!match) return false;
  const [, rawCollection, rawIndex, rawField] = match;
  const collection = rawCollection === "button" || rawCollection === "buttons" ? "buttons" : rawCollection === "icon_block" ? "iconBlocks" : `${rawCollection}s`;
  const index = Number(rawIndex);
  const field = rawField.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  target[collection] = Array.isArray(target[collection]) ? [...target[collection]] : [];
  target[collection][index] = { ...(target[collection][index] || {}), [field]: value };
  return true;
}

/** Convertit les anciennes clés du catalogue en propriétés modernes. */
export function normalizeOverrides(input: Record<string, any> = {}): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (setIndexed(out, key, value)) continue;
    out[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return out;
}

export function localizedProps(content: SiteContent, section: Section, lang: Language): SectionProps {
  if (lang === "en") return section.props;
  const catalogKey = section.legacy?.blockId === undefined ? undefined : `${section.type}_${section.legacy.blockId}`;
  const catalog = catalogKey ? content.translations[lang]?.[catalogKey] : undefined;
  return {
    ...section.props,
    ...normalizeOverrides(catalog || {}),
    ...normalizeOverrides((section.i18n?.[lang] || {}) as Record<string, any>),
  };
}

export function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}