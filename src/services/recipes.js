/**
 * Recipe parsing service - converts recipe text to structured shopping list items.
 * Handles common recipe formats with ingredient quantities and units.
 */

import { v4 as uuidv4 } from 'uuid';
import { categorizeItem } from '../utils/categories.js';

/**
 * Common cooking measurements to strip from ingredient names.
 */
const UNITS = [
  'cups?', 'cup', 'tbsp', 'tablespoons?', 'tsp', 'teaspoons?',
  'oz', 'ounces?', 'lbs?', 'pounds?', 'grams?', 'kg',
  'ml', 'liters?', 'quarts?', 'pints?', 'gallons?',
  'cloves?', 'slices?', 'pieces?', 'cans?', 'packages?',
  'bunches?', 'heads?', 'stalks?', 'sprigs?', 'pinch(?:es)?',
  'dash(?:es)?', 'handful(?:s)?',
];

const UNIT_PATTERN = new RegExp(
  `^[\\d./\\s-]+(?:${UNITS.join('|')})\\s+(?:of\\s+)?`,
  'i'
);

/**
 * Strips quantity and unit prefix from an ingredient line.
 * "2 cups flour" -> "flour"
 * "1/2 lb ground beef" -> "ground beef"
 * @param {string} line - A single ingredient line
 * @returns {string} The ingredient name without quantity/unit
 */
const stripQuantity = (line) => {
  let cleaned = line
    .replace(/\(.*?\)/g, '')   // Remove parenthetical notes
    .replace(/,.*$/, '')       // Remove everything after comma (prep instructions)
    .trim();

  // Remove leading numbers and fractions
  cleaned = cleaned.replace(/^[\d./\s-]+/, '').trim();

  // Remove unit words
  cleaned = cleaned.replace(UNIT_PATTERN, '').trim();

  // If stripping removed everything, fall back to original
  if (!cleaned) {
    cleaned = line.replace(/^[\d./\s-]+/, '').trim();
  }

  return cleaned;
};

/**
 * Pre-built recipe templates for common meals.
 * Each has a name, description, and list of ingredients.
 */
export const RECIPE_TEMPLATES = [
  {
    id: 'spaghetti-bolognese',
    name: 'Spaghetti Bolognese',
    description: 'Classic Italian pasta with meat sauce',
    ingredients: [
      'spaghetti', 'ground beef', 'tomato sauce', 'onion',
      'garlic', 'olive oil', 'parmesan', 'salt', 'pepper', 'basil',
    ],
  },
  {
    id: 'chicken-stir-fry',
    name: 'Chicken Stir Fry',
    description: 'Quick and easy weeknight dinner',
    ingredients: [
      'chicken breast', 'broccoli', 'bell pepper', 'soy sauce',
      'garlic', 'ginger', 'rice', 'vegetable oil', 'sesame oil',
    ],
  },
  {
    id: 'tacos',
    name: 'Tacos',
    description: 'Build-your-own taco night',
    ingredients: [
      'ground beef', 'tortillas', 'cheese', 'lettuce', 'tomatoes',
      'sour cream', 'salsa', 'onion', 'cilantro', 'lime',
    ],
  },
  {
    id: 'caesar-salad',
    name: 'Caesar Salad',
    description: 'Classic caesar with homemade dressing',
    ingredients: [
      'romaine lettuce', 'parmesan', 'croutons', 'lemon',
      'garlic', 'olive oil', 'anchovy paste', 'eggs',
    ],
  },
  {
    id: 'pancakes',
    name: 'Pancakes',
    description: 'Fluffy breakfast pancakes',
    ingredients: [
      'flour', 'eggs', 'milk', 'butter', 'sugar',
      'baking powder', 'salt', 'vanilla', 'maple syrup',
    ],
  },
  {
    id: 'grilled-salmon',
    name: 'Grilled Salmon',
    description: 'Simple grilled salmon with vegetables',
    ingredients: [
      'salmon', 'lemon', 'garlic', 'olive oil', 'asparagus',
      'salt', 'pepper', 'butter', 'dill',
    ],
  },
];

/**
 * Parses raw recipe text into structured shopping list items.
 * Handles various formats:
 * - "2 cups flour"
 * - "- 1 lb ground beef"
 * - "3 cloves garlic, minced"
 * @param {string} recipeText - Raw recipe text with one ingredient per line
 * @returns {Array<{id: string, name: string, category: string, isChecked: boolean}>}
 */
export const parseRecipeText = (recipeText) => {
  if (!recipeText?.trim()) {
    return [];
  }

  const lines = recipeText
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line.length > 0 && !/^(instructions|directions|steps|method)/i.test(line));

  const items = [];
  const seen = new Set();

  for (const line of lines) {
    const name = stripQuantity(line);
    const key = name.toLowerCase();

    if (key.length < 2 || seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push({
      id: uuidv4(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      category: categorizeItem(name),
      isChecked: false,
    });
  }

  return items;
};

/**
 * Converts a recipe template's ingredients into shopping list items.
 * @param {Object} template - A recipe template from RECIPE_TEMPLATES
 * @returns {Array<{id: string, name: string, category: string, isChecked: boolean}>}
 */
export const recipeTemplateToItems = (template) => {
  return template.ingredients.map((ingredient) => ({
    id: uuidv4(),
    name: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
    category: categorizeItem(ingredient),
    isChecked: false,
  }));
};
