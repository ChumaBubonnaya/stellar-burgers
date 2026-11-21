import { LoginUI } from '@ui-pages';
import { useState } from 'react';

import { useSessionForm } from '@hooks/use-session-form';
import { signIn } from '@services/slices/session';
import { useDispatch } from '@services/store';

import type { SyntheticEvent } from 'react';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { pending, errorText } = useSessionForm();
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (!pending) void dispatch(signIn({ email: email.trim(), password }));
  };
  return (
    <LoginUI
      {...{ email, setEmail, password, setPassword, pending, errorText, handleSubmit }}
    />
  );
};
