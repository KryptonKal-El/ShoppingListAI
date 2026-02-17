/**
 * Shopping list state management backed by Firestore.
 * Real-time listeners push data into state. Actions call Firestore directly.
 * All data is scoped to the authenticated user.
 */
import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { categorizeItem } from '../utils/categories.js';
import { useAuth } from './AuthContext.jsx';
import {
  subscribeLists,
  subscribeItems,
  subscribeHistory,
  subscribeCustomCategories,
  createList as fsCreateList,
  deleteList as fsDeleteList,
  addItem as fsAddItem,
  addItems as fsAddItems,
  updateItem as fsUpdateItem,
  removeItem as fsRemoveItem,
  clearCheckedItems,
  addHistoryEntry,
  createCustomCategory,
  updateCustomCategory as fsUpdateCustomCategory,
  deleteCustomCategory as fsDeleteCustomCategory,
  saveCustomCategoryOrder,
} from '../services/firestore.js';

/** Capitalizes the first letter of a string. */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const ShoppingListContext = createContext(null);

/**
 * Provides shopping list state and actions to the component tree.
 * Subscribes to Firestore real-time listeners scoped to the current user.
 */
export const ShoppingListProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.uid ?? null;

  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);

  // Track whether we've auto-selected a list on initial load
  const hasAutoSelected = useRef(false);

  // Subscribe to lists
  useEffect(() => {
    if (!userId) {
      setLists([]);
      setActiveListId(null);
      hasAutoSelected.current = false;
      return;
    }
    return subscribeLists(userId, (newLists) => {
      setLists(newLists);
      // Auto-select first list on initial load
      if (!hasAutoSelected.current && newLists.length > 0) {
        setActiveListId(newLists[0].id);
        hasAutoSelected.current = true;
      }
    });
  }, [userId]);

  // Subscribe to items of the active list
  useEffect(() => {
    if (!userId || !activeListId) {
      setActiveItems([]);
      return;
    }
    return subscribeItems(userId, activeListId, setActiveItems);
  }, [userId, activeListId]);

  // Subscribe to history
  useEffect(() => {
    if (!userId) {
      setHistory([]);
      return;
    }
    return subscribeHistory(userId, setHistory);
  }, [userId]);

  // Subscribe to custom categories
  useEffect(() => {
    if (!userId) {
      setCustomCategories([]);
      return;
    }
    return subscribeCustomCategories(userId, setCustomCategories);
  }, [userId]);

  // -----------------------------------------------------------------------
  // Actions (same API surface as before)
  // -----------------------------------------------------------------------

  const createListAction = useCallback(async (name) => {
    if (!userId) return;
    const newId = await fsCreateList(userId, name);
    setActiveListId(newId);
  }, [userId]);

  const deleteListAction = useCallback(async (id) => {
    if (!userId) return;
    await fsDeleteList(userId, id);
    if (activeListId === id) {
      setActiveListId((prev) => {
        const remaining = lists.filter((l) => l.id !== id);
        return remaining[0]?.id ?? null;
      });
    }
  }, [userId, activeListId, lists]);

  const selectListAction = useCallback((id) => {
    setActiveListId(id);
  }, []);

  const addItemAction = useCallback(async (listId, rawName) => {
    if (!userId) return;
    const name = capitalize(rawName.trim());
    const item = {
      name,
      category: categorizeItem(name, customCategories),
      isChecked: false,
    };
    await fsAddItem(userId, listId, item);
    await addHistoryEntry(userId, name);
  }, [userId, customCategories]);

  const addItemsAction = useCallback(async (listId, items) => {
    if (!userId) return;
    const prepared = items.map((item) => {
      const name = capitalize(item.name.trim());
      return {
        name,
        category: item.category ?? categorizeItem(name, customCategories),
        isChecked: false,
      };
    });
    await fsAddItems(userId, listId, prepared);
    for (const item of prepared) {
      await addHistoryEntry(userId, item.name);
    }
  }, [userId, customCategories]);

  const toggleItemAction = useCallback(async (listId, itemId) => {
    if (!userId) return;
    const item = activeItems.find((i) => i.id === itemId);
    if (!item) return;
    await fsUpdateItem(userId, listId, itemId, { isChecked: !item.isChecked });
  }, [userId, activeItems]);

  const removeItemAction = useCallback(async (listId, itemId) => {
    if (!userId) return;
    await fsRemoveItem(userId, listId, itemId);
  }, [userId]);

  const updateItemAction = useCallback(async (listId, itemId, updates) => {
    if (!userId) return;
    await fsUpdateItem(userId, listId, itemId, updates);
  }, [userId]);

  const clearCheckedAction = useCallback(async (listId) => {
    if (!userId) return;
    const checkedIds = activeItems.filter((i) => i.isChecked).map((i) => i.id);
    if (checkedIds.length === 0) return;
    await clearCheckedItems(userId, listId, checkedIds);
  }, [userId, activeItems]);

  const addCustomCategoryAction = useCallback(async (name, color, keywords) => {
    if (!userId) return;
    const key = `custom_${Date.now()}`;
    await createCustomCategory(userId, {
      key,
      name,
      color,
      keywords: keywords ?? [],
      order: customCategories.length,
    });
  }, [userId, customCategories.length]);

  const updateCustomCategoryAction = useCallback(async (id, updates) => {
    if (!userId) return;
    await fsUpdateCustomCategory(userId, id, updates);
  }, [userId]);

  const deleteCustomCategoryAction = useCallback(async (id) => {
    if (!userId) return;
    await fsDeleteCustomCategory(userId, id);
  }, [userId]);

  const reorderCustomCategoriesAction = useCallback(async (categories) => {
    if (!userId) return;
    setCustomCategories(categories); // optimistic update for smooth drag
    await saveCustomCategoryOrder(userId, categories);
  }, [userId]);

  // -----------------------------------------------------------------------
  // Build the context value matching the old API shape
  // -----------------------------------------------------------------------

  const state = {
    lists,
    activeListId,
    history,
    customCategories,
  };

  const actions = {
    createList: createListAction,
    deleteList: deleteListAction,
    selectList: selectListAction,
    addItem: addItemAction,
    addItems: addItemsAction,
    toggleItem: toggleItemAction,
    removeItem: removeItemAction,
    updateItem: updateItemAction,
    clearChecked: clearCheckedAction,
    addCustomCategory: addCustomCategoryAction,
    updateCustomCategory: updateCustomCategoryAction,
    deleteCustomCategory: deleteCustomCategoryAction,
    reorderCustomCategories: reorderCustomCategoriesAction,
  };

  // Build activeList object matching old shape (list + its items)
  const activeListMeta = lists.find((l) => l.id === activeListId) ?? null;
  const activeList = activeListMeta
    ? { ...activeListMeta, items: activeItems }
    : null;

  return (
    <ShoppingListContext.Provider value={{ state, actions, activeList }}>
      {children}
    </ShoppingListContext.Provider>
  );
};
