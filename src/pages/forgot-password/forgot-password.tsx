import { ForgotPasswordUI } from '@ui-pages';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSessionForm } from '@hooks/use-session-form';
import { requestPasswordReset } from '@services/slices/session';
import { useDispatch } from '@services/store';

import type { SyntheticEvent } from 'react';

export const ForgotPassword = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const { pending, errorText } = useSessionForm();
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (pending) return;
    void dispatch(requestPasswordReset(email.trim())).then((action) => {
      if (requestPasswordReset.fulfilled.match(action))
        void navigate('/reset-password', { replace: true });
    });
  };
  return <ForgotPasswordUI {...{ email, setEmail, pending, errorText, handleSubmit }} />;
};
