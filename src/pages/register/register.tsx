import { RegisterUI } from '@ui-pages';
import { useState } from 'react';

import { useSessionForm } from '@hooks/use-session-form';
import { signUp } from '@services/slices/session';
import { useDispatch } from '@services/store';

import type { SyntheticEvent } from 'react';

export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { pending, errorText } = useSessionForm();
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (!pending)
      void dispatch(signUp({ name: userName.trim(), email: email.trim(), password }));
  };
  return (
    <RegisterUI
      {...{
        userName,
        setUserName,
        email,
        setEmail,
        password,
        setPassword,
        pending,
        errorText,
        handleSubmit,
      }}
    />
  );
};
