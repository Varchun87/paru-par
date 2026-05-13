import { memo, useMemo } from 'react';
import { motion } from 'motion/react';
import { checkoutProvider, ticketCatalog } from '../checkout';
import { contacts, faqs, festival, festivalDays, gallery, lineup, lineupTabs, program, zones } from '../content';
import { useCountdown, useLineupFilter } from '../hooks';
import { LazyBackground } from './LazyBackground';

const REPORT_IMAGES = [
  '/media/photo/DSC02512_resized (1).jpg',
  '/media/photo/DSC03020_resized (2).jpg',
  '/media/photo/photo_2026-05-06_13-54-32.jpg',
];

function DeferredSections() {
  return (
    <>
      <CountdownSection />
      <DaysSection />
      <ZonesSection />
      <ProgramSection />
      <FeatureCards />
      <LineupSection />
      <MediaSection />
      <TicketsSection />
      <FaqSection />
      <ContactsSection />
    </>
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

  return (
    <SectionShell className="countdown-section">
      <article className="countdown-card">
        <div className="countdown-pattern" aria-hidden="true" />
        <p className="eyebrow">Осталось до Пару Пар</p>
        <div className="countdown-circle" style={{ '--progress': `${progress}%` } as React.CSSProperties}>
          <strong>{daysLeft}</strong>
          <span>{daysLeft === 1 ? 'день' : 'дней'}</span>
        </div>
        <div className="countdown-scale" aria-label="Шкала обратного отсчета">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="countdown-labels">
          {festivalDays.map((day) => <b key={day.day}>{day.date}</b>)}
        </div>
      </article>

      <article className="report-card">
        <p className="eyebrow">Фотоотчет</p>
        <div className="polaroids">
          {REPORT_IMAGES.map((image) => <LazyBackground as="span" image={image} key={image} />)}
        </div>
        <h3>Как будет выглядеть фестиваль</h3>
      </article>
    </SectionShell>
  );
}

function DaysSection() {
  return (
    <SectionShell className="days" >
      <div className="section-head">
        <p className="eyebrow">Расписание</p>
        <h2>3 дня в одной локации</h2>
        <a className="section-link" href="#tickets">Билеты ↗</a>
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
  return (
    <SectionShell className="zones" >
      <div className="section-head">
        <p className="eyebrow">Карта фестиваля</p>
        <h2>Зоны площадки</h2>
      </div>
      <div className="zone-grid">
        {zones.map((zone, index) => (
          <LazyBackground className={`zone-card ${index === 1 || index === 5 ? 'wide' : ''}`} image={zone.image} key={zone.name}>
            <span>0{index + 1}</span>
            <h3>{zone.name}</h3>
            <p>{zone.text}</p>
          </LazyBackground>
        ))}
      </div>
    </SectionShell>
  );
}

function ProgramSection() {
  return (
    <SectionShell className="split">
      <LazyBackground as="div" className="split-media" image={festival.assets.wide} />
      <div className="split-content">
        <p className="eyebrow">Программа</p>
        <h2>Каждый день собран как отдельный маршрут гостя.</h2>
        <ul className="program-list">{program.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </SectionShell>
  );
}

function FeatureCards() {
  const features = [
    { title: 'Парные ритуалы', kicker: '01', text: 'Индивидуальные и групповые заходы с разными школами пара.', image: festival.assets.ritual, className: 'tall' },
    { title: 'Травы и веники', kicker: '02', text: 'Зона заготовки, ароматы, лекции и мастер-классы.', image: festival.assets.brooms },
    { title: 'Северный маркет', kicker: '03', text: 'Ремесла, текстиль, банная косметика и сувениры.', image: festival.assets.doll },
  ];

  return (
    <SectionShell className="feature-row">
      {features.map((feature) => (
        <LazyBackground className={`image-card ${feature.className ?? ''}`} image={feature.image} key={feature.title}>
          <span>{feature.kicker}</span>
          <h3>{feature.title}</h3>
          <p>{feature.text}</p>
        </LazyBackground>
      ))}
    </SectionShell>
  );
}

function LineupSection() {
  const { activeCategory, selectCategory } = useLineupFilter();
  const visibleLineup = useMemo(() => lineup.filter((person) => person.category === activeCategory), [activeCategory]);

  return (
    <SectionShell className="lineup" >
      <div className="section-head">
        <p className="eyebrow">Выступают на Пару Пар</p>
        <h2>Участники</h2>
        <span className="lineup-sticker">line-up</span>
      </div>
      <div className="lineup-tabs" aria-label="Категории участников">
        {lineupTabs.map((tab, index) => (
          <ReactFragment key={tab} separator={index > 0}>
            <button className={tab === activeCategory ? 'active' : ''} type="button" onClick={() => selectCategory(tab)}>{tab}</button>
          </ReactFragment>
        ))}
      </div>
      <div className="lineup-grid">
        {visibleLineup.map((person) => (
          <article className={`lineup-card ${person.hidden ? 'is-hidden' : ''}`} key={`${person.category}-${person.name}-${person.role}`}>
            <LazyBackground as="div" className="lineup-photo" image={person.image} />
            <h3>{person.name}</h3>
            <p>{person.category} / {person.role}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function ReactFragment({ children, separator }: { children: React.ReactNode; separator: boolean }) {
  return <>{separator ? <i>/</i> : null}{children}</>;
}

function MediaSection() {
  return (
    <SectionShell className="media" >
      <div className="section-head">
        <p className="eyebrow">Фото и видео</p>
        <h2>Медиа-лента фестиваля</h2>
      </div>
      <div className="gallery-grid">
        {gallery.map((item, index) => (
          <LazyBackground className={`gallery-item ${index === 0 || index === 5 ? 'wide' : ''}`} image={item.image} key={item.title}>
            <span>{item.type}</span>
            <h3>{item.title}</h3>
          </LazyBackground>
        ))}
      </div>
    </SectionShell>
  );
}

function TicketsSection() {
  return (
    <SectionShell className="tickets" >
      <div>
        <p className="eyebrow">Билеты</p>
        <h2>Билет действует на один день или на весь трехдневный фестиваль.</h2>
      </div>
      <div className="ticket-list">
        {ticketCatalog.map((ticket) => (
          <article className="ticket-card" key={ticket.id}>
            <span>{ticket.label}</span>
            <strong>{ticket.price}</strong>
            <p>{ticket.description}</p>
            <a className="button primary" href={checkoutProvider.getCheckoutHref(ticket.id)}>Оформить</a>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function FaqSection() {
  return (
    <SectionShell className="faq" >
      <div className="section-head">
        <p className="eyebrow">Больше, чем баня</p>
        <h2>Вопросы гостей</h2>
      </div>
      {faqs.map(([question, answer]) => (
        <details key={question}>
          <summary>{question}</summary>
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
        <a href={contacts.whatsapp} target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>Написать</strong></a>
      </div>
    </SectionShell>
  );
}
