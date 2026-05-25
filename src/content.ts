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
  program?: string;
  description?: string;
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
  place: '📍Ленинградская область, р-н Мяглово «Мир Озер»',
  mapUrl: 'https://yandex.ru/maps/?text=%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C%2C%20%D1%80-%D0%BD%20%D0%9C%D1%8F%D0%B3%D0%BB%D0%BE%D0%B2%D0%BE%20%D0%9C%D0%B8%D1%80%20%D0%9E%D0%B7%D0%B5%D1%80',
  map2gisUrl: 'https://2gis.ru/search/%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C%20%D1%80-%D0%BD%20%D0%9C%D1%8F%D0%B3%D0%BB%D0%BE%D0%B2%D0%BE%20%D0%9C%D0%B8%D1%80%20%D0%9E%D0%B7%D0%B5%D1%80',
  city: 'один город / три дня',
  tagline: 'Три дня жара, музыки, леса и банных ритуалов',
  description:
    'Большой банный фестиваль в одной локации: пар-мастера, сцены, купели, маркет, лекции, чайные круги и вечерняя программа у огня.',
  ticketUrl: '/tickets',
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
  { name: 'Главная сцена', text: 'Открытие, музыка, ведущий, концертная программа, розыгрыши.', image: '/media/photo/photo_2026-05-25_17-52-07.jpg' },
  { name: 'Пляж', text: 'Песчаный берег, чистый карьер, шезлонги, сапы, купание и пляжные виды спорта - всё, чтобы выдохнуть, позагорать и почувствовать настоящий летний вайб.', image: '/media/photo/photo_2026-05-25_20-58-20.jpg' },
  { name: 'Город пара', text: 'Это сердце фестиваля: коллективные и индивидуальные парения, авторские программы, выездные бани, банные палатки и настоящая атмосфера тепла. Лучшие пармастера, уникальные техники, ароматные веники - душевное пространство для перезагрузки.', image: '/media/photo/photo_2026-05-25_20-12-52.jpg' },
  { name: 'Чаны и купели', text: 'Идеальное продолжение банного ритуала. Горячие чаны под открытым небом, освежающие купели с холодной водой, лесной воздух и ощущение полной перезагрузки после парения.', image: '/media/photo/photo_2026-05-06_13-54-32.jpg' },
  { name: 'Фудкорт', text: 'Вкусная точка притяжения фестиваля. Горячие блюда, мясо и овощи на мангале, выпечка, снеки, полезные перекусы, напитки горячие и холодные. Пиво, сидр, квас.', image: '/media/photo/photo_2026-05-25_21-06-31.jpg' },
  { name: 'Ярмарка', text: 'Уютное пространство фестиваля, где можно найти красивые вещи, банные аксессуары, натуральную косметику, травяные сборы, веники, изделия ручной работы и приятные подарки для себя и близких. Прогуливайтесь между лавками, знакомьтесь с мастерами, выбирайте необычные находки и забирайте с собой частичку атмосферы Пару Пар.', image: '/media/photo/photo_2026-05-25_21-50-18.jpg' },
  { name: 'Лекции и мастер-классы', text: 'Пространство знаний, творчества и живого общения. Здесь можно познакомиться с банными традициями, узнать больше о здоровье, теле и восстановлении, попробовать ремесленные практики, создать что-то своими руками и забрать с фестиваля не только впечатления, но и новый опыт.', image: '/media/photo/photo_2026-05-25_21-52-23.jpg' },
  { name: 'Детская зона', text: 'Пространство для маленьких гостей фестиваля, где можно играть, творить, знакомиться и весело проводить время на природе. Ребят ждет детская площадка, аниматоры, мастер-классы, спокойные и подвижные игры.', image: '/media/photo/photo_2026-05-25_22-22-01.jpg' },
  { name: 'Водные активности', text: 'Можно окунуться в чистую воду, прокатиться на сапе, посидеть с удочкой у берега.', image: '/media/photo/photo_2026-05-25_22-23-21.jpg' },
  { name: 'Поляна песен', text: 'Место живой музыки, песен у костра и душевных встреч. Приходите слушать, подпевать, знакомиться и проживать самые тёплые вечера фестиваля.', image: '/media/photo/photo_2026-05-26_01-22-30.jpg' },
  { name: 'Выставка бань и комплексов', text: 'Место, где можно увидеть современные банные решения вживую: от печей и оборудования до готовых бань и парных. Знакомьтесь с производителями, сравнивайте форматы и находите вдохновение для собственной бани.', image: '/media/photo/photo_2026-05-25_22-39-49.jpg' },
  { name: 'Телесные практики', text: 'Пространство мягкого восстановления, внимания к себе и глубокой перезагрузки. Вас ждут дыхательные практики, ладки, массажи, расслабление, работа с телом и бережные форматы, которые помогают снять напряжение.', image: '/media/photo/photo_2026-05-26_00-59-35.jpg' },
];

const fallbackProgram = [
  'Церемония открытия и общий прогрев',
  'Парения от мастеров разных школ',
  'Лекторий про травы, веники и безопасность',
  'Маркет ремесел, текстиля и банной косметики',
  'Музыкальная сцена у костра',
  'Ночная купель, чайные круги и тихие практики',
];

const fallbackLineupTabs = ['ПАР-МАСТЕРА', 'ПРАКТИКИ', 'АРТИСТЫ', 'СПИКЕРЫ'] as const;

const fallbackLineup: LineupPerson[] = [
  {
    name: 'Иван Кузьменко',
    category: 'ПАР-МАСТЕРА',
    role: 'пармастер',
    image: '/media/photo/ivan.png',
    program: 'Авторское смысловое парение в Русской бане.',
    description: 'Основатель проекта авторского смыслового парения в Русской бане «ПаруПар», организатор ежегодного фестиваля «ПаруПар».',
  },
  {
    name: 'Елена Румянцева (мам Лена)',
    category: 'ПАР-МАСТЕРА',
    role: 'пармастер',
    image: '/media/photo/photo_2026-05-26_00-15-22.jpg',
    program: 'Телесноориентированные программы в области банного мастерства.',
    description: 'Ладодея, парМастер, потомственная ведунья. Мастер и сертифицированный специалист в области парения. Практикующий специалист по обучению различным энергетическим практикам. Автор и ведущей телесноориентированных программ в области банного мастерства.',
  },
  {
    name: 'Роман Олейник',
    category: 'ПАР-МАСТЕРА',
    role: 'пармастер',
    image: '/media/photo/photo_2026-05-26_00-59-12.jpg',
    program: 'Проект «Шоу Баня Мистера Лейкина».',
    description: 'Один из самых ярких пармастеров, который погружает гостей в удивительные сюжеты и держит внимание до самого финала.',
  },
  {
    name: 'Елена Ладная',
    category: 'ПРАКТИКИ',
    role: 'гвоздестояние',
    image: '/media/photo/photo_2026-05-26_00-59-15.jpg',
    program: 'Мастер-класс: «Уникальная практика Гвоздестояния».',
    description: 'Готовы проверить свои границы? Всего один шаг может изменить вашу жизнь навсегда. Гвоздестояние - это не просто испытание, это путь к осознанию собственной силы и возможностей.',
  },
  {
    name: 'Музыкант 1',
    category: 'АРТИСТЫ',
    role: 'вечерняя сцена',
    image: '/media/photo/photo_2026-05-06_13-54-28.jpg',
    program: 'Вечерний сет у костра и живая музыка после банной программы.',
    description: 'Создает атмосферу теплого фестивального вечера: голос, акустика и песни для общего круга.',
  },
  {
    name: 'Музыкант 2',
    category: 'АРТИСТЫ',
    role: 'акустика у костра',
    image: '/media/photo/photo_2026-05-06_13-54-26.jpg',
    program: 'Акустическая программа на закате и камерные песни у огня.',
    description: 'Музыка для отдыха после парений, чайных кругов и встреч на природе.',
  },
  {
    name: 'DJ Виталий Маслов',
    category: 'АРТИСТЫ',
    role: 'Ecstatic Dance',
    image: '/media/photo/photo_2026-05-26_00-59-25.jpg',
    program: 'Практика свободного танца Ecstatic Dance.',
    description: 'Ecstatic Dance - это свобода движения на чистом сознании под разную музыку: глубокий эмбиент, этно-хаус, электронные огненные ритмы. В сет будут вплетены живые инструменты - ханг, джембе, шаманский бубен и природные звуки вокруг. Мы создадим безопасное пространство без правил, оценок и стимуляторов, где не обязательно танцевать красиво. Главное быть настоящим.',
  },
  {
    name: 'Практик 1',
    category: 'СПИКЕРЫ',
    role: 'дыхание и движение',
    image: '/media/photo/123.jpg',
    program: 'Дыхательная практика, мягкое движение и подготовка тела к парению.',
    description: 'Помогает настроиться на фестивальный ритм и безопасно восстановиться после жара.',
  },
  {
    name: 'Дмитриева Елена',
    category: 'СПИКЕРЫ',
    role: 'психолог, коуч',
    image: '/media/photo/photo_2026-05-26_00-59-31.jpg',
    program: '«ГУАША: СЕКРЕТ СИЯНИЯ ДРЕВНИХ ИМПЕРАТРИЦ».',
    description: 'Психолог, мастер-коуч, executive-коуч, специалист по эриксоновскому гипнозу и генеративному коучингу, игропрактик, бизнес-тренер.',
  },
  {
    name: 'Практик 2',
    category: 'СПИКЕРЫ',
    role: 'мягкое восстановление',
    image: '/media/photo/photo_2024-05-13 22.40.36 (1).jpg',
    program: 'Практика расслабления, телесное внимание и восстановление после насыщенного дня.',
    description: 'Работает с мягкими форматами, которые подходят гостям без специальной подготовки.',
  },
  { name: 'Скоро', category: 'ПАР-МАСТЕРА', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'ПАР-МАСТЕРА', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'ПАР-МАСТЕРА', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'ПРАКТИКИ', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'ПРАКТИКИ', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'ПРАКТИКИ', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'АРТИСТЫ', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'АРТИСТЫ', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'АРТИСТЫ', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'СПИКЕРЫ', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'СПИКЕРЫ', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
  { name: 'Скоро', category: 'СПИКЕРЫ', role: 'новый участник', image: '/media/people/unknown.svg', hidden: true },
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
