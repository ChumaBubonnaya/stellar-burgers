import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';

import { useOrdersRefresh } from '@hooks/use-orders-refresh';
import { selectFeed } from '@services/selectors';
import { loadFeed } from '@services/slices/feed';
import { useDispatch, useSelector } from '@services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(selectFeed);
  useOrdersRefresh('feed');
  if (isLoading && !orders.length) return <Preloader />;
  return (
    <>
      {error && (
        <p role="alert" className="text text_type_main-default">
          {error}
        </p>
      )}
      <FeedUI
        orders={orders}
        handleGetFeeds={() => {
          void dispatch(loadFeed());
        }}
      />
    </>
  );
};
