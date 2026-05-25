export type TicketSkuId = 'one-day-pass' | 'two-day-pass' | 'festival-pass';

export type TicketSku = {
  id: TicketSkuId;
  label: string;
  date: string;
  price: string;
  childPrice: string;
  description: string;
};

const CHECKOUT_EMAIL = 'hello@paru-par.ru';

export const ticketCatalog: readonly TicketSku[] = [
  {
    id: 'one-day-pass',
    label: '1 день',
    date: 'любой 1 день',
    price: '1 800 ₽',
    childPrice: '900 ₽',
    description: 'Билет на один любой день фестиваля: 7, 8 или 9 августа.',
  },
  {
    id: 'two-day-pass',
    label: '2 дня',
    date: 'любые 2 дня',
    price: '2 700 ₽',
    childPrice: '1 350 ₽',
    description: 'Билет на любые два дня фестиваля на выбор гостя.',
  },
  {
    id: 'festival-pass',
    label: '3 дня',
    date: '7-9 августа',
    price: '3 500 ₽',
    childPrice: '1 750 ₽',
    description: 'Полный трехдневный абонемент на фестиваль.',
  },
] as const;

export const campingOffer = {
  title: 'Место под палатку',
  price: '1 000 ₽ / сутки',
  secondPrice: '1 300 ₽ / 2 суток',
} as const;

export const checkoutProvider = {
  getCheckoutHref(skuId: TicketSkuId) {
    const sku = ticketCatalog.find((item) => item.id === skuId);
    if (!sku) return '#tickets';

    const params = new URLSearchParams({
      subject: `Билет Пару Пар: ${sku.label}`,
      body: `Здравствуйте! Хочу оформить билет: ${sku.label}, ${sku.date}, взрослый ${sku.price}, детский 7-14 лет ${sku.childPrice}.`,
    });

    return `mailto:${CHECKOUT_EMAIL}?${params.toString()}`;
  },
  getCampingHref() {
    const params = new URLSearchParams({
      subject: 'Пару Пар: место под палатку',
      body: `Здравствуйте! Хочу оформить ${campingOffer.title}: ${campingOffer.price} или ${campingOffer.secondPrice}.`,
    });

    return `mailto:${CHECKOUT_EMAIL}?${params.toString()}`;
  },
};
