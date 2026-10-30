import { IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { selectIngredients } from '@services/selectors';
import { useSelector } from '@services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams();
  const ingredient = useSelector(selectIngredients).find((item) => item._id === id);
  if (!ingredient)
    return <p className="text text_type_main-default">Ингредиент не найден</p>;
  return <IngredientDetailsUI ingredientData={ingredient} />;
};
