import { ProfileMenuUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { selectSession } from '@services/selectors';
import { signOut } from '@services/slices/session';
import { useDispatch, useSelector } from '@services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { pending, error } = useSelector(selectSession);
  const handleLogout = (): void => {
    if (pending) return;
    void dispatch(signOut()).then((action) => {
      if (signOut.fulfilled.match(action)) void navigate('/login', { replace: true });
    });
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
