import { memo, type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { buildBackgroundImage } from '../lib/images';

type LazyBackgroundProps = {
  as?: 'article' | 'div' | 'span';
  image: string;
  className?: string;
  children?: ReactNode;
  eager?: boolean;
};

function backgroundImage(image: string, preferredWidth?: number) {
  return buildBackgroundImage(image, preferredWidth);
}

export const LazyBackground = memo(function LazyBackground({
  as = 'article',
  image,
  className,
  children,
  eager = false,
}: LazyBackgroundProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(eager);

  useEffect(() => {
    if (eager || isVisible) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '360px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager, isVisible]);

  const Component = as;
  const style: CSSProperties | undefined = isVisible ? { backgroundImage: backgroundImage(image) } : undefined;

  return (
    <Component ref={ref as never} className={className} style={style}>
      {children}
    </Component>
  );
});

export { backgroundImage };
