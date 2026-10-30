import { useEffect } from 'react';

import { loadFeed } from '@services/slices/feed';
import { loadHistory } from '@services/slices/history';
import { useDispatch } from '@services/store';

const refreshInterval = 10_000;

// Poll only visible pages; also refresh immediately on return to the window.
export const useOrdersRefresh = (scope: 'feed' | 'history'): void => {
  const dispatch = useDispatch();
  useEffect(() => {
    const refresh = (): void => {
      if (scope === 'feed') void dispatch(loadFeed());
      else void dispatch(loadHistory());
    };
    const refreshVisible = (): void => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    const timer = window.setInterval(refreshVisible, refreshInterval);
    window.addEventListener('focus', refreshVisible);
    return (): void => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshVisible);
    };
  }, [dispatch, scope]);
};
