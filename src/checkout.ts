export type TicketSkuId = 'day-1' | 'day-2' | 'day-3' | 'festival-pass';

export type TicketSku = {
  id: TicketSkuId;
  label: string;
  date: string;
  price: string;
  description: string;
};

const CHECKOUT_EMAIL = 'hello@paru-par.ru';

export const ticketCatalog: readonly TicketSku[] = [
  {
    id: 'day-1',
    label: 'День 1',
    date: '7 августа',
    price: 'от 1 700 ₽',
    description: 'Открытие, знакомство с мастерами и вечерний костер.',
  },
  {
    id: 'day-2',
    label: 'День 2',
    date: '8 августа',
    price: 'от 1 900 ₽',
    description: 'Главный день пара, лекторий и музыкальная программа.',
  },
  {
    id: 'day-3',
    label: 'День 3',
    date: '9 августа',
    price: 'от 1 700 ₽',
    description: 'Семейный день, маркет, тихие практики и закрытие.',
  },
  {
    id: 'festival-pass',
    label: '3-day pass',
    date: '7-9 августа',
    price: 'от 3 900 ₽',
    description: 'Полный трехдневный абонемент на фестиваль.',
  },
] as const;

export const checkoutProvider = {
  getCheckoutHref(skuId: TicketSkuId) {
    const sku = ticketCatalog.find((item) => item.id === skuId);
    if (!sku) return '#tickets';

    const params = new URLSearchParams({
      subject: `Билет Пару Пар: ${sku.label}`,
      body: `Здравствуйте! Хочу оформить билет: ${sku.label}, ${sku.date}, ${sku.price}.`,
    });

    return `mailto:${CHECKOUT_EMAIL}?${params.toString()}`;
  },
};
