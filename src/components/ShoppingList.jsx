import PropTypes from 'prop-types';
import { CATEGORIES, getAllCategoryLabels, getAllCategoryColors, getAllCategoryKeys } from '../utils/categories.js';
import { ShoppingItem } from './ShoppingItem.jsx';
import styles from './ShoppingList.module.css';

/**
 * Displays the shopping list items grouped by category.
 * Unchecked items appear first, checked items at the bottom.
 * Supports both built-in and custom categories.
 */
export const ShoppingList = ({ items, customCategories, onToggle, onRemove, onUpdateCategory, onClearChecked }) => {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Your list is empty.</p>
        <p className={styles.hint}>Add items above or use AI suggestions below.</p>
      </div>
    );
  }

  const allLabels = getAllCategoryLabels(customCategories);
  const allColors = getAllCategoryColors(customCategories);
  const categoryOrder = getAllCategoryKeys(customCategories);

  // Group items by category
  const grouped = {};
  for (const item of items) {
    if (!item.isChecked) {
      const cat = item.category ?? CATEGORIES.OTHER;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }
  }

  const checkedItems = items.filter((i) => i.isChecked);

  return (
    <div className={styles.list}>
      {categoryOrder.map((cat) => {
        const group = grouped[cat];
        if (!group?.length) return null;
        return (
          <div key={cat} className={styles.group}>
            <h3 className={styles.groupTitle}>
              <span
                className={styles.dot}
                style={{ backgroundColor: allColors[cat] ?? '#9e9e9e' }}
              />
              {allLabels[cat] ?? cat}
              <span className={styles.count}>{group.length}</span>
            </h3>
            {group.map((item) => (
              <ShoppingItem
                key={item.id}
                item={item}
                customCategories={customCategories}
                onToggle={() => onToggle(item.id)}
                onRemove={() => onRemove(item.id)}
                onUpdateCategory={onUpdateCategory}
              />
            ))}
          </div>
        );
      })}

      {checkedItems.length > 0 && (
        <div className={styles.checkedSection}>
          <div className={styles.checkedHeader}>
            <h3 className={styles.groupTitle}>
              Checked ({checkedItems.length})
            </h3>
            <button className={styles.clearBtn} onClick={onClearChecked}>
              Clear checked
            </button>
          </div>
          {checkedItems.map((item) => (
            <ShoppingItem
              key={item.id}
              item={item}
              customCategories={customCategories}
              onToggle={() => onToggle(item.id)}
              onRemove={() => onRemove(item.id)}
              onUpdateCategory={onUpdateCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

ShoppingList.propTypes = {
  items: PropTypes.array.isRequired,
  customCategories: PropTypes.array,
  onToggle: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onUpdateCategory: PropTypes.func.isRequired,
  onClearChecked: PropTypes.func.isRequired,
};

ShoppingList.defaultProps = {
  customCategories: [],
};
