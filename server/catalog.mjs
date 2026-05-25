export const ticketCatalog = [
  {
    id: 'one-day-pass',
    label: '1 день',
    date: 'любой 1 день',
    adultPrice: 1800,
    childPrice: 900,
  },
  {
    id: 'two-day-pass',
    label: '2 дня',
    date: 'любые 2 дня',
    adultPrice: 2700,
    childPrice: 1350,
  },
  {
    id: 'festival-pass',
    label: '3 дня',
    date: '7-9 августа',
    adultPrice: 3500,
    childPrice: 1750,
  },
];

export const campingCatalog = [
  { id: 'camping-night', label: 'Палатка: сутки', price: 1000 },
  { id: 'camping-two-nights', label: 'Палатка: 2 суток', price: 1300 },
];

export function calculateOrder(payload) {
  const ticket = ticketCatalog.find((item) => item.id === payload.ticketId);
  const camping = campingCatalog.find((item) => item.id === payload.campingId);
  const adultQuantity = clampQuantity(payload.adultQuantity, ticket ? 1 : 0);
  const childQuantity = clampQuantity(payload.childQuantity, 0);
  const campingQuantity = clampQuantity(payload.campingQuantity, 0);
  const lines = [];

  if (ticket) {
    if (adultQuantity > 0) {
      lines.push({ label: `${ticket.label}, взрослый`, quantity: adultQuantity, price: ticket.adultPrice });
    }
    if (childQuantity > 0) {
      lines.push({ label: `${ticket.label}, детский 7-14`, quantity: childQuantity, price: ticket.childPrice });
    }
  }

  if (camping && campingQuantity > 0) {
    lines.push({ label: camping.label, quantity: campingQuantity, price: camping.price });
  }

  const amount = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  if (amount <= 0) {
    throw new Error('Выберите хотя бы один билет или место под палатку.');
  }

  return {
    lines,
    amount,
    description: `Пару Пар: ${lines.map((line) => `${line.label} x${line.quantity}`).join(', ')}`,
  };
}

function clampQuantity(value, fallback) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, Math.min(parsed, 20));
}
