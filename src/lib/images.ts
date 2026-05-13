export const responsiveImageWidths = [640, 960, 1280, 1600, 1920] as const;

const CONVERTIBLE_IMAGE_PATTERN = /^\/media\/.+\.(?:jpe?g|png)$/i;

export type ModernImageSources = {
  src: string;
  avifSrcSet?: string;
  webpSrcSet?: string;
  fallbackSrcSet?: string;
  mimeType?: string;
};

export function getModernImageSources(src: string): ModernImageSources {
  if (!CONVERTIBLE_IMAGE_PATTERN.test(src)) return { src };

  const extension = src.split('.').pop()?.toLowerCase();
  const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

  return {
    src: encodeURI(src),
    avifSrcSet: buildGeneratedSrcSet(src, 'avif'),
    webpSrcSet: buildGeneratedSrcSet(src, 'webp'),
    fallbackSrcSet: buildFallbackSrcSet(src),
    mimeType,
  };
}

export function buildBackgroundImage(image: string, preferredWidth = 1600) {
  const sources = getModernImageSources(image);
  const overlay = 'linear-gradient(180deg, rgba(18, 11, 6, .04), rgba(18, 11, 6, .62))';

  if (!sources.avifSrcSet || !sources.webpSrcSet || !sources.mimeType) {
    return `${overlay}, url('${escapeCssUrl(image)}')`;
  }

  const backgroundWidth = responsiveImageWidths.includes(preferredWidth as never) ? preferredWidth : 1600;
  const imageSet = [
    `url('${generatedImageUrl(image, backgroundWidth, 'avif')}') type('image/avif')`,
    `url('${generatedImageUrl(image, backgroundWidth, 'webp')}') type('image/webp')`,
    `url('${escapeCssUrl(image)}') type('${sources.mimeType}')`,
  ]
    .join(', ');

  return `${overlay}, image-set(${imageSet})`;
}

function buildGeneratedSrcSet(src: string, format: 'avif' | 'webp') {
  return responsiveImageWidths.map((width) => `${generatedImageUrl(src, width, format)} ${width}w`).join(', ');
}

function buildFallbackSrcSet(src: string) {
  return responsiveImageWidths.map((width) => `${escapeHtmlUrl(src)} ${width}w`).join(', ');
}

function generatedImageUrl(src: string, width: number, format: 'avif' | 'webp') {
  const extensionIndex = src.lastIndexOf('.');
  const withoutExtension = extensionIndex === -1 ? src : src.slice(0, extensionIndex);
  const generatedPath = withoutExtension.replace(/^\/media\//, '/generated/media/');

  return escapeHtmlUrl(`${generatedPath}-${width}.${format}`);
}

function escapeHtmlUrl(src: string) {
  return encodeURI(src);
}

function escapeCssUrl(src: string) {
  return encodeURI(src).replace(/'/g, '%27');
}
