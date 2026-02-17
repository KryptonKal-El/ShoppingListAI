import { useContext } from 'react';
import { ShoppingListContext } from '../context/ShoppingListContext.jsx';

/**
 * Hook to access shopping list state and actions.
 * Must be used within a ShoppingListProvider.
 * @returns {{ state: Object, actions: Object, activeList: Object|null }}
 */
export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
};
