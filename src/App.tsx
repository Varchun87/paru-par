import { lazy, memo, Suspense, useEffect, useState } from 'react';
import { campingOffer, ticketCatalog, type TicketSkuId } from './checkout';
import { CheckoutDialog, type CheckoutSelection } from './components/CheckoutDialog';
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
  const currentPath = normalizePath(window.location.pathname);
  const legalPage = legalPages[currentPath];
  const isTicketsPage = currentPath === '/tickets';

  if (legalPage) {
    return (
      <>
        <LegalPage page={legalPage} />
        <CookieBanner />
      </>
    );
  }

  if (isTicketsPage) {
    return (
      <>
        <TicketsPage />
        <CookieBanner />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="curtain-page" id="top">
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
      <CookieBanner />
    </>
  );
}

function normalizePath(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

function TicketsPage() {
  const [checkoutSelection, setCheckoutSelection] = useState<CheckoutSelection | null>(null);

  return (
    <>
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
                <button className="button primary" type="button" onClick={() => setCheckoutSelection({ kind: 'ticket', ticketId: ticket.id as TicketSkuId })}>Оформить</button>
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
              <button className="button primary" type="button" onClick={() => setCheckoutSelection({ kind: 'camping' })}>Оформить</button>
            </article>
          </div>
        </section>
        <Footer />
      </main>
      {checkoutSelection ? <CheckoutDialog selection={checkoutSelection} onClose={() => setCheckoutSelection(null)} /> : null}
    </>
  );
}

type LegalPageContent = {
  title: string;
  lead: string;
  sections: { title: string; text: string[] }[];
};

const legalPages: Record<string, LegalPageContent> = {
  '/privacy': {
    title: 'Политика конфиденциальности',
    lead: 'Документ описывает, какие данные может получать сайт фестиваля «Пару Пар» и как они используются.',
    sections: [
      {
        title: 'Какие данные обрабатываются',
        text: [
          'При оформлении билета сайт может запросить имя, телефон, email, выбранный тип билета, количество билетов, место под палатку и комментарий пользователя.',
          'После подключения онлайн-оплаты платежная операция будет выполняться через CloudPayments. Данные банковской карты обрабатываются платежным сервисом и не сохраняются на сайте фестиваля.',
        ],
      },
      {
        title: 'Цели обработки',
        text: [
          'Ответ на обращение, оформление заявки или оплаты билета, передача оплаченной заявки в amoCRM, информирование о фестивале и организационные коммуникации.',
          'Данные не используются для автоматизированного принятия решений и не продаются третьим лицам.',
        ],
      },
      {
        title: 'Передача третьим лицам',
        text: [
          'Для оформления оплаты и учета заявок могут использоваться CloudPayments и amoCRM. После перехода на внешние сервисы или использования их виджетов применяются их собственные политики обработки данных.',
          'На сайте также размещены внешние ссылки на VK, Telegram, Яндекс.Карты и 2GIS. При переходе на эти сервисы применяются их собственные политики обработки данных.',
          'Передача данных возможна только в случаях, предусмотренных законом, или когда это необходимо для обработки обращения пользователя.',
        ],
      },
      {
        title: 'Контакты оператора',
        text: [
          'По вопросам обработки персональных данных можно написать на hello@paru-par.ru или связаться по телефону +7 (911) 005-01-02.',
          'Перед публикацией домена и запуском рекламы нужно заменить это описание на полные юридические реквизиты оператора персональных данных.',
        ],
      },
    ],
  },
  '/cookies': {
    title: 'Политика Cookie',
    lead: 'Сайт использует минимальное техническое хранение данных, чтобы запомнить выбор пользователя по cookie-баннеру.',
    sections: [
      {
        title: 'Что используется сейчас',
        text: [
          'Сайт не подключает Яндекс.Метрику, рекламные пиксели и другие аналитические cookies.',
          'После принятия баннера в браузере сохраняется техническая отметка согласия `parupar_cookie_consent`. Она нужна только для того, чтобы не показывать баннер повторно.',
        ],
      },
      {
        title: 'Сторонние сайты',
        text: [
          'При переходе по ссылкам на VK, Telegram, карты или почтовый клиент пользователь покидает сайт фестиваля. Эти сервисы могут использовать собственные cookies и технологии отслеживания.',
        ],
      },
      {
        title: 'Как отключить',
        text: [
          'Пользователь может очистить данные сайта в настройках браузера. После очистки cookie-баннер появится снова.',
        ],
      },
    ],
  },
  '/personal-data-consent': {
    title: 'Согласие на обработку персональных данных',
    lead: 'Заполняя форму оформления билета, отправляя письмо организатору или переходя к оплате, пользователь добровольно сообщает данные для связи и обработки заявки.',
    sections: [
      {
        title: 'Состав данных',
        text: [
          'Имя, контактный телефон или email, выбранный формат участия, текст обращения и иные данные, которые пользователь сам указывает в письме.',
        ],
      },
      {
        title: 'Цели обработки',
        text: [
          'Обработка заявки, обратная связь, уточнение деталей участия, информирование о билетах, программе и организационных вопросах фестиваля.',
        ],
      },
      {
        title: 'Срок и отзыв согласия',
        text: [
          'Согласие действует до достижения целей обработки или до его отзыва пользователем.',
          'Отозвать согласие можно письмом на hello@paru-par.ru.',
        ],
      },
    ],
  },
};

function LegalPage({ page }: { page: LegalPageContent }) {
  return (
    <main className="legal-page" id="top">
      <a className="tickets-page-logo" href="/" aria-label="На главную">
        <ResponsiveImage src={festival.assets.logo} sizes="260px" alt={festival.name} fetchPriority="high" decoding="async" />
      </a>
      <a className="tickets-back" href="/">На главную</a>
      <section className="section legal-content">
        <p className="eyebrow">Документы сайта</p>
        <h1>{page.title}</h1>
        <p className="legal-lead">{page.lead}</p>
        {page.sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            {section.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        ))}
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
      <nav className="footer-links" aria-label="Документы сайта">
        <a href="/privacy">Конфиденциальность</a>
        <a href="/cookies">Cookie</a>
        <a href="/personal-data-consent">Персональные данные</a>
        <a href="#top">Наверх</a>
      </nav>
    </footer>
  );
}

function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(window.localStorage.getItem('parupar_cookie_consent') !== 'accepted-v1');
  }, []);

  if (!isVisible) return null;

  const acceptCookies = () => {
    window.localStorage.setItem('parupar_cookie_consent', 'accepted-v1');
    setIsVisible(false);
  };

  return (
    <aside className="cookie-banner" role="region" aria-label="Уведомление о cookie">
      <p>
        Мы используем только техническое хранение выбора по cookie-баннеру. Аналитика и рекламные пиксели сейчас не подключены.
        Подробнее: <a href="/cookies">политика Cookie</a>.
      </p>
      <button type="button" onClick={acceptCookies}>Понятно</button>
    </aside>
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
