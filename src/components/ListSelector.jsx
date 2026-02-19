import { useState } from 'react';
import PropTypes from 'prop-types';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import styles from './ListSelector.module.css';

/**
 * Sidebar/dropdown for managing multiple shopping lists.
 * Shows all lists, allows creating new ones, and switching between them.
 */
export const ListSelector = ({ lists, activeListId, onSelect, onCreate, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewName('');
    setIsCreating(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Lists</h2>
        <button
          className={styles.newBtn}
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? 'Cancel' : '+ New'}
        </button>
      </div>

      {isCreating && (
        <form className={styles.createForm} onSubmit={handleCreate}>
          <input
            className={styles.createInput}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="List name..."
            autoFocus
          />
          <button className={styles.createBtn} type="submit" disabled={!newName.trim()}>
            Create
          </button>
        </form>
      )}

      <div className={styles.lists}>
        {lists.length === 0 && (
          <p className={styles.emptyMsg}>No lists yet. Create one to get started.</p>
        )}
        {lists.map((list) => (
          <div
            key={list.id}
            className={`${styles.listItem} ${list.id === activeListId ? styles.active : ''}`}
          >
            <button
              className={styles.listBtn}
              onClick={() => onSelect(list.id)}
            >
              <span className={styles.listName}>{list.name}</span>
              <span className={styles.listCount}>{list.items?.length ?? 0} items</span>
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => setConfirmingDeleteId(list.id)}
              aria-label={`Delete ${list.name}`}
            >
              x
            </button>
            {confirmingDeleteId === list.id && (
              <ConfirmDialog
                message={`Delete "${list.name}" and all its items?`}
                onConfirm={() => {
                  onDelete(list.id);
                  setConfirmingDeleteId(null);
                }}
                onCancel={() => setConfirmingDeleteId(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

ListSelector.propTypes = {
  lists: PropTypes.array.isRequired,
  activeListId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
