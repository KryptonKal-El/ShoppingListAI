import PropTypes from 'prop-types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/categories.js';
import styles from './ShoppingItem.module.css';

/**
 * A single shopping list item row with checkbox, name, category badge, and delete button.
 */
export const ShoppingItem = ({ item, onToggle, onRemove }) => {
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
        style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? '#9e9e9e' }}
      >
        {CATEGORY_LABELS[item.category] ?? 'Other'}
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
  onToggle: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
