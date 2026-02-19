import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAllCategoryLabels, getAllCategoryColors, getAllCategoryKeys } from '../utils/categories.js';
import styles from './ShoppingItem.module.css';

/**
 * A single shopping list item row with checkbox, name, clickable category badge, and delete button.
 * Clicking the category badge opens a dropdown to reassign the item's category.
 */
export const ShoppingItem = ({ item, customCategories, onToggle, onRemove, onUpdateCategory }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  const allLabels = getAllCategoryLabels(customCategories);
  const allColors = getAllCategoryColors(customCategories);
  const allKeys = getAllCategoryKeys(customCategories);

  // Close picker on outside click
  useEffect(() => {
    if (!isPickerOpen) return;
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isPickerOpen]);

  const handleSelectCategory = (key) => {
    if (key !== item.category) {
      onUpdateCategory(item.id, key);
    }
    setIsPickerOpen(false);
  };

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
      <div className={styles.categoryWrapper} ref={pickerRef}>
        <button
          type="button"
          className={styles.category}
          style={{ backgroundColor: allColors[item.category] ?? '#9e9e9e' }}
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          title="Change category"
        >
          {allLabels[item.category] ?? 'Other'}
        </button>
        {isPickerOpen && (
          <div className={styles.picker}>
            {allKeys.map((key) => (
              <button
                key={key}
                type="button"
                className={`${styles.pickerOption} ${key === item.category ? styles.pickerActive : ''}`}
                onClick={() => handleSelectCategory(key)}
              >
                <span
                  className={styles.pickerDot}
                  style={{ backgroundColor: allColors[key] ?? '#9e9e9e' }}
                />
                {allLabels[key] ?? key}
              </button>
            ))}
          </div>
        )}
      </div>
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
  onUpdateCategory: PropTypes.func.isRequired,
};

ShoppingItem.defaultProps = {
  customCategories: [],
};
