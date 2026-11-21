import { ProfileOrdersUI } from '@ui-pages';

import { useOrdersRefresh } from '@hooks/use-orders-refresh';
import { selectHistory } from '@services/selectors';
import { useSelector } from '@services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const { orders, loading, error } = useSelector(selectHistory);
  useOrdersRefresh('history');
  return (
    <>
      {error && (
        <p role="alert" className="text text_type_main-default">
          {error}
        </p>
      )}
      {loading && !orders.length && <p role="status">Загружаем историю заказов…</p>}
      <ProfileOrdersUI orders={orders} />
    </>
  );
};
