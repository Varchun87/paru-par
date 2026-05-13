import { lazy, memo, Suspense } from 'react';
import { festival } from './content';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingVideo } from './components/FloatingVideo';
import { Header } from './components/Header';
import { LazyBackground } from './components/LazyBackground';
import { ResponsiveImage } from './components/ResponsiveImage';

const DeferredSections = lazy(() => import('./components/DeferredSections'));

const TICKER_ITEMS = ['парения', 'купели', 'мастера', 'сцена', 'маркет', 'музыка', 'чай', 'три дня', 'парения', 'купели', 'мастера', 'сцена'];

export function App() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Ticker />
        <Intro />
        <ErrorBoundary fallback={<SectionError />}>
          <Suspense fallback={<SectionFallback />}>
            <DeferredSections />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <FloatingVideo />
    </>
  );
}

const Hero = memo(function Hero() {
  return (
    <section className="hero section-full">
      <LazyBackground as="div" className="hero-backdrop" image={festival.assets.hero} eager />
      <a
        className="hero-top-logo"
        href="#top"
        aria-label="Пару Пар"
      >
        <ResponsiveImage src={festival.assets.logo} sizes="(max-width: 700px) 72vw, 470px" alt={festival.name} fetchPriority="high" decoding="async" />
      </a>
      <h1 className="sr-only">{festival.tagline}</h1>
    </section>
  );
});

const Ticker = memo(function Ticker() {
  return (
    <section className="ticker" aria-label="Темы фестиваля">
      <div>
        {TICKER_ITEMS.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </section>
  );
});

const Intro = memo(function Intro() {
  return (
    <section className="section intro-grid">
      <div className="intro-poster">
        <span>Площадка</span>
        <strong>{festival.place}</strong>
      </div>
      <div>
        <p className="eyebrow">Формат</p>
        <h2>Один город. Одна большая площадка. Три дня фестиваля.</h2>
        <p>Сайт строится вокруг одного события: 3 дневных сценария, зоны фестиваля, участники, медиа и билетный блок.</p>
      </div>
    </section>
  );
});

function SectionFallback() {
  return <div className="section" aria-live="polite" />;
}

function SectionError() {
  return (
    <section className="section section-error" role="alert">
      <p className="eyebrow">Раздел временно недоступен</p>
      <h2>Мы уже перезагружаем программу фестиваля.</h2>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <ResponsiveImage src={festival.assets.logo} sizes="180px" alt={festival.name} loading="lazy" decoding="async" />
      <p>Банный фестиваль Пару Пар. +7 (911) 005-01-02</p>
      <a href="#top">Наверх</a>
    </footer>
  );
}
