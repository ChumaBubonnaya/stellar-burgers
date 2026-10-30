import { BurgerConstructorUI } from '@ui';
import { useNavigate } from 'react-router-dom';

import {
  selectBuilder,
  selectBurgerPrice,
  selectOrder,
  selectUser,
} from '@services/selectors';
import { loadFeed } from '@services/slices/feed';
import { loadHistory } from '@services/slices/history';
import { closeReceipt, submitOrder } from '@services/slices/order';
import { useDispatch, useSelector } from '@services/store';

export const BurgerConstructor = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const constructorItems = useSelector(selectBuilder);
  const { pending, receipt, error } = useSelector(selectOrder);
  const user = useSelector(selectUser);
  const price = useSelector(selectBurgerPrice);
  const onOrderClick = (): void => {
    if (pending) return;
    if (!user) {
      void navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }
    if (!constructorItems.bun) return;
    const bunId = constructorItems.bun._id;
    const ids = [bunId, ...constructorItems.ingredients.map((item) => item._id), bunId];
    void dispatch(submitOrder(ids)).then((action) => {
      if (submitOrder.fulfilled.match(action)) {
        void dispatch(loadFeed());
        void dispatch(loadHistory());
      }
    });
  };
  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={pending}
      constructorItems={constructorItems}
      orderModalData={receipt}
      onOrderClick={onOrderClick}
      closeOrderModal={() => {
        if (!pending) dispatch(closeReceipt());
      }}
      errorText={error ?? undefined}
    />
  );
};
