import { memo, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { campingOffer, ticketCatalog } from '../checkout';
import { contacts, faqs, festival, festivalDays, lineup, lineupTabs, program, type LineupPerson, type Zone, zones } from '../content';
import { useCountdown, useLineupFilter } from '../hooks';
import { backgroundImage, LazyBackground } from './LazyBackground';
import { ResponsiveImage } from './ResponsiveImage';

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

function IntroSection() {
  return (
    <SectionShell className="intro-grid">
      <div className="intro-poster">
        <span>📍 Локация</span>
        <strong>Ленинградская<br />область, р-н Мяглово<br />«Мир Озер»</strong>
        <div className="intro-map-links" aria-label="Открыть адрес фестиваля на карте">
          <a href={festival.mapUrl} target="_blank" rel="noreferrer">Яндекс.Карты</a>
          <a href={festival.map2gisUrl} target="_blank" rel="noreferrer">2GIS</a>
        </div>
      </div>
      <div>
        <h2 className="intro-nature-title">
          <span>Купайтесь, рыбачьте,</span>
          <span>гуляйте и наслаждайтесь</span>
          <span>природой: на территории</span>
          <span>есть два больших озера</span>
          <span>и атмосферная экотропа</span>
          <span>«Звуки леса»</span>
        </h2>
      </div>
    </SectionShell>
  );
}

export default DeferredSections;

const SectionShell = memo(function SectionShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      className={`section ${className}`}
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -18% 0px' }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
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
        <a className="eyebrow report-link" href="https://vk.com/event227257672" target="_blank" rel="noreferrer">Фото с прошлого фестиваля</a>
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
        <p className="eyebrow">Карта фестиваля</p>
        <h2>Интерактивные зоны</h2>
      </div>
      <div className="zone-grid">
        {zones.map((zone) => (
          <button className="zone-card" type="button" style={{ backgroundImage: backgroundImage(zone.image) }} onClick={() => setSelectedZone(zone)} key={zone.name}>
            <h3>{zone.name}</h3>
          </button>
        ))}
      </div>
      {selectedZone ? <ZoneModal zone={selectedZone} onClose={() => setSelectedZone(null)} /> : null}
    </SectionShell>
  );
}

function ZoneModal({ zone, onClose }: { zone: Zone; onClose: () => void }) {
  return (
    <div className="zone-modal-backdrop" role="presentation" onClick={onClose}>
      <article className="zone-modal" role="dialog" aria-modal="true" aria-label={zone.name} onClick={(event) => event.stopPropagation()}>
        <button className="zone-modal-close" type="button" aria-label="Закрыть описание зоны" onClick={onClose}>×</button>
        <div className="zone-modal-image" style={{ backgroundImage: backgroundImage(zone.image) }} />
        <div className="zone-modal-content">
          <p>{zone.text}</p>
        </div>
      </article>
    </div>
  );
}

function ProgramSection() {
  return (
    <SectionShell className="split">
      <LazyBackground as="div" className="split-media" image={festival.assets.wide} />
      <div className="split-content">
        <p className="eyebrow">Программа</p>
        <h2>Каждый день собран как отдельный маршрут гостя.</h2>
        <p className="program-route-copy">Выбери свой маршрут<br />на каждый день</p>
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

  useEffect(() => {
    if (!selectedPerson) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPerson(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedPerson]);

  return (
    <SectionShell className="lineup" >
      <div className="section-head">
        <h2>Хэдлайнеры</h2>
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
            <LazyBackground as="div" className="lineup-photo" image={person.image} />
            <h3>{person.name}</h3>
            <p>{person.category} / {person.role}</p>
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

function LineupModal({ person, onClose }: { person: LineupPerson; onClose: () => void }) {
  return (
    <div className="lineup-modal-backdrop" role="presentation" onClick={onClose}>
      <button className="lineup-modal-close" type="button" aria-label="Закрыть карточку участника" onClick={onClose}>×</button>
      <article className="lineup-modal" role="dialog" aria-modal="true" aria-labelledby="lineup-modal-title" onClick={(event) => event.stopPropagation()}>
        <ResponsiveImage className="lineup-modal-image" src={person.image} sizes="(max-width: 720px) 92vw, 520px" alt={person.name} loading="lazy" decoding="async" />
        <div className="lineup-modal-content">
          <h3 id="lineup-modal-title">{person.name}</h3>
          <strong>{person.role}</strong>
          <hr />
          <b>7-9 августа</b>
          <p><span>Программа:</span><br />{person.program}</p>
          <p>{person.description}</p>
          <a className="button primary" href={festival.ticketUrl} onClick={onClose}>Билеты</a>
        </div>
      </article>
    </div>
  );
}

function TicketsSection() {
  return (
    <SectionShell className="tickets" >
      <div>
        <p className="eyebrow">Билеты</p>
        <h2>Выбери билет на один день, любые два дня или полный фестиваль.</h2>
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
          <p>Отдельное место для палатки на территории фестиваля.</p>
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
        <p className="eyebrow">Больше, чем баня</p>
        <h2>Вопросы гостей</h2>
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
      <a className="contact-cta" href={contacts.telegram} target="_blank" rel="noreferrer">По вопросам рекламы и участия жми сюда</a>
    </SectionShell>
  );
}
