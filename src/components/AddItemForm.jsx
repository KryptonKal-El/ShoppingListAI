import { useState, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTypeConfig } from '../utils/listTypes.js';
import styles from './AddItemForm.module.css';

/**
 * Derives deduplicated, sorted suggestions from history, one per (name, store)
 * pair so the same product bought at different stores stays distinct. History
 * is ordered oldest-first, so the newest entry per pair wins as the template.
 * @param {Array<{name: string, storeId?: string}>} history
 * @param {Array<{id: string, name: string}>} stores
 * @returns {Array<{key: string, name: string, storeId: string|null, storeName: string|null, template: object}>}
 */
const getSuggestionEntries = (history, stores) => {
  const byKey = new Map();
  for (const entry of history) {
    const key = `${entry.name.toLowerCase()}|${entry.storeId ?? ''}`;
    byKey.set(key, entry);
  }
  return [...byKey.entries()]
    .map(([key, entry]) => ({
      key,
      name: entry.name,
      storeId: entry.storeId ?? null,
      storeName: stores.find((s) => s.id === entry.storeId)?.name ?? null,
      template: entry,
    }))
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name) ||
        (a.storeName ?? '').localeCompare(b.storeName ?? '')
    );
};

/**
 * Form for adding new items to the shopping list.
 * Includes an input field with autocomplete from history,
 * optional store selector (when list type supports stores), and submit button.
 */
export const AddItemForm = ({ stores = [], history = [], listType = 'grocery', onAdd }) => {
  const typeConfig = getTypeConfig(listType);
  const [value, setValue] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const suggestionEntries = useMemo(
    () => getSuggestionEntries(history, stores),
    [history, stores]
  );
  // The suggestion the user picked from the dropdown; its history template is
  // passed through on submit so the item restores that store's saved fields.
  const [pendingSuggestion, setPendingSuggestion] = useState(null);

  const suggestions = useMemo(() => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return [];
    return suggestionEntries.filter((s) => s.name.toLowerCase().includes(trimmed));
  }, [value, suggestionEntries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const items = listRef.current.children;
    if (items[highlightedIndex]) {
      items[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = (suggestion) => {
    setValue(suggestion.name);
    setPendingSuggestion(suggestion);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    // Only honor the picked suggestion if the input still matches it.
    const suggestion =
      pendingSuggestion && pendingSuggestion.name === trimmed ? pendingSuggestion : null;
    const storeId = suggestion
      ? suggestion.storeId ?? (selectedStore || null)
      : selectedStore || null;
    onAdd(trimmed, storeId, suggestion?.template ?? null);
    setValue('');
    setPendingSuggestion(null);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
    setPendingSuggestion(null);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const showDropdown = isDropdownOpen && suggestions.length > 0;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper} ref={wrapperRef}>
        <input
          className={styles.input}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.trim() && setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Add an item..."
          aria-label="New item name"
          autoComplete="off"
        />
        {showDropdown && (
          <ul className={styles.dropdown} ref={listRef} role="listbox">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.key}
                role="option"
                aria-selected={index === highlightedIndex}
                className={`${styles.dropdownItem} ${index === highlightedIndex ? styles.highlighted : ''}`}
                onMouseDown={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span>{suggestion.name}</span>
                {suggestion.storeName && (
                  <span className={styles.storeLabel}>{suggestion.storeName}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {typeConfig.fields.store && stores.length > 0 && (
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
  history: PropTypes.array,
  listType: PropTypes.string,
  onAdd: PropTypes.func.isRequired,
};

