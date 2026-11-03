import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { selectSession } from '@services/selectors';
import { useSelector } from '@services/store';

import type { ReactElement } from 'react';
import type { Location } from 'react-router-dom';

export type NavigationState = { background?: Location; from?: Location };

export const ProtectedRoute = ({
  children,
  guestOnly = false,
}: {
  children: ReactElement;
  guestOnly?: boolean;
}): ReactElement => {
  const { user, checked } = useSelector(selectSession);
  const location = useLocation();
  const state = location.state as NavigationState | null;
  if (!checked) return <Preloader />;
  if (!guestOnly && !user)
    return <Navigate to="/login" state={{ from: location }} replace />;
  if (guestOnly && user) return <Navigate to={state?.from ?? '/'} replace />;
  return children;
};
