import { IngredientDetails, Modal, OrderInfo } from '@components';
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
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { ProtectedRoute } from '@components/protected-route/protected-route';

import { DetailPage } from './detail-page';

import type { NavigationState } from '@components/protected-route/protected-route';

export const AppRoutes = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const background = (location.state as NavigationState | null)?.background;
  const closeModal = (): void => {
    void navigate(-1);
  };
  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
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
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ingredients/:id"
          element={
            <DetailPage title="Детали ингредиента">
              <IngredientDetails />
            </DetailPage>
          }
        />
        <Route
          path="/feed/:number"
          element={
            <DetailPage>
              <OrderInfo source="feed" />
            </DetailPage>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <DetailPage>
                <OrderInfo source="history" />
              </DetailPage>
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
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={
              <Modal title="" onClose={closeModal}>
                <OrderInfo source="feed" />
              </Modal>
            }
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <Modal title="" onClose={closeModal}>
                  <OrderInfo source="history" />
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};
