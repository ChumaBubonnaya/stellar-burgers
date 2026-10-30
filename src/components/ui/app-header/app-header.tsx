import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link, NavLink, useLocation } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => {
  const { pathname } = useLocation();
  const constructorActive = pathname === '/' || pathname.startsWith('/ingredients/');
  return (
    <header className={styles.header}>
      <nav className={clsx(styles.menu, 'p-4')} aria-label="Основная навигация">
        <div className={styles.menu_part_left}>
          <NavLink
            to="/"
            className={clsx(styles.link, constructorActive && styles.link_active)}
            aria-current={constructorActive ? 'page' : undefined}
            end
          >
            <BurgerIcon type={constructorActive ? 'primary' : 'secondary'} />
            <span className="text text_type_main-default ml-2 mr-10">Конструктор</span>
          </NavLink>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              clsx(styles.link, isActive && styles.link_active)
            }
          >
            {({ isActive }) => (
              <>
                <ListIcon type={isActive ? 'primary' : 'secondary'} />
                <span className="text text_type_main-default ml-2">Лента заказов</span>
              </>
            )}
          </NavLink>
        </div>
        <Link to="/" className={styles.logo} aria-label="Stellar Burgers — главная">
          <Logo className="" />
        </Link>
        <div className={styles.link_position_last}>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              clsx(styles.link, isActive && styles.link_active)
            }
          >
            {({ isActive }) => (
              <>
                <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
                <span className="text text_type_main-default ml-2">
                  {userName ?? 'Личный кабинет'}
                </span>
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
