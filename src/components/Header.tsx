import { memo } from 'react';
import { checkoutProvider, ticketCatalog } from '../checkout';
import { festival } from '../content';

export const Header = memo(function Header() {
  return (
    <header className="site-header" aria-label="Главная навигация">
      <div className="ticket-menu">
        <a className="nav-ticket" href={festival.ticketUrl}>Билеты</a>
        <div className="ticket-dropdown" aria-label="Билеты по дням">
          {ticketCatalog.map((item) => (
            <a href={checkoutProvider.getCheckoutHref(item.id)} key={item.id}>
              <span>{item.label}</span>
              <strong>{item.price}</strong>
              <small>{item.date}</small>
            </a>
          ))}
        </div>
      </div>
    </header>
  );
});
