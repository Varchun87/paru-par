const SHORT_WORDS = [
  'а',
  'в',
  'во',
  'и',
  'к',
  'ко',
  'о',
  'об',
  'обо',
  'от',
  'до',
  'за',
  'из',
  'изо',
  'на',
  'над',
  'не',
  'ни',
  'но',
  'по',
  'под',
  'при',
  'про',
  'с',
  'со',
  'у',
  'без',
  'для',
  'или',
  'как',
  'что',
  'это',
  'мы',
  'вы',
  'он',
  'она',
  'они',
  'же',
  'ли',
  'бы',
] as const;

const SHORT_WORD_PATTERN = new RegExp(`(^|[\\s([{«"„])(${SHORT_WORDS.join('|')})\\s+`, 'giu');

const URL_KEYS = new Set([
  'image',
  'logo',
  'hero',
  'wide',
  'ritual',
  'brooms',
  'doll',
  'video',
  'ticketUrl',
  'mapUrl',
  'map2gisUrl',
  'vk',
  'telegram',
  'phoneHref',
  'whatsapp',
]);

export function keepShortWords(text: string) {
  let result = text;

  for (let index = 0; index < 3; index += 1) {
    const next = result.replace(SHORT_WORD_PATTERN, '$1$2\u00a0');
    if (next === result) break;
    result = next;
  }

  return result;
}

export function applyTextTypography<T>(value: T): T {
  return applyTypography(value) as T;
}

function applyTypography(value: unknown, key = ''): unknown {
  if (Array.isArray(value)) return value.map((item) => applyTypography(item, key));
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [entryKey, applyTypography(entryValue, entryKey)]));
  if (typeof value === 'string' && shouldFormatText(value, key)) return keepShortWords(value);

  return value;
}

function shouldFormatText(value: string, key: string) {
  if (URL_KEYS.has(key)) return false;
  if (!/[А-Яа-яЁё]/.test(value)) return false;
  if (value.startsWith('/') || value.startsWith('#') || value.startsWith('tel:') || value.startsWith('mailto:')) return false;
  if (value.startsWith('http://') || value.startsWith('https://')) return false;

  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
