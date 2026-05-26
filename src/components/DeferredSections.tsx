import { memo, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { campingOffer, ticketCatalog } from '../checkout';
import { contacts, faqs, festival, festivalDays, lineup, lineupTabs, program, type LineupPerson, type Zone, zones } from '../content';
import { useCountdown, useLineupFilter } from '../hooks';
import { keepShortWords } from '../lib/typography';
import { backgroundImage, LazyBackground } from './LazyBackground';
import { ResponsiveImage } from './ResponsiveImage';

const t = keepShortWords;

const REPORT_IMAGES = [
  '/media/karusel/photo_2026-05-25_12-57-00.jpg',
  '/media/karusel/photo_2026-05-25_12-57-02.jpg',
  '/media/karusel/photo_2026-05-25_12-57-03.jpg',
  '/media/karusel/photo_2026-05-25_12-57-04.jpg',
  '/media/karusel/photo_2026-05-25_12-57-05.jpg',
  '/media/karusel/photo_2026-05-25_12-57-06.jpg',
  '/media/karusel/photo_2026-05-25_12-57-07.jpg',
  '/media/karusel/photo_2026-05-25_12-57-08.jpg',
  '/media/karusel/photo_2026-05-25_12-57-09.jpg',
  '/media/karusel/photo_2026-05-25_12-57-10.jpg',
  '/media/karusel/photo_2026-05-25_12-57-11.jpg',
];

const zoneCardEntrances = [
  { x: -260, y: -120, rotate: -12 },
  { x: 0, y: -220, rotate: 8 },
  { x: 260, y: -120, rotate: 12 },
  { x: 320, y: 20, rotate: -8 },
  { x: -320, y: 40, rotate: 10 },
  { x: -220, y: 180, rotate: -9 },
  { x: 220, y: 180, rotate: 9 },
  { x: 320, y: 120, rotate: -12 },
];

const zoneGridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.075, delayChildren: 0.08 } },
};

const zoneCardVariants = {
  hidden: (index: number) => ({
    opacity: 0,
    scale: 0.82,
    filter: 'blur(10px)',
    ...zoneCardEntrances[index % zoneCardEntrances.length],
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: 'easeOut' as const },
  },
};

function DeferredSections() {
  return (
    <>
      <CountdownSection />
      <IntroSection />
      <LineupSection />
      <ZonesSection />
      <DaysSection />
      <ProgramSection />
      <FaqSection />
      <ContactsSection />
    </>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);

    updateMatches();
    mediaQuery.addEventListener('change', updateMatches);
    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
}

function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    const { body } = document;
    const previousPosition = body.style.position;
    const previousTop = body.style.top;
    const previousWidth = body.style.width;
    const previousOverflow = body.style.overflow;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.width = previousWidth;
      body.style.overflow = previousOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}

function IntroSection() {
  return (
    <SectionShell className="intro-grid">
      <div className="intro-poster">
        <span>📍 Локация</span>
        <strong>Ленинградская<br />область, р-н Мяглово<br />«Мир Озер»</strong>
        <div className="intro-map-links" aria-label={t('Открыть адрес фестиваля на карте')}>
          <a href={festival.mapUrl} target="_blank" rel="noreferrer">Яндекс.Карты</a>
          <a href={festival.map2gisUrl} target="_blank" rel="noreferrer">2GIS</a>
        </div>
      </div>
      <div>
        <h2 className="intro-nature-title">
          <span>{t('Купайтесь, рыбачьте,')}</span>
          <span>{t('гуляйте и наслаждайтесь')}</span>
          <span>{t('природой: на территории')}</span>
          <span>{t('есть два больших озера')}</span>
          <span>{t('и атмосферная экотропа')}</span>
          <span>«Звуки леса»</span>
        </h2>
      </div>
    </SectionShell>
  );
}

export default DeferredSections;

const SectionShell = memo(function SectionShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`section ${className}`}
    >
      {children}
    </section>
  );
});

function CountdownSection() {
  const { daysLeft, progress } = useCountdown();
  const [reportIndex, setReportIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setReportIndex((index) => (index + 1) % REPORT_IMAGES.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, []);

  const visibleReportImages = REPORT_IMAGES.slice(0, 3).map((_, offset) => REPORT_IMAGES[(reportIndex + offset) % REPORT_IMAGES.length]);

  return (
    <SectionShell className="countdown-section">
      <article className="countdown-card">
        <div className="countdown-pattern" aria-hidden="true" />
        <p className="eyebrow">До легкого пара</p>
        <div className="countdown-circle" style={{ '--progress': `${progress}%` } as React.CSSProperties}>
          <strong>{daysLeft}</strong>
          <span>{daysLeft === 1 ? 'день' : 'дней'}</span>
        </div>
        <div className="countdown-labels">
          {festivalDays.map((day) => <b key={day.day}>{day.date}</b>)}
        </div>
      </article>

      <article className="report-card">
        <a className="eyebrow report-link" href="https://vk.com/event227257672" target="_blank" rel="noreferrer">{t('Фото с прошлого фестиваля')}</a>
        <div className="polaroids">
          {visibleReportImages.map((image, index) => <LazyBackground as="span" image={image} key={`${image}-${index}`} eager />)}
        </div>
      </article>
    </SectionShell>
  );
}

function DaysSection() {
  return (
    <SectionShell className="days" >
      <div className="section-head">
        <h2>Расписание</h2>
      </div>
      <div className="day-grid">
        {festivalDays.map((item) => (
          <a className="day-card" href="#tickets" key={item.day}>
            <span className="arrow">↗</span>
            <small>{item.day} / {item.date}</small>
            <h3>{item.title}</h3>
            <p>{item.place}</p>
            <ul>{item.events.map((event) => <li key={event}>{event}</li>)}</ul>
            <b>{item.status}</b>
          </a>
        ))}
      </div>
    </SectionShell>
  );
}

function ZonesSection() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const shouldAnimateCards = useMediaQuery('(min-width: 1025px)');

  useBodyScrollLock(Boolean(selectedZone));

  useEffect(() => {
    if (!selectedZone) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedZone(null);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedZone]);

  return (
    <SectionShell className="zones" >
      <div className="section-head">
        <p className="eyebrow">{t('Карта фестиваля')}</p>
        <h2>{t('Интерактивные зоны')}</h2>
      </div>
      <motion.div
        className="zone-grid"
        variants={shouldAnimateCards ? zoneGridVariants : undefined}
        initial={shouldAnimateCards ? 'hidden' : false}
        whileInView={shouldAnimateCards ? 'visible' : undefined}
        viewport={shouldAnimateCards ? { once: true, amount: 0.18, margin: '0px 0px -10% 0px' } : undefined}
      >
        {zones.map((zone, index) => (
          <motion.button
            className={`zone-card ${getZoneCardClassName(zone.name)}`}
            type="button"
            custom={index}
            variants={shouldAnimateCards ? zoneCardVariants : undefined}
            style={{ backgroundImage: backgroundImage(zone.image) }}
            onClick={() => setSelectedZone(zone)}
            key={zone.name}
          >
            <h3>{zone.name}</h3>
          </motion.button>
        ))}
      </motion.div>
      {selectedZone ? <ZoneModal zone={selectedZone} onClose={() => setSelectedZone(null)} /> : null}
    </SectionShell>
  );
}

function getZoneCardClassName(zoneName: string) {
  if (zoneName === 'Телесные практики') return 'zone-card--body-practices';
  if (zoneName === 'Поляна песен') return 'zone-card--songs';
  return '';
}

function ZoneModal({ zone, onClose }: { zone: Zone; onClose: () => void }) {
  return createPortal(
    <div className="zone-modal-backdrop" role="presentation" onClick={onClose}>
      <article className="zone-modal" role="dialog" aria-modal="true" aria-label={zone.name} onClick={(event) => event.stopPropagation()}>
        <button className="zone-modal-close" type="button" aria-label="Закрыть описание зоны" onClick={onClose}>×</button>
        <div className="zone-modal-image" style={{ backgroundImage: backgroundImage(zone.image) }} />
        <div className="zone-modal-content">
          <p>{zone.text}</p>
        </div>
      </article>
    </div>,
    document.body,
  );
}

function ProgramSection() {
  return (
    <SectionShell className="split">
      <LazyBackground as="div" className="split-media" image={festival.assets.wide} />
      <div className="split-content">
        <p className="eyebrow">Программа</p>
        <h2>{t('Уникальная программа каждый день. Собери свой идеальный маршрут.')}</h2>
        <div className="program-downloads" aria-label="Программы по дням">
          {festivalDays.map((day) => (
            <button type="button" disabled key={day.day}>
              <span>{day.date}</span>
              <small>PDF скоро</small>
            </button>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function LineupSection() {
  const { activeCategory, selectCategory } = useLineupFilter();
  const [selectedPerson, setSelectedPerson] = useState<LineupPerson | null>(null);
  const visibleLineup = useMemo(() => {
    const categoryLineup = lineup.filter((person) => person.category === activeCategory);
    const knownPeople = categoryLineup.filter((person) => !person.hidden);
    const placeholders = categoryLineup.filter((person) => person.hidden);

    return [...knownPeople, ...placeholders].slice(0, 5);
  }, [activeCategory]);

  useBodyScrollLock(Boolean(selectedPerson));

  useEffect(() => {
    if (!selectedPerson) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPerson(null);
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedPerson]);

  return (
    <SectionShell className="lineup" >
      <div className="section-head">
        <h2>Участники</h2>
      </div>
      <div className="lineup-tabs" aria-label="Категории участников">
        {lineupTabs.map((tab, index) => (
          <ReactFragment key={tab} separator={index > 0}>
            <button className={tab === activeCategory ? 'active' : ''} type="button" onClick={() => selectCategory(tab)}>{tab}</button>
          </ReactFragment>
        ))}
      </div>
      <div className="lineup-grid">
        {visibleLineup.map((person, index) => (
          <button className={`lineup-card ${person.hidden ? 'is-hidden' : ''}`} type="button" disabled={person.hidden} onClick={() => setSelectedPerson(person)} key={`${person.category}-${person.name}-${person.role}-${index}`}>
            <LazyBackground as="div" className={`lineup-photo ${getLineupPhotoClassName(person.name)}`} image={person.image} />
            <h3>{person.name}</h3>
          </button>
        ))}
      </div>
      {selectedPerson ? <LineupModal person={selectedPerson} onClose={() => setSelectedPerson(null)} /> : null}
    </SectionShell>
  );
}

function ReactFragment({ children, separator }: { children: React.ReactNode; separator: boolean }) {
  return <>{separator ? <i>/</i> : null}{children}</>;
}

function getLineupPhotoClassName(personName: string) {
  if ([
    'Иван Кузьменко',
    'Елена Румянцева (мам Лена)',
    'Роман Олейник',
    'Елена Ладная',
    'DJ Виталий Маслов',
    'Дмитриева Елена',
  ].includes(personName)) return 'lineup-photo--portrait';
  return '';
}

function LineupModal({ person, onClose }: { person: LineupPerson; onClose: () => void }) {
  return createPortal(
    <div className="lineup-modal-backdrop" role="presentation" onClick={onClose}>
      <button className="lineup-modal-close" type="button" aria-label="Закрыть карточку участника" onClick={onClose}>×</button>
      <article className="lineup-modal" role="dialog" aria-modal="true" aria-labelledby="lineup-modal-title" onClick={(event) => event.stopPropagation()}>
        <ResponsiveImage className="lineup-modal-image" src={person.image} sizes="(max-width: 720px) 92vw, 520px" alt={person.name} loading="lazy" decoding="async" />
        <div className="lineup-modal-content">
          <h3 id="lineup-modal-title">{person.name}</h3>
          <strong>{person.role}</strong>
          <hr />
          {person.program ? <p>{person.program}</p> : null}
          <p>{person.description}</p>
        </div>
      </article>
    </div>,
    document.body,
  );
}

function TicketsSection() {
  return (
    <SectionShell className="tickets" >
      <div>
        <p className="eyebrow">Билеты</p>
        <h2>{t('Выбери билет на один день, любые два дня или полный фестиваль.')}</h2>
      </div>
      <div className="ticket-list">
        {ticketCatalog.map((ticket) => (
          <article className="ticket-card" key={ticket.id}>
            <span>{ticket.label}</span>
            <strong>{ticket.price}</strong>
            <dl className="ticket-prices">
              <div><dt>Взрослый</dt><dd>{ticket.price}</dd></div>
              <div><dt>Дети 7-14</dt><dd>{ticket.childPrice}</dd></div>
              <div><dt>Дети до 7</dt><dd>бесплатно</dd></div>
            </dl>
            <p>{ticket.description}</p>
            <a className="button primary" href={festival.ticketUrl}>Оформить</a>
          </article>
        ))}
        <article className="ticket-card ticket-card-camping">
          <span>Палатка</span>
          <strong>{campingOffer.title}</strong>
          <dl className="ticket-prices">
            <div><dt>Сутки</dt><dd>{campingOffer.price}</dd></div>
            <div><dt>2 суток</dt><dd>{campingOffer.secondPrice}</dd></div>
          </dl>
          <p>{t('Отдельное место для палатки на территории фестиваля.')}</p>
          <a className="button primary" href={festival.ticketUrl}>Выбрать</a>
        </article>
      </div>
    </SectionShell>
  );
}

function FaqSection() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <SectionShell className="faq" >
      <div className="section-head">
        <p className="eyebrow">{t('Больше, чем баня')}</p>
        <h2>{t('Вопросы гостей')}</h2>
      </div>
      {faqs.map(([question, answer]) => (
        <details key={question} open={openQuestion === question}>
          <summary onClick={(event) => {
            event.preventDefault();
            setOpenQuestion(openQuestion === question ? null : question);
          }}>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </SectionShell>
  );
}

function ContactsSection() {
  return (
    <SectionShell className="contacts" >
      <div className="section-head">
        <p className="eyebrow">Связь</p>
        <h2>Контакты</h2>
      </div>
      <div className="contact-grid">
        <a href={contacts.vk} target="_blank" rel="noreferrer"><span>VK</span><strong>ВКонтакте</strong></a>
        <a href={contacts.telegram} target="_blank" rel="noreferrer"><span>TG</span><strong>Telegram</strong></a>
        <a href={contacts.phoneHref}><span>Телефон</span><strong>{contacts.phone}</strong></a>
        <a href={contacts.telegram} target="_blank" rel="noreferrer"><span>MAX</span><strong>Написать</strong></a>
      </div>
      <a className="contact-cta" href={contacts.telegram} target="_blank" rel="noreferrer">{t('По вопросам рекламы и участия жми сюда')}</a>
    </SectionShell>
  );
}
