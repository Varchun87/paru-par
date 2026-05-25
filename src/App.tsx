import { lazy, memo, Suspense, useEffect, useState } from 'react';
import { campingOffer, checkoutProvider, ticketCatalog } from './checkout';
import { festival } from './content';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingVideo } from './components/FloatingVideo';
import { Header } from './components/Header';
import { LazyBackground } from './components/LazyBackground';
import { ResponsiveImage } from './components/ResponsiveImage';

const DeferredSections = lazy(() => import('./components/DeferredSections'));

const TICKER_ITEMS = [
  'КОЛЛЕКТИВНЫЕ ПАРЕНИЯ',
  'ЯРМАРКА',
  'МАСТЕР-КЛАССЫ',
  'ТЕЛЕСНЫЕ ПРАКТИКИ',
  'АРОМА ПАРЕНИЯ',
  'ЛУЧШИЕ ПАРМАСТЕРА',
  'ПЕСНИ У КОСТРА',
  'ПРИРОДА',
  'КОЛЛЕКТИВНЫЕ ПАРЕНИЯ',
  'ЯРМАРКА',
  'МАСТЕР-КЛАССЫ',
  'ТЕЛЕСНЫЕ ПРАКТИКИ',
  'АРОМА ПАРЕНИЯ',
  'ЛУЧШИЕ ПАРМАСТЕРА',
  'ПЕСНИ У КОСТРА',
  'ПРИРОДА',
];

export function App() {
  const isTicketsPage = normalizePath(window.location.pathname) === '/tickets';

  if (isTicketsPage) return <TicketsPage />;

  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Ticker />
        <ErrorBoundary fallback={<SectionError />}>
          <Suspense fallback={<SectionFallback />}>
            <DeferredSections />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <FloatingVideo />
      <ScrollTopButton />
    </>
  );
}

function normalizePath(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

function TicketsPage() {
  return (
    <main className="tickets-page" id="top">
      <section className="tickets-hero section-full">
        <LazyBackground as="div" className="tickets-hero-bg" image={festival.assets.hero} eager />
        <a className="tickets-page-logo" href="/" aria-label="На главную">
          <ResponsiveImage src={festival.assets.logo} sizes="260px" alt={festival.name} fetchPriority="high" decoding="async" />
        </a>
        <a className="tickets-back" href="/">На главную</a>
        <div className="tickets-hero-copy">
          <p className="eyebrow">7-9 августа 2026</p>
          <h1>Билеты на Пару Пар</h1>
          <p>Выбери формат участия: один день, два дня, полный фестиваль или место под палатку. Дети до 7 лет проходят бесплатно.</p>
        </div>
      </section>

      <section className="section ticket-shop" aria-label="Выбор билетов">
        <div className="ticket-shop-head">
          <p className="eyebrow">Билеты</p>
          <h2>Выбери свой формат фестиваля</h2>
          <p>Все билеты действуют на площадке «Мир Озер»: парения, зоны фестиваля, ярмарка, мастер-классы, музыка у костра и отдых на природе.</p>
        </div>
        <div className="ticket-shop-grid">
          {ticketCatalog.map((ticket) => (
            <article className="ticket-shop-card" key={ticket.id}>
              <div>
                <span>{ticket.label}</span>
                <h3>{ticket.date}</h3>
                <p>{ticket.description}</p>
              </div>
              <dl>
                <div><dt>Взрослый</dt><dd>{ticket.price}</dd></div>
                <div><dt>Дети 7-14 лет</dt><dd>{ticket.childPrice}</dd></div>
                <div><dt>Дети до 7 лет</dt><dd>бесплатно</dd></div>
              </dl>
              <ul>
                <li>Вход на территорию фестиваля</li>
                <li>Доступ к общим зонам и программе дня</li>
                <li>Ярмарка, лекторий, мастер-классы и музыка</li>
              </ul>
              <a className="button primary" href={checkoutProvider.getCheckoutHref(ticket.id)}>Оформить</a>
            </article>
          ))}
          <article className="ticket-shop-card ticket-shop-card-camping">
            <div>
              <span>Палатка</span>
              <h3>{campingOffer.title}</h3>
              <p>Для гостей, которые хотят остаться на природе и провести на фестивале больше времени.</p>
            </div>
            <dl>
              <div><dt>Сутки</dt><dd>{campingOffer.price}</dd></div>
              <div><dt>2 суток</dt><dd>{campingOffer.secondPrice}</dd></div>
            </dl>
            <ul>
              <li>Место под свою палатку</li>
              <li>Размещение на территории фестиваля</li>
              <li>Билет на фестиваль покупается отдельно</li>
            </ul>
            <a className="button primary" href={checkoutProvider.getCampingHref()}>Оформить</a>
          </article>
        </div>
      </section>
      <Footer />
    </main>
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
      <div className="hero-lead" aria-label="Описание фестиваля">
        <span>7-9 августа 2026</span>
        <a className="hero-address" href={festival.mapUrl} target="_blank" rel="noreferrer">
          Ленинградская область,<br />р-н Мяглово «Мир Озер»
        </a>
        <strong>Большой банный фестиваль</strong>
        <p>
          Самое долгожданное событие<br />
          для всех, кто любит баню,<br />
          природу, песни у костра, новые<br />
          знакомства и атмосферу<br />
          большого тёплого праздника.
        </p>
      </div>
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

function ScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > 520);

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  return (
    <a className={`scroll-top ${isVisible ? 'is-visible' : ''}`} href="#top" aria-label="Наверх">
      <span>Наверх</span>
      <b>↑</b>
    </a>
  );
}
