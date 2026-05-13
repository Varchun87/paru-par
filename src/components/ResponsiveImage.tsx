import type { ImgHTMLAttributes } from 'react';
import { getModernImageSources } from '../lib/images';

type ResponsiveImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  sizes: string;
};

export function ResponsiveImage({ src, sizes, ...props }: ResponsiveImageProps) {
  const sources = getModernImageSources(src);

  if (!sources.avifSrcSet || !sources.webpSrcSet) {
    return <img src={sources.src} {...props} />;
  }

  return (
    <picture>
      <source srcSet={sources.avifSrcSet} sizes={sizes} type="image/avif" />
      <source srcSet={sources.webpSrcSet} sizes={sizes} type="image/webp" />
      <img src={sources.src} srcSet={sources.fallbackSrcSet} sizes={sizes} {...props} />
    </picture>
  );
}
