/**
 * Category definitions and mappings for grocery items.
 * Maps common items to their categories and provides display metadata.
 * Supports custom user-defined categories that layer on top of built-in ones.
 */

export const CATEGORIES = {
  PRODUCE: 'produce',
  DAIRY: 'dairy',
  MEAT: 'meat',
  BAKERY: 'bakery',
  FROZEN: 'frozen',
  PANTRY: 'pantry',
  BEVERAGES: 'beverages',
  SNACKS: 'snacks',
  CONDIMENTS: 'condiments',
  HOUSEHOLD: 'household',
  PERSONAL_CARE: 'personal_care',
  OTHER: 'other',
};

export const CATEGORY_LABELS = {
  [CATEGORIES.PRODUCE]: 'Produce',
  [CATEGORIES.DAIRY]: 'Dairy & Eggs',
  [CATEGORIES.MEAT]: 'Meat & Seafood',
  [CATEGORIES.BAKERY]: 'Bakery',
  [CATEGORIES.FROZEN]: 'Frozen',
  [CATEGORIES.PANTRY]: 'Pantry & Dry Goods',
  [CATEGORIES.BEVERAGES]: 'Beverages',
  [CATEGORIES.SNACKS]: 'Snacks',
  [CATEGORIES.CONDIMENTS]: 'Condiments & Sauces',
  [CATEGORIES.HOUSEHOLD]: 'Household',
  [CATEGORIES.PERSONAL_CARE]: 'Personal Care',
  [CATEGORIES.OTHER]: 'Other',
};

export const CATEGORY_COLORS = {
  [CATEGORIES.PRODUCE]: '#4caf50',
  [CATEGORIES.DAIRY]: '#2196f3',
  [CATEGORIES.MEAT]: '#e53935',
  [CATEGORIES.BAKERY]: '#ff9800',
  [CATEGORIES.FROZEN]: '#00bcd4',
  [CATEGORIES.PANTRY]: '#795548',
  [CATEGORIES.BEVERAGES]: '#9c27b0',
  [CATEGORIES.SNACKS]: '#ffc107',
  [CATEGORIES.CONDIMENTS]: '#ff5722',
  [CATEGORIES.HOUSEHOLD]: '#607d8b',
  [CATEGORIES.PERSONAL_CARE]: '#e91e63',
  [CATEGORIES.OTHER]: '#9e9e9e',
};

/**
 * Keyword-to-category mapping for auto-categorization.
 * Each keyword is lowercase. Matching is done against the item name.
 */
const KEYWORD_MAP = {
  // Produce
  apple: CATEGORIES.PRODUCE,
  apples: CATEGORIES.PRODUCE,
  banana: CATEGORIES.PRODUCE,
  bananas: CATEGORIES.PRODUCE,
  lettuce: CATEGORIES.PRODUCE,
  tomato: CATEGORIES.PRODUCE,
  tomatoes: CATEGORIES.PRODUCE,
  onion: CATEGORIES.PRODUCE,
  onions: CATEGORIES.PRODUCE,
  garlic: CATEGORIES.PRODUCE,
  potato: CATEGORIES.PRODUCE,
  potatoes: CATEGORIES.PRODUCE,
  carrot: CATEGORIES.PRODUCE,
  carrots: CATEGORIES.PRODUCE,
  broccoli: CATEGORIES.PRODUCE,
  spinach: CATEGORIES.PRODUCE,
  avocado: CATEGORIES.PRODUCE,
  avocados: CATEGORIES.PRODUCE,
  cucumber: CATEGORIES.PRODUCE,
  peppers: CATEGORIES.PRODUCE,
  pepper: CATEGORIES.PRODUCE,
  celery: CATEGORIES.PRODUCE,
  mushroom: CATEGORIES.PRODUCE,
  mushrooms: CATEGORIES.PRODUCE,
  lemon: CATEGORIES.PRODUCE,
  lemons: CATEGORIES.PRODUCE,
  lime: CATEGORIES.PRODUCE,
  limes: CATEGORIES.PRODUCE,
  orange: CATEGORIES.PRODUCE,
  oranges: CATEGORIES.PRODUCE,
  berries: CATEGORIES.PRODUCE,
  strawberries: CATEGORIES.PRODUCE,
  blueberries: CATEGORIES.PRODUCE,
  grapes: CATEGORIES.PRODUCE,
  kale: CATEGORIES.PRODUCE,
  zucchini: CATEGORIES.PRODUCE,
  corn: CATEGORIES.PRODUCE,
  ginger: CATEGORIES.PRODUCE,
  cilantro: CATEGORIES.PRODUCE,
  parsley: CATEGORIES.PRODUCE,
  basil: CATEGORIES.PRODUCE,
  mint: CATEGORIES.PRODUCE,
  jalapeño: CATEGORIES.PRODUCE,
  jalapeno: CATEGORIES.PRODUCE,

  // Dairy
  milk: CATEGORIES.DAIRY,
  cheese: CATEGORIES.DAIRY,
  yogurt: CATEGORIES.DAIRY,
  butter: CATEGORIES.DAIRY,
  cream: CATEGORIES.DAIRY,
  eggs: CATEGORIES.DAIRY,
  egg: CATEGORIES.DAIRY,
  'sour cream': CATEGORIES.DAIRY,
  'cream cheese': CATEGORIES.DAIRY,
  'cottage cheese': CATEGORIES.DAIRY,
  mozzarella: CATEGORIES.DAIRY,
  parmesan: CATEGORIES.DAIRY,
  cheddar: CATEGORIES.DAIRY,

  // Meat & Seafood
  chicken: CATEGORIES.MEAT,
  beef: CATEGORIES.MEAT,
  pork: CATEGORIES.MEAT,
  steak: CATEGORIES.MEAT,
  salmon: CATEGORIES.MEAT,
  shrimp: CATEGORIES.MEAT,
  turkey: CATEGORIES.MEAT,
  bacon: CATEGORIES.MEAT,
  sausage: CATEGORIES.MEAT,
  'ground beef': CATEGORIES.MEAT,
  'ground turkey': CATEGORIES.MEAT,
  fish: CATEGORIES.MEAT,
  tuna: CATEGORIES.MEAT,
  lamb: CATEGORIES.MEAT,
  ham: CATEGORIES.MEAT,

  // Bakery
  bread: CATEGORIES.BAKERY,
  bagel: CATEGORIES.BAKERY,
  bagels: CATEGORIES.BAKERY,
  tortilla: CATEGORIES.BAKERY,
  tortillas: CATEGORIES.BAKERY,
  rolls: CATEGORIES.BAKERY,
  buns: CATEGORIES.BAKERY,
  croissant: CATEGORIES.BAKERY,
  muffin: CATEGORIES.BAKERY,
  muffins: CATEGORIES.BAKERY,
  pita: CATEGORIES.BAKERY,

  // Frozen
  'ice cream': CATEGORIES.FROZEN,
  'frozen pizza': CATEGORIES.FROZEN,
  'frozen vegetables': CATEGORIES.FROZEN,
  'frozen fruit': CATEGORIES.FROZEN,
  'frozen berries': CATEGORIES.FROZEN,

  // Pantry
  rice: CATEGORIES.PANTRY,
  pasta: CATEGORIES.PANTRY,
  flour: CATEGORIES.PANTRY,
  sugar: CATEGORIES.PANTRY,
  salt: CATEGORIES.PANTRY,
  oil: CATEGORIES.PANTRY,
  'olive oil': CATEGORIES.PANTRY,
  'vegetable oil': CATEGORIES.PANTRY,
  'coconut oil': CATEGORIES.PANTRY,
  beans: CATEGORIES.PANTRY,
  lentils: CATEGORIES.PANTRY,
  oats: CATEGORIES.PANTRY,
  cereal: CATEGORIES.PANTRY,
  'peanut butter': CATEGORIES.PANTRY,
  'canned tomatoes': CATEGORIES.PANTRY,
  'tomato paste': CATEGORIES.PANTRY,
  'tomato sauce': CATEGORIES.PANTRY,
  'chicken broth': CATEGORIES.PANTRY,
  broth: CATEGORIES.PANTRY,
  noodles: CATEGORIES.PANTRY,
  quinoa: CATEGORIES.PANTRY,
  'baking soda': CATEGORIES.PANTRY,
  'baking powder': CATEGORIES.PANTRY,
  vanilla: CATEGORIES.PANTRY,
  honey: CATEGORIES.PANTRY,
  vinegar: CATEGORIES.PANTRY,
  nuts: CATEGORIES.PANTRY,
  almonds: CATEGORIES.PANTRY,
  walnuts: CATEGORIES.PANTRY,

  // Beverages
  water: CATEGORIES.BEVERAGES,
  juice: CATEGORIES.BEVERAGES,
  coffee: CATEGORIES.BEVERAGES,
  tea: CATEGORIES.BEVERAGES,
  soda: CATEGORIES.BEVERAGES,
  wine: CATEGORIES.BEVERAGES,
  beer: CATEGORIES.BEVERAGES,

  // Snacks
  chips: CATEGORIES.SNACKS,
  crackers: CATEGORIES.SNACKS,
  cookies: CATEGORIES.SNACKS,
  popcorn: CATEGORIES.SNACKS,
  granola: CATEGORIES.SNACKS,
  'granola bars': CATEGORIES.SNACKS,
  pretzels: CATEGORIES.SNACKS,
  chocolate: CATEGORIES.SNACKS,

  // Condiments & Sauces
  ketchup: CATEGORIES.CONDIMENTS,
  mustard: CATEGORIES.CONDIMENTS,
  mayo: CATEGORIES.CONDIMENTS,
  mayonnaise: CATEGORIES.CONDIMENTS,
  'soy sauce': CATEGORIES.CONDIMENTS,
  'hot sauce': CATEGORIES.CONDIMENTS,
  salsa: CATEGORIES.CONDIMENTS,
  'salad dressing': CATEGORIES.CONDIMENTS,
  'bbq sauce': CATEGORIES.CONDIMENTS,
  sriracha: CATEGORIES.CONDIMENTS,

  // Household
  'paper towels': CATEGORIES.HOUSEHOLD,
  'toilet paper': CATEGORIES.HOUSEHOLD,
  'trash bags': CATEGORIES.HOUSEHOLD,
  'dish soap': CATEGORIES.HOUSEHOLD,
  'laundry detergent': CATEGORIES.HOUSEHOLD,
  sponge: CATEGORIES.HOUSEHOLD,
  'aluminum foil': CATEGORIES.HOUSEHOLD,
  'plastic wrap': CATEGORIES.HOUSEHOLD,

  // Personal Care
  shampoo: CATEGORIES.PERSONAL_CARE,
  conditioner: CATEGORIES.PERSONAL_CARE,
  soap: CATEGORIES.PERSONAL_CARE,
  toothpaste: CATEGORIES.PERSONAL_CARE,
  deodorant: CATEGORIES.PERSONAL_CARE,
  lotion: CATEGORIES.PERSONAL_CARE,
};

/**
 * Categorizes an item name by matching against known keywords.
 * Checks custom category keywords first, then falls back to built-in mappings.
 * @param {string} itemName - The name of the grocery item
 * @param {Array} [customCategories=[]] - User-defined categories with keywords
 * @returns {string} The category key
 */
export const categorizeItem = (itemName, customCategories = []) => {
  const normalized = itemName.toLowerCase().trim();

  // Check custom categories first (user keywords take priority)
  for (const cat of customCategories) {
    for (const keyword of cat.keywords) {
      const kw = keyword.toLowerCase();
      if (normalized === kw) return cat.key;
      if (kw.includes(' ') && normalized.includes(kw)) return cat.key;
    }
    // Single-word fallback for custom keywords
    const words = normalized.split(/\s+/);
    for (const word of words) {
      for (const keyword of cat.keywords) {
        if (word === keyword.toLowerCase()) return cat.key;
      }
    }
  }

  // Built-in exact match
  if (KEYWORD_MAP[normalized]) {
    return KEYWORD_MAP[normalized];
  }

  // Multi-word phrase match
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (keyword.includes(' ') && normalized.includes(keyword)) {
      return category;
    }
  }

  // Single-word match
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (KEYWORD_MAP[word]) {
      return KEYWORD_MAP[word];
    }
  }

  return CATEGORIES.OTHER;
};

/**
 * Merges built-in category labels with custom category labels.
 * @param {Array} customCategories - User-defined categories
 * @returns {Object} Combined label map keyed by category key
 */
export const getAllCategoryLabels = (customCategories = []) => {
  const merged = { ...CATEGORY_LABELS };
  for (const cat of customCategories) {
    merged[cat.key] = cat.name;
  }
  return merged;
};

/**
 * Merges built-in category colors with custom category colors.
 * @param {Array} customCategories - User-defined categories
 * @returns {Object} Combined color map keyed by category key
 */
export const getAllCategoryColors = (customCategories = []) => {
  const merged = { ...CATEGORY_COLORS };
  for (const cat of customCategories) {
    merged[cat.key] = cat.color;
  }
  return merged;
};

/**
 * Returns the ordered list of all category keys (built-in + custom).
 * @param {Array} customCategories - User-defined categories
 * @returns {Array<string>} All category keys in display order
 */
export const getAllCategoryKeys = (customCategories = []) => {
  const builtIn = Object.values(CATEGORIES);
  const customKeys = customCategories.map((cat) => cat.key);
  // Insert custom categories before "other"
  const otherIndex = builtIn.indexOf(CATEGORIES.OTHER);
  return [
    ...builtIn.slice(0, otherIndex),
    ...customKeys,
    ...builtIn.slice(otherIndex),
  ];
};
