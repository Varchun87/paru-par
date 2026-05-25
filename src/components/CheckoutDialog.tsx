import { useMemo, useState } from 'react';
import { campingOffer, checkoutEmail, ticketCatalog, type TicketSkuId } from '../checkout';

type CheckoutKind = 'ticket' | 'camping';

export type CheckoutSelection = {
  kind: CheckoutKind;
  ticketId?: TicketSkuId;
};

type CheckoutDialogProps = {
  selection: CheckoutSelection;
  onClose: () => void;
};

type CloudPaymentsWidget = {
  pay: (
    type: 'charge' | 'auth',
    options: Record<string, unknown>,
    callbacks: { onSuccess?: () => void; onFail?: () => void; onComplete?: () => void },
  ) => void;
};

declare global {
  interface Window {
    cp?: { CloudPayments: new () => CloudPaymentsWidget };
  }
}

export function CheckoutDialog({ selection, onClose }: CheckoutDialogProps) {
  const selectedTicket = selection.ticketId ? ticketCatalog.find((ticket) => ticket.id === selection.ticketId) : undefined;
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [adultQuantity, setAdultQuantity] = useState(selection.kind === 'ticket' ? 1 : 0);
  const [childQuantity, setChildQuantity] = useState(0);
  const [campingId, setCampingId] = useState<'camping-night' | 'camping-two-nights'>('camping-night');
  const [campingQuantity, setCampingQuantity] = useState(selection.kind === 'camping' ? 1 : 0);
  const [comment, setComment] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amount = useMemo(() => {
    const ticketAmount = selectedTicket ? selectedTicket.priceAmount * adultQuantity + selectedTicket.childPriceAmount * childQuantity : 0;
    const campingPrice = campingId === 'camping-two-nights' ? campingOffer.secondPriceAmount : campingOffer.priceAmount;
    return ticketAmount + campingPrice * campingQuantity;
  }, [adultQuantity, campingId, campingQuantity, childQuantity, selectedTicket]);

  const emailFallbackHref = useMemo(() => {
    const params = new URLSearchParams({
      subject: 'Билет Пару Пар',
      body: [
        `Имя: ${customerName}`,
        `Телефон: ${customerPhone}`,
        `Email: ${customerEmail}`,
        selectedTicket ? `Билет: ${selectedTicket.label}, взрослые ${adultQuantity}, дети ${childQuantity}` : '',
        campingQuantity > 0 ? `Палатка: ${campingId === 'camping-two-nights' ? '2 суток' : 'сутки'}, количество ${campingQuantity}` : '',
        comment ? `Комментарий: ${comment}` : '',
      ].filter(Boolean).join('\n'),
    });

    return `mailto:${checkoutEmail}?${params.toString()}`;
  }, [adultQuantity, campingId, campingQuantity, childQuantity, comment, customerEmail, customerName, customerPhone, selectedTicket]);

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasConsent) {
      setStatus('Нужно согласие на обработку персональных данных.');
      return;
    }

    setIsSubmitting(true);
    setStatus('Создаем заказ...');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket?.id,
          adultQuantity,
          childQuantity,
          campingId: campingQuantity > 0 ? campingId : undefined,
          campingQuantity,
          comment,
          customer: { name: customerName, email: customerEmail, phone: customerPhone },
        }),
      });

      if (!response.ok) throw new Error(await response.text());
      const order = await response.json();

      if (!order.paymentEnabled || !order.publicId) {
        setStatus('Онлайн-оплата почти готова. Пока можно отправить заявку на email.');
        return;
      }

      await loadCloudPaymentsWidget();

      const widget = new window.cp!.CloudPayments();
      widget.pay('charge', {
        publicId: order.publicId,
        description: order.description,
        amount: order.amount,
        currency: order.currency,
        invoiceId: order.invoiceId,
        accountId: customerEmail,
        email: customerEmail,
        skin: 'mini',
        data: order.data,
      }, {
        onSuccess: () => setStatus('Оплата прошла. Мы отправим подтверждение и создадим заявку.'),
        onFail: () => setStatus('Оплата не прошла. Можно попробовать еще раз или отправить заявку на email.'),
      });
    } catch (error) {
      console.error(error);
      setStatus('Онлайн-оплата сейчас недоступна. Отправьте заявку на email, и мы поможем оформить билет.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-backdrop" role="presentation" onClick={onClose}>
      <section className="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={(event) => event.stopPropagation()}>
        <button className="checkout-close" type="button" aria-label="Закрыть оформление" onClick={onClose}>×</button>
        <p className="eyebrow">Оформление</p>
        <h2 id="checkout-title">Билет Пару Пар</h2>
        <form className="checkout-form" onSubmit={submitOrder}>
          <label>
            Имя
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required autoComplete="name" />
          </label>
          <label>
            Телефон
            <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} required autoComplete="tel" inputMode="tel" />
          </label>
          <label>
            Email
            <input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} required type="email" autoComplete="email" />
          </label>

          {selectedTicket ? (
            <div className="checkout-group">
              <strong>{selectedTicket.label}: {selectedTicket.date}</strong>
              <label>Взрослые<input type="number" min="0" max="20" value={adultQuantity} onChange={(event) => setAdultQuantity(Number(event.target.value))} /></label>
              <label>Дети 7-14<input type="number" min="0" max="20" value={childQuantity} onChange={(event) => setChildQuantity(Number(event.target.value))} /></label>
            </div>
          ) : null}

          <div className="checkout-group">
            <strong>Палатка</strong>
            <label>Формат
              <select value={campingId} onChange={(event) => setCampingId(event.target.value as 'camping-night' | 'camping-two-nights')}>
                <option value="camping-night">Сутки, {campingOffer.price}</option>
                <option value="camping-two-nights">2 суток, {campingOffer.secondPrice}</option>
              </select>
            </label>
            <label>Количество<input type="number" min="0" max="20" value={campingQuantity} onChange={(event) => setCampingQuantity(Number(event.target.value))} /></label>
          </div>

          <label>
            Комментарий
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} />
          </label>

          <label className="checkout-consent">
            <input type="checkbox" checked={hasConsent} onChange={(event) => setHasConsent(event.target.checked)} />
            <span>Согласен с <a href="/personal-data-consent" target="_blank">обработкой персональных данных</a> и <a href="/privacy" target="_blank">политикой конфиденциальности</a>.</span>
          </label>

          <div className="checkout-total">Итого: <strong>{amount.toLocaleString('ru-RU')} ₽</strong></div>
          {status ? <p className="checkout-status">{status} <a href={emailFallbackHref}>Отправить заявку</a></p> : null}
          <button className="button primary" type="submit" disabled={isSubmitting || amount <= 0}>{isSubmitting ? 'Готовим...' : 'Оплатить'}</button>
        </form>
      </section>
    </div>
  );
}

function loadCloudPaymentsWidget() {
  if (window.cp?.CloudPayments) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('CloudPayments widget failed to load'));
    document.head.appendChild(script);
  });
}
