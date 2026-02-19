import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAllCategoryLabels, getAllCategoryColors, getAllCategoryKeys } from '../utils/categories.js';
import styles from './ShoppingItem.module.css';

/**
 * A single shopping list item row with checkbox, name, clickable category badge,
 * clickable store badge, clickable aisle badge, and delete button.
 * Clicking any badge opens a dropdown to reassign.
 */
export const ShoppingItem = ({ item, customCategories, stores, onToggle, onRemove, onUpdateCategory, onUpdateStore, onUpdateAisle }) => {
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);
  const [isAislePickerOpen, setIsAislePickerOpen] = useState(false);
  const categoryPickerRef = useRef(null);
  const storePickerRef = useRef(null);
  const aislePickerRef = useRef(null);

  const allLabels = getAllCategoryLabels(customCategories);
  const allColors = getAllCategoryColors(customCategories);
  const allKeys = getAllCategoryKeys(customCategories);

  const storeMap = {};
  for (const s of stores) {
    storeMap[s.id] = s;
  }
  const assignedStore = item.store ? storeMap[item.store] : null;
  const storeAisles = assignedStore?.aisles ?? [];

  // Close category picker on outside click
  useEffect(() => {
    if (!isCategoryPickerOpen) return;
    const handleClick = (e) => {
      if (categoryPickerRef.current && !categoryPickerRef.current.contains(e.target)) {
        setIsCategoryPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isCategoryPickerOpen]);

  // Close store picker on outside click
  useEffect(() => {
    if (!isStorePickerOpen) return;
    const handleClick = (e) => {
      if (storePickerRef.current && !storePickerRef.current.contains(e.target)) {
        setIsStorePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isStorePickerOpen]);

  // Close aisle picker on outside click
  useEffect(() => {
    if (!isAislePickerOpen) return;
    const handleClick = (e) => {
      if (aislePickerRef.current && !aislePickerRef.current.contains(e.target)) {
        setIsAislePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isAislePickerOpen]);

  const handleSelectCategory = (key) => {
    if (key !== item.category) {
      onUpdateCategory(item.id, key);
    }
    setIsCategoryPickerOpen(false);
  };

  const handleSelectStore = (storeId) => {
    if (storeId !== (item.store ?? null)) {
      onUpdateStore(item.id, storeId);
      // Clear aisle when store changes
      if (item.aisle) {
        onUpdateAisle(item.id, null);
      }
    }
    setIsStorePickerOpen(false);
  };

  const handleSelectAisle = (aisleName) => {
    if (aisleName !== (item.aisle ?? null)) {
      onUpdateAisle(item.id, aisleName);
    }
    setIsAislePickerOpen(false);
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
      <div className={styles.badges}>
        {stores.length > 0 && (
          <div className={styles.storeWrapper} ref={storePickerRef}>
            <button
              type="button"
              className={styles.storeBadge}
              style={assignedStore ? { backgroundColor: assignedStore.color } : undefined}
              onClick={() => setIsStorePickerOpen(!isStorePickerOpen)}
              title="Change store"
            >
              {assignedStore ? assignedStore.name : 'No store'}
            </button>
            {isStorePickerOpen && (
              <div className={styles.picker}>
                <button
                  type="button"
                  className={`${styles.pickerOption} ${!item.store ? styles.pickerActive : ''}`}
                  onClick={() => handleSelectStore(null)}
                >
                  <span className={styles.pickerDot} style={{ backgroundColor: '#bbb' }} />
                  No store
                </button>
                {stores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    className={`${styles.pickerOption} ${store.id === item.store ? styles.pickerActive : ''}`}
                    onClick={() => handleSelectStore(store.id)}
                  >
                    <span
                      className={styles.pickerDot}
                      style={{ backgroundColor: store.color }}
                    />
                    {store.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {assignedStore && storeAisles.length > 0 && (
          <div className={styles.aisleWrapper} ref={aislePickerRef}>
            <button
              type="button"
              className={styles.aisleBadge}
              onClick={() => setIsAislePickerOpen(!isAislePickerOpen)}
              title="Change aisle"
            >
              {item.aisle ?? 'No aisle'}
            </button>
            {isAislePickerOpen && (
              <div className={styles.picker}>
                <button
                  type="button"
                  className={`${styles.pickerOption} ${!item.aisle ? styles.pickerActive : ''}`}
                  onClick={() => handleSelectAisle(null)}
                >
                  <span className={styles.pickerDot} style={{ backgroundColor: '#bbb' }} />
                  No aisle
                </button>
                {storeAisles.map((aisle) => (
                  <button
                    key={aisle}
                    type="button"
                    className={`${styles.pickerOption} ${aisle === item.aisle ? styles.pickerActive : ''}`}
                    onClick={() => handleSelectAisle(aisle)}
                  >
                    <span className={styles.pickerDot} style={{ backgroundColor: '#78909c' }} />
                    {aisle}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className={styles.categoryWrapper} ref={categoryPickerRef}>
          <button
            type="button"
            className={styles.category}
            style={{ backgroundColor: allColors[item.category] ?? '#9e9e9e' }}
            onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
            title="Change category"
          >
            {allLabels[item.category] ?? 'Other'}
          </button>
          {isCategoryPickerOpen && (
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
    store: PropTypes.string,
    aisle: PropTypes.string,
  }).isRequired,
  customCategories: PropTypes.array,
  stores: PropTypes.array,
  onToggle: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onUpdateCategory: PropTypes.func.isRequired,
  onUpdateStore: PropTypes.func.isRequired,
  onUpdateAisle: PropTypes.func.isRequired,
};

ShoppingItem.defaultProps = {
  customCategories: [],
  stores: [],
};
