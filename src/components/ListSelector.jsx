import { useState } from 'react';
import PropTypes from 'prop-types';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import styles from './ListSelector.module.css';

/**
 * Sidebar/dropdown for managing multiple shopping lists.
 * Shows all lists, allows creating new ones, renaming, and switching between them.
 */
export const ListSelector = ({ lists, activeListId, onSelect, onCreate, onRename, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewName('');
    setIsCreating(false);
  };

  const handleStartEdit = (list) => {
    setEditingId(list.id);
    setEditName(list.name);
  };

  const handleSaveEdit = (id) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    onRename(id, trimmed);
    setEditingId(null);
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') handleSaveEdit(id);
    if (e.key === 'Escape') setEditingId(null);
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
            {editingId === list.id ? (
              <div className={styles.editRow}>
                <input
                  className={styles.editInput}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => handleEditKeyDown(e, list.id)}
                  onBlur={() => handleSaveEdit(list.id)}
                  autoFocus
                />
              </div>
            ) : (
              <>
                <button
                  className={styles.listBtn}
                  onClick={() => onSelect(list.id)}
                  onDoubleClick={() => handleStartEdit(list)}
                >
                  <span className={styles.listName}>{list.name}</span>
                  <span className={styles.listCount}>{list.items?.length ?? 0} items</span>
                </button>
                <button
                  className={styles.editBtn}
                  onClick={() => handleStartEdit(list)}
                  aria-label={`Rename ${list.name}`}
                  title="Rename"
                >
                  ✎
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
              </>
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
  onRename: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
