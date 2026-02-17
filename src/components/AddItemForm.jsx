import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './AddItemForm.module.css';

/**
 * Form for adding new items to the shopping list.
 * Includes an input field and submit button.
 */
export const AddItemForm = ({ onAdd }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
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
      <button className={styles.button} type="submit" disabled={!value.trim()}>
        Add
      </button>
    </form>
  );
};

AddItemForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
};
