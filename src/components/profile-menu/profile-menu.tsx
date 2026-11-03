import { ProfileMenuUI } from '@ui';
import { useLocation } from 'react-router-dom';

import { selectSession } from '@services/selectors';
import { signOut } from '@services/slices/session';
import { useDispatch, useSelector } from '@services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { pending, error } = useSelector(selectSession);
  const handleLogout = (): void => {
    if (pending) return;
    void dispatch(signOut());
  };
  return (
    <>
      <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />
      {error && (
        <p role="alert" className="text text_type_main-default">
          {error}
        </p>
      )}
    </>
  );
};
