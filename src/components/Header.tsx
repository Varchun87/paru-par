import { memo } from 'react';
import { festival } from '../content';

export const Header = memo(function Header() {
  return (
    <header className="site-header" aria-label="Главная навигация">
      <div className="ticket-menu">
        <a className="nav-ticket" href={festival.ticketUrl}>Билеты</a>
      </div>
    </header>
  );
});
