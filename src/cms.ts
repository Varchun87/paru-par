type JsonRecord = Record<string, unknown>;

const CMS_GLOBAL_KEY = '__PARUPAR_CMS__';
const MAX_STRING_LENGTH = 800;
const URL_KEYS = new Set(['image', 'logo', 'hero', 'wide', 'ritual', 'brooms', 'doll', 'video', 'ticketUrl', 'vk', 'telegram', 'phoneHref', 'whatsapp']);
const ALLOWED_VALUES: Record<string, ReadonlySet<string>> = {
  type: new Set(['Фото', 'Видео']),
  category: new Set(['Пармастера', 'Музыканты', 'Телесные практики']),
};

declare global {
  interface Window {
    [CMS_GLOBAL_KEY]?: unknown;
  }
}

export function applyCmsWhitelist<T extends JsonRecord>(fallback: T): T {
  const rawContent = readCmsPayload();
  if (!isRecord(rawContent)) return fallback;

  return whitelistByShape(fallback, rawContent) as T;
}

function readCmsPayload() {
  if (typeof window === 'undefined') return undefined;

  return window[CMS_GLOBAL_KEY];
}

function whitelistByShape(fallback: unknown, candidate: unknown, key = ''): unknown {
  if (Array.isArray(fallback)) return whitelistArray(fallback, candidate, key);
  if (isRecord(fallback)) return whitelistObject(fallback, candidate);
  if (typeof fallback === 'string') return whitelistString(fallback, candidate, key);
  if (typeof fallback === 'number') return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : fallback;
  if (typeof fallback === 'boolean') return typeof candidate === 'boolean' ? candidate : fallback;

  return fallback;
}

function whitelistArray(fallback: unknown[], candidate: unknown, key: string) {
  if (!Array.isArray(candidate)) return fallback;
  const itemShape = fallback[0];
  if (itemShape === undefined) return fallback;

  const items = candidate
    .slice(0, Math.max(fallback.length, 1) * 3)
    .map((item) => whitelistByShape(itemShape, item, key));

  return items.length > 0 ? items : fallback;
}

function whitelistObject(fallback: JsonRecord, candidate: unknown) {
  if (!isRecord(candidate)) return fallback;

  return Object.fromEntries(
    Object.entries(fallback).map(([key, value]) => [key, whitelistByShape(value, candidate[key], key)]),
  );
}

function whitelistString(fallback: string, candidate: unknown, key: string) {
  if (typeof candidate !== 'string') return fallback;

  const value = candidate.trim();
  if (!value || value.length > MAX_STRING_LENGTH) return fallback;

  if (URL_KEYS.has(key) && !isAllowedUrl(value)) return fallback;
  if (ALLOWED_VALUES[key] && !ALLOWED_VALUES[key].has(value)) return fallback;

  return value;
}

function isAllowedUrl(value: string) {
  return value.startsWith('/media/')
    || value.startsWith('/assets/')
    || value.startsWith('#')
    || value.startsWith('tel:')
    || value.startsWith('https://vk.com/')
    || value.startsWith('https://t.me/')
    || value.startsWith('https://wa.me/');
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
