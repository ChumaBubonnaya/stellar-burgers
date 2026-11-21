import { ResetPasswordUI } from '@ui-pages';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useSessionForm } from '@hooks/use-session-form';
import { changePassword } from '@services/slices/session';
import { useDispatch } from '@services/store';

import type { SyntheticEvent } from 'react';

export const ResetPassword = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [canReset] = useState(() => !!localStorage.getItem('resetPassword'));
  const { pending, errorText } = useSessionForm();
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (pending) return;
    void dispatch(changePassword({ password, token: token.trim() })).then((action) => {
      if (changePassword.fulfilled.match(action))
        void navigate('/login', { replace: true });
    });
  };
  if (!canReset) return <Navigate to="/forgot-password" replace />;
  return (
    <ResetPasswordUI
      {...{ password, setPassword, token, setToken, pending, errorText, handleSubmit }}
    />
  );
};
