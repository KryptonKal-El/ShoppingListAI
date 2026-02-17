import { createContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadLists, saveLists, loadHistory, saveHistory } from '../services/storage.js';
import { categorizeItem } from '../utils/categories.js';

/** Capitalizes the first letter of a string. */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const ShoppingListContext = createContext(null);

const ACTION = {
  SET_LISTS: 'SET_LISTS',
  CREATE_LIST: 'CREATE_LIST',
  DELETE_LIST: 'DELETE_LIST',
  SELECT_LIST: 'SELECT_LIST',
  ADD_ITEM: 'ADD_ITEM',
  ADD_ITEMS: 'ADD_ITEMS',
  TOGGLE_ITEM: 'TOGGLE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  CLEAR_CHECKED: 'CLEAR_CHECKED',
  ADD_HISTORY: 'ADD_HISTORY',
  SET_HISTORY: 'SET_HISTORY',
};

const initialState = {
  lists: [],
  activeListId: null,
  history: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION.SET_LISTS:
      return { ...state, lists: action.payload };

    case ACTION.SET_HISTORY:
      return { ...state, history: action.payload };

    case ACTION.CREATE_LIST: {
      const newList = {
        id: uuidv4(),
        name: action.payload.name,
        items: [],
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        lists: [...state.lists, newList],
        activeListId: newList.id,
      };
    }

    case ACTION.DELETE_LIST: {
      const filtered = state.lists.filter((l) => l.id !== action.payload);
      return {
        ...state,
        lists: filtered,
        activeListId: state.activeListId === action.payload
          ? (filtered[0]?.id ?? null)
          : state.activeListId,
      };
    }

    case ACTION.SELECT_LIST:
      return { ...state, activeListId: action.payload };

    case ACTION.ADD_ITEM: {
      const { listId, name: rawName } = action.payload;
      const name = capitalize(rawName.trim());
      const newItem = {
        id: uuidv4(),
        name,
        category: categorizeItem(name),
        isChecked: false,
        addedAt: new Date().toISOString(),
      };
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? { ...list, items: [...list.items, newItem] }
            : list
        ),
      };
    }

    case ACTION.ADD_ITEMS: {
      const { listId, items } = action.payload;
      const capitalizedItems = items.map((item) => ({
        ...item,
        name: capitalize(item.name.trim()),
      }));
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? { ...list, items: [...list.items, ...capitalizedItems] }
            : list
        ),
      };
    }

    case ACTION.TOGGLE_ITEM: {
      const { listId, itemId } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId
                    ? { ...item, isChecked: !item.isChecked }
                    : item
                ),
              }
            : list
        ),
      };
    }

    case ACTION.REMOVE_ITEM: {
      const { listId, itemId } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? { ...list, items: list.items.filter((i) => i.id !== itemId) }
            : list
        ),
      };
    }

    case ACTION.UPDATE_ITEM: {
      const { listId, itemId, updates } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId ? { ...item, ...updates } : item
                ),
              }
            : list
        ),
      };
    }

    case ACTION.CLEAR_CHECKED: {
      const { listId } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? { ...list, items: list.items.filter((i) => !i.isChecked) }
            : list
        ),
      };
    }

    case ACTION.ADD_HISTORY: {
      const newEntry = {
        name: capitalize(action.payload.name.trim()),
        addedAt: new Date().toISOString(),
      };
      return {
        ...state,
        history: [...state.history, newEntry].slice(-200), // keep last 200
      };
    }

    default:
      return state;
  }
};

/**
 * Provides shopping list state and actions to the component tree.
 * Persists data to localStorage on every state change.
 */
export const ShoppingListProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    const lists = loadLists();
    const history = loadHistory();
    if (lists.length > 0) {
      dispatch({ type: ACTION.SET_LISTS, payload: lists });
      dispatch({ type: ACTION.SELECT_LIST, payload: lists[0].id });
    }
    if (history.length > 0) {
      dispatch({ type: ACTION.SET_HISTORY, payload: history });
    }
  }, []);

  // Persist lists whenever they change
  useEffect(() => {
    if (state.lists.length > 0) {
      saveLists(state.lists);
    }
  }, [state.lists]);

  // Persist history whenever it changes
  useEffect(() => {
    if (state.history.length > 0) {
      saveHistory(state.history);
    }
  }, [state.history]);

  const actions = {
    createList: (name) => dispatch({ type: ACTION.CREATE_LIST, payload: { name } }),
    deleteList: (id) => dispatch({ type: ACTION.DELETE_LIST, payload: id }),
    selectList: (id) => dispatch({ type: ACTION.SELECT_LIST, payload: id }),
    addItem: (listId, name) => {
      dispatch({ type: ACTION.ADD_ITEM, payload: { listId, name } });
      dispatch({ type: ACTION.ADD_HISTORY, payload: { name } });
    },
    addItems: (listId, items) => {
      dispatch({ type: ACTION.ADD_ITEMS, payload: { listId, items } });
      for (const item of items) {
        dispatch({ type: ACTION.ADD_HISTORY, payload: { name: item.name } });
      }
    },
    toggleItem: (listId, itemId) =>
      dispatch({ type: ACTION.TOGGLE_ITEM, payload: { listId, itemId } }),
    removeItem: (listId, itemId) =>
      dispatch({ type: ACTION.REMOVE_ITEM, payload: { listId, itemId } }),
    updateItem: (listId, itemId, updates) =>
      dispatch({ type: ACTION.UPDATE_ITEM, payload: { listId, itemId, updates } }),
    clearChecked: (listId) =>
      dispatch({ type: ACTION.CLEAR_CHECKED, payload: { listId } }),
  };

  const activeList = state.lists.find((l) => l.id === state.activeListId) ?? null;

  return (
    <ShoppingListContext.Provider value={{ state, actions, activeList }}>
      {children}
    </ShoppingListContext.Provider>
  );
};
