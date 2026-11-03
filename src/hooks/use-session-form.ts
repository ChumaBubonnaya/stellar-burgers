import { useEffect } from 'react';

import { selectSession } from '@services/selectors';
import { clearSessionError } from '@services/slices/session';
import { useDispatch, useSelector } from '@services/store';

export const useSessionForm = (): {
  pending: boolean;
  errorText: string | undefined;
} => {
  const dispatch = useDispatch();
  const { pending, error } = useSelector(selectSession);
  useEffect(() => {
    dispatch(clearSessionError());
  }, [dispatch]);
  return { pending, errorText: error ?? undefined };
};
