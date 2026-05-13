import { applyCmsWhitelist } from './cms';

export type FestivalDay = {
  day: string;
  date: string;
  title: string;
  place: string;
  status: string;
  events: string[];
};

export type Zone = {
  name: string;
  text: string;
  image: string;
};

export type LineupPerson = {
  name: string;
  category: string;
  role: string;
  image: string;
  hidden?: boolean;
};

export type GalleryItem = {
  title: string;
  image: string;
  type: 'Фото' | 'Видео';
};

const fallbackFestival = {
  name: 'Пару Пар',
  dates: '7-9 августа 2026',
  place: 'Загородный парк банных традиций / Московская область',
  city: 'один город / три дня',
  tagline: 'Три дня жара, музыки, леса и банных ритуалов',
  description:
    'Большой банный фестиваль в одной локации: пар-мастера, сцены, купели, маркет, лекции, чайные круги и вечерняя программа у огня.',
  ticketUrl: '#tickets',
  assets: {
    logo: '/media/logo/logo-parupar-red.png',
    hero: '/media/photo/photo_2026-05-06_13-54-29.jpg',
    wide: '/media/photo/DSC02541_resized (1).jpg',
    ritual: '/media/photo/DSC02512_resized (1).jpg',
    brooms: '/media/photo/photo_2026-05-06_13-54-35.jpg',
    doll: '/media/photo/photo_2024-05-13 22.40.36 (1).jpg',
    video: '/media/video/parupar-video-2026.mp4',
  },
} as const;

const fallbackEventStartIso = '2026-08-07T00:00:00+03:00';
const fallbackCountdownStartIso = '2026-01-01T00:00:00+03:00';

const fallbackFestivalDays: FestivalDay[] = [
  {
    day: 'День 1',
    date: '7 августа',
    title: 'Открытие и мягкий вход',
    place: 'Главная поляна / парные шатры',
    status: 'Билеты скоро',
    events: ['Церемония открытия', 'Знакомство с мастерами', 'Вечерний костер'],
  },
  {
    day: 'День 2',
    date: '8 августа',
    title: 'Большой день пара',
    place: 'Купели / сцена / лекторий',
    status: 'Главный день',
    events: ['Парные баттлы', 'Лекторий про травы', 'Музыкальная программа'],
  },
  {
    day: 'День 3',
    date: '9 августа',
    title: 'Семейный день и закрытие',
    place: 'Маркет / чайная зона / лес',
    status: 'Финал',
    events: ['Ремесленные классы', 'Тихие практики', 'Финальное парение'],
  },
];

const fallbackZones: Zone[] = [
  { name: 'Главная сцена', text: 'Музыка, ведущие, открытия, вечерняя программа и объявления.', image: '/media/photo/photo_2026-05-06_13-54-28.jpg' },
  { name: 'Город пара', text: 'Парные шатры, мастера, церемонии, авторские программы и запись на заходы.', image: '/media/photo/DSC02512_resized (1).jpg' },
  { name: 'Купели и вода', text: 'Контрастные практики, отдых после жара и безопасное сопровождение.', image: '/media/photo/photo_2026-05-06_13-54-32.jpg' },
  { name: 'Маркет и ремесла', text: 'Веники, травы, текстиль, банная косметика и сувениры фестиваля.', image: '/media/photo/photo_2024-05-13 22.40.36 (1).jpg' },
  { name: 'Лекторий', text: 'Разговоры про традиции, тело, травы, печи, безопасность и культуру парения.', image: '/media/photo/photo_2026-05-06_13-54-35.jpg' },
  { name: 'Чайный двор', text: 'Тихая зона, самовары, травяные сборы и встречи после парной.', image: '/media/photo/photo_2026-05-06_13-54-26.jpg' },
];

const fallbackProgram = [
  'Церемония открытия и общий прогрев',
  'Парения от мастеров разных школ',
  'Лекторий про травы, веники и безопасность',
  'Маркет ремесел, текстиля и банной косметики',
  'Музыкальная сцена у костра',
  'Ночная купель, чайные круги и тихие практики',
];

const fallbackLineupTabs = ['Пармастера', 'Музыканты', 'Телесные практики'] as const;

const fallbackLineup: LineupPerson[] = [
  { name: 'Алексей Север', category: 'Пармастера', role: 'славянский пар', image: '/media/photo/DSC02512_resized (1).jpg' },
  { name: 'Мария Травница', category: 'Пармастера', role: 'травы и мягкие ритуалы', image: '/media/photo/DSC02541_resized (1).jpg' },
  { name: 'Музыкант 1', category: 'Музыканты', role: 'вечерняя сцена', image: '/media/photo/photo_2026-05-06_13-54-28.jpg' },
  { name: 'Музыкант 2', category: 'Музыканты', role: 'акустика у костра', image: '/media/photo/photo_2026-05-06_13-54-26.jpg' },
  { name: 'Практик 1', category: 'Телесные практики', role: 'дыхание и движение', image: '/media/photo/123.jpg' },
  { name: 'Практик 2', category: 'Телесные практики', role: 'мягкое восстановление', image: '/media/photo/photo_2024-05-13 22.40.36 (1).jpg' },
  { name: 'Скоро', category: 'Пармастера', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'Музыканты', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
];

const fallbackGallery: GalleryItem[] = [
  { title: 'Парная', image: '/media/photo/DSC03020_resized (2).jpg', type: 'Фото' },
  { title: 'Веники', image: '/media/photo/photo_2026-05-06_13-54-35.jpg', type: 'Фото' },
  { title: 'Ритуал', image: '/media/video/ritual-preview.svg', type: 'Видео' },
  { title: 'Купель', image: '/media/photo/photo_2026-05-06_13-54-32.jpg', type: 'Фото' },
  { title: 'Лес', image: '/media/photo/photo_2026-05-06_13-54-26.jpg', type: 'Фото' },
  { title: 'Ночь', image: '/media/video/night-preview.svg', type: 'Видео' },
];

const fallbackFaqs: [string, string][] = [
  ['Что взять с собой?', 'Купальник или плавки, два полотенца, шлепанцы, теплую одежду для вечера и бутылку воды. Простыню, шапку и веники можно будет купить или взять на площадке.'],
  ['Как попасть на парение?', 'Часть парений входит в программу фестиваля, на авторские заходы пармастеров будет отдельная запись по слотам. Расписание появится ближе к дате.'],
  ['Будут ли купели и зона отдыха?', 'Да. На площадке будут купели, чайные зоны, места для восстановления после жара и сопровождающие, которые помогут с безопасным контрастом.'],
  ['Можно ли приходить на один день?', 'Да. Будут билеты на отдельные дни и общий абонемент на 7-9 августа. В меню билетов можно выбрать нужный день.'],
  ['Будет ли музыка и вечерняя программа?', 'Да. Каждый день запланированы музыканты, ведущие, костровая зона и вечерние активности после основной банной программы.'],
  ['Есть ли ограничения по здоровью?', 'Если есть проблемы с сердцем, давлением, беременность или противопоказания к жару, лучше заранее проконсультироваться с врачом и выбирать мягкие программы.'],
];

const fallbackContacts = {
  vk: 'https://vk.com/event227257672',
  telegram: 'https://t.me/parupar-fest1',
  phone: '+7 (911) 005-01-02',
  phoneHref: 'tel:+79110050102',
  whatsapp: 'https://wa.me/79110050102',
} as const;

const content = applyCmsWhitelist({
  festival: fallbackFestival,
  eventStartIso: fallbackEventStartIso,
  countdownStartIso: fallbackCountdownStartIso,
  festivalDays: fallbackFestivalDays,
  zones: fallbackZones,
  program: fallbackProgram,
  lineupTabs: fallbackLineupTabs,
  lineup: fallbackLineup,
  gallery: fallbackGallery,
  faqs: fallbackFaqs,
  contacts: fallbackContacts,
});

export const festival = content.festival;
export const eventStartIso = content.eventStartIso;
export const countdownStartIso = content.countdownStartIso;
export const festivalDays = content.festivalDays;
export const zones = content.zones;
export const program = content.program;
export const lineupTabs = content.lineupTabs;
export const lineup = content.lineup;
export const gallery = content.gallery;
export const faqs = content.faqs;
export const contacts = content.contacts;
