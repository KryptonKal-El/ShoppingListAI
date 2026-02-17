/**
 * Manages persistent storage of shopping list data using localStorage.
 */

const STORAGE_KEYS = {
  LISTS: 'shoppingListAI_lists',
  HISTORY: 'shoppingListAI_history',
  RECIPES: 'shoppingListAI_recipes',
  CUSTOM_CATEGORIES: 'shoppingListAI_customCategories',
};

/**
 * Safely reads and parses JSON from localStorage.
 * @param {string} key - The localStorage key
 * @param {*} fallback - Default value if key doesn't exist or parse fails
 * @returns {*} The parsed value or the fallback
 */
const readStorage = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Failed to read localStorage key "${key}":`, err);
    return fallback;
  }
};

/**
 * Safely writes a value as JSON to localStorage.
 * @param {string} key - The localStorage key
 * @param {*} value - The value to serialize and store
 */
const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write localStorage key "${key}":`, err);
  }
};

/** @returns {Array} All saved shopping lists */
export const loadLists = () => readStorage(STORAGE_KEYS.LISTS, []);

/** @param {Array} lists - The shopping lists to persist */
export const saveLists = (lists) => writeStorage(STORAGE_KEYS.LISTS, lists);

/** @returns {Array} Historical items for suggestion engine */
export const loadHistory = () => readStorage(STORAGE_KEYS.HISTORY, []);

/** @param {Array} history - The item history to persist */
export const saveHistory = (history) => writeStorage(STORAGE_KEYS.HISTORY, history);

/** @returns {Array} Saved recipes */
export const loadRecipes = () => readStorage(STORAGE_KEYS.RECIPES, []);

/** @param {Array} recipes - The recipes to persist */
export const saveRecipes = (recipes) => writeStorage(STORAGE_KEYS.RECIPES, recipes);

/** @returns {Array} Custom category definitions */
export const loadCustomCategories = () => readStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, []);

/** @param {Array} categories - Custom categories to persist */
export const saveCustomCategories = (categories) => writeStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, categories);
