import { Preloader, OrderInfoUI } from '@ui';
import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  selectFeedOrder,
  selectHistoryOrder,
  selectIngredients,
  selectOrder,
} from '@services/selectors';
import { loadOrderDetails } from '@services/slices/order';
import { useDispatch, useSelector } from '@services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = ({
  source,
}: {
  source: 'feed' | 'history';
}): React.JSX.Element => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const orderNumber = Number(number);
  const { detail, detailNumber, detailError } = useSelector(selectOrder);
  const ingredients = useSelector(selectIngredients);
  const selectListedOrder = source === 'feed' ? selectFeedOrder : selectHistoryOrder;
  const listedOrder = useSelector((state) => selectListedOrder(state, orderNumber));
  const hasListedOrder = !!listedOrder;
  const orderData = listedOrder ?? (detail?.number === orderNumber ? detail : null);
  useEffect(() => {
    if (!hasListedOrder) void dispatch(loadOrderDetails(orderNumber));
  }, [dispatch, orderNumber, hasListedOrder]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo && detailNumber === orderNumber && detailError)
    return (
      <p role="alert" className="text text_type_main-default">
        {detailError}
      </p>
    );
  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
