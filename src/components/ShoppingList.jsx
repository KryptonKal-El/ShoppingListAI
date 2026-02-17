import PropTypes from 'prop-types';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/categories.js';
import { ShoppingItem } from './ShoppingItem.jsx';
import styles from './ShoppingList.module.css';

/**
 * Displays the shopping list items grouped by category.
 * Unchecked items appear first, checked items at the bottom.
 */
export const ShoppingList = ({ items, onToggle, onRemove, onClearChecked }) => {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Your list is empty.</p>
        <p className={styles.hint}>Add items above or use AI suggestions below.</p>
      </div>
    );
  }

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
  const categoryOrder = Object.values(CATEGORIES);

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
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              {CATEGORY_LABELS[cat]}
              <span className={styles.count}>{group.length}</span>
            </h3>
            {group.map((item) => (
              <ShoppingItem
                key={item.id}
                item={item}
                onToggle={() => onToggle(item.id)}
                onRemove={() => onRemove(item.id)}
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
              onToggle={() => onToggle(item.id)}
              onRemove={() => onRemove(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

ShoppingList.propTypes = {
  items: PropTypes.array.isRequired,
  onToggle: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onClearChecked: PropTypes.func.isRequired,
};
