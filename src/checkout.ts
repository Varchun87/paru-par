import { applyTextTypography } from './lib/typography';

export type TicketSkuId = 'one-day-pass' | 'two-day-pass' | 'festival-pass';

export type TicketSku = {
  id: TicketSkuId;
  label: string;
  date: string;
  price: string;
  priceAmount: number;
  childPrice: string;
  childPriceAmount: number;
  description: string;
};

export const ticketCatalog: readonly TicketSku[] = applyTextTypography([
  {
    id: 'one-day-pass',
    label: '1 день',
    date: 'любой 1 день',
    price: '1 800 ₽',
    priceAmount: 1800,
    childPrice: '900 ₽',
    childPriceAmount: 900,
    description: 'Билет на один любой день фестиваля: 7, 8 или 9 августа.',
  },
  {
    id: 'two-day-pass',
    label: '2 дня',
    date: 'любые 2 дня',
    price: '2 700 ₽',
    priceAmount: 2700,
    childPrice: '1 350 ₽',
    childPriceAmount: 1350,
    description: 'Билет на любые два дня фестиваля на выбор гостя.',
  },
  {
    id: 'festival-pass',
    label: '3 дня',
    date: '7-9 августа',
    price: '3 500 ₽',
    priceAmount: 3500,
    childPrice: '1 750 ₽',
    childPriceAmount: 1750,
    description: 'Полный трехдневный абонемент на фестиваль.',
  },
] as const);

export const campingOffer = applyTextTypography({
  title: 'Место под палатку',
  price: '1 000 ₽ / сутки',
  priceAmount: 1000,
  secondPrice: '1 300 ₽ / 2 суток',
  secondPriceAmount: 1300,
} as const);

export const checkoutEmail = 'hello@paru-par.ru';
