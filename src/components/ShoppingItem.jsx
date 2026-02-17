import PropTypes from 'prop-types';
import { getAllCategoryLabels, getAllCategoryColors } from '../utils/categories.js';
import styles from './ShoppingItem.module.css';

/**
 * A single shopping list item row with checkbox, name, category badge, and delete button.
 */
export const ShoppingItem = ({ item, customCategories, onToggle, onRemove }) => {
  const allLabels = getAllCategoryLabels(customCategories);
  const allColors = getAllCategoryColors(customCategories);

  return (
    <div className={`${styles.item} ${item.isChecked ? styles.checked : ''}`}>
      <label className={styles.label}>
        <input
          type="checkbox"
          checked={item.isChecked}
          onChange={onToggle}
          className={styles.checkbox}
        />
        <span className={styles.name}>{item.name}</span>
      </label>
      <span
        className={styles.category}
        style={{ backgroundColor: allColors[item.category] ?? '#9e9e9e' }}
      >
        {allLabels[item.category] ?? 'Other'}
      </span>
      <button
        className={styles.deleteBtn}
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
      >
        x
      </button>
    </div>
  );
};

ShoppingItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    isChecked: PropTypes.bool.isRequired,
  }).isRequired,
  customCategories: PropTypes.array,
  onToggle: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

ShoppingItem.defaultProps = {
  customCategories: [],
};
