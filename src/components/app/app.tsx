import { AppHeader } from '@components';
import { Preloader } from '@ui';
import { useEffect } from 'react';

import { selectCatalog } from '@services/selectors';
import { loadCatalog } from '@services/slices/catalog';
import { restoreSession } from '@services/slices/session';
import { useDispatch, useSelector } from '@services/store';

import { AppRoutes } from './app-routes';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(selectCatalog);

  useEffect(() => {
    void dispatch(loadCatalog());
    void dispatch(restoreSession());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      {(status === 'idle' || status === 'loading') && <Preloader />}
      {status === 'failed' && (
        <div className={styles.message} role="alert">
          <p className="text text_type_main-default">
            Не удалось загрузить ингредиенты: {error}
          </p>
          <button
            type="button"
            onClick={() => {
              void dispatch(loadCatalog());
            }}
          >
            Повторить
          </button>
        </div>
      )}
      {status === 'ready' &&
        (items.length ? (
          <AppRoutes />
        ) : (
          <p className={styles.message}>Нет ингредиентов</p>
        ))}
    </div>
  );
};

export default App;
