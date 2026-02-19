import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './AddItemForm.module.css';

/**
 * Form for adding new items to the shopping list.
 * Includes an input field, optional store selector, and submit button.
 */
export const AddItemForm = ({ stores, onAdd }) => {
  const [value, setValue] = useState('');
  const [selectedStore, setSelectedStore] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed, selectedStore || null);
    setValue('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add an item..."
        aria-label="New item name"
      />
      {stores.length > 0 && (
        <select
          className={styles.storeSelect}
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          aria-label="Assign to store"
        >
          <option value="">No store</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      )}
      <button className={styles.button} type="submit" disabled={!value.trim()}>
        Add
      </button>
    </form>
  );
};

AddItemForm.propTypes = {
  stores: PropTypes.array,
  onAdd: PropTypes.func.isRequired,
};

AddItemForm.defaultProps = {
  stores: [],
};
