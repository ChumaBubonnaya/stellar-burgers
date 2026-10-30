import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { Preloader } from '@ui';
import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { ProtectedRoute } from '@components/protected-route/protected-route';
import { selectCatalog } from '@services/selectors';
import { loadCatalog } from '@services/slices/catalog';
import { restoreSession } from '@services/slices/session';
import { useDispatch, useSelector } from '@services/store';

import type { NavigationState } from '@components/protected-route/protected-route';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  useEffect(() => {
    void dispatch(loadCatalog());
    void dispatch(restoreSession());
  }, [dispatch]);
  return (
    <div className={styles.app}>
      <AppHeader />
      <AppRoutes />
    </div>
  );
};

const CatalogPage = ({
  children,
}: {
  children: React.JSX.Element;
}): React.JSX.Element => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(selectCatalog);
  if (loading && !items.length) return <Preloader />;
  if (error && !items.length)
    return (
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
    );
  if (!items.length) return <p className={styles.message}>Нет ингредиентов</p>;
  return children;
};

const DetailPage = ({
  children,
  title,
}: {
  children: React.JSX.Element;
  title?: string;
}): React.JSX.Element => (
  <main className={styles.detailPageWrap}>
    {title && (
      <h1 className={clsx(styles.detailHeader, 'text text_type_main-large mb-6')}>
        {title}
      </h1>
    )}
    {children}
  </main>
);

const AppRoutes = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEntryKey = useRef(location.key);
  const background =
    location.key === initialEntryKey.current
      ? undefined
      : (location.state as NavigationState | null)?.background;
  const closeModal = (): void => {
    void navigate(-1);
  };
  return (
    <>
      <Routes location={background ?? location}>
        <Route
          path="/"
          element={
            <CatalogPage>
              <ConstructorPage />
            </CatalogPage>
          }
        />
        <Route
          path="/feed"
          element={
            <CatalogPage>
              <Feed />
            </CatalogPage>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute guestOnly>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute guestOnly>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute guestOnly>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute guestOnly>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <CatalogPage>
                <ProfileOrders />
              </CatalogPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ingredients/:id"
          element={
            <CatalogPage>
              <DetailPage title="Детали ингредиента">
                <IngredientDetails />
              </DetailPage>
            </CatalogPage>
          }
        />
        <Route
          path="/feed/:number"
          element={
            <CatalogPage>
              <DetailPage>
                <OrderInfo />
              </DetailPage>
            </CatalogPage>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <CatalogPage>
                <DetailPage>
                  <OrderInfo />
                </DetailPage>
              </CatalogPage>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={closeModal}>
                <CatalogPage>
                  <IngredientDetails />
                </CatalogPage>
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={
              <Modal title="" onClose={closeModal}>
                <CatalogPage>
                  <OrderInfo />
                </CatalogPage>
              </Modal>
            }
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <Modal title="" onClose={closeModal}>
                  <CatalogPage>
                    <OrderInfo />
                  </CatalogPage>
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};
export default App;
