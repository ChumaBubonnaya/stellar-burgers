import { ProfileUI } from '@ui-pages';
import { useEffect, useState } from 'react';

import { useSessionForm } from '@hooks/use-session-form';
import { selectUser } from '@services/selectors';
import { clearSessionError, saveProfile } from '@services/slices/session';
import { useDispatch, useSelector } from '@services/store';

import type { ChangeEvent, SyntheticEvent } from 'react';

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { pending, errorText } = useSessionForm();
  const [formValue, setFormValue] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  });
  useEffect(() => {
    setFormValue({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
  }, [user]);
  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (pending || !isFormChanged) return;
    const { name, email, password } = formValue;
    void dispatch(
      saveProfile({
        name: name.trim(),
        email: email.trim(),
        ...(password ? { password } : {}),
      })
    );
  };
  const handleCancel = (event: SyntheticEvent): void => {
    event.preventDefault();
    setFormValue({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
    dispatch(clearSessionError());
  };
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormValue((values) => ({ ...values, [event.target.name]: event.target.value }));
  };
  return (
    <ProfileUI
      {...{
        formValue,
        isFormChanged,
        handleSubmit,
        handleCancel,
        handleInputChange,
        pending,
      }}
      updateUserError={errorText}
    />
  );
};
