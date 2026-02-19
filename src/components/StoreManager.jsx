import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './StoreManager.module.css';

const PRESET_COLORS = [
  '#1565c0', '#6a1b9a', '#00838f', '#2e7d32', '#ef6c00',
  '#c62828', '#4527a0', '#00695c', '#ad1457', '#37474f',
  '#f9a825', '#4e342e', '#1b5e20', '#283593', '#bf360c',
  '#0277bd', '#558b2f', '#7b1fa2',
];

/**
 * Panel for managing stores: create, rename, delete, pick color, and reorder.
 */
export const StoreManager = ({
  stores,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAdd(trimmed, newColor);
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
  };

  const handleStartEdit = (store) => {
    setEditingId(store.id);
    setEditName(store.name);
    setEditColor(store.color);
  };

  const handleSaveEdit = (id) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    onUpdate(id, { name: trimmed, color: editColor });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const reordered = [...stores];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    onReorder(reordered);
  };

  const handleMoveDown = (index) => {
    if (index === stores.length - 1) return;
    const reordered = [...stores];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    onReorder(reordered);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.toggle}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className={styles.toggleIcon}>{isOpen ? '−' : '+'}</span>
        Manage Stores
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Your Stores ({stores.length})
            </h4>

            {stores.length === 0 && (
              <p className={styles.emptyHint}>
                No stores yet. Add a store to organize items by where you shop.
              </p>
            )}

            <div className={styles.storeList}>
              {stores.map((store, index) => (
                <div key={store.id} className={styles.storeItem}>
                  {editingId === store.id ? (
                    <div className={styles.editForm}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={styles.input}
                        placeholder="Store name"
                      />
                      <div className={styles.colorPicker}>
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            className={`${styles.colorSwatch} ${editColor === c ? styles.colorSelected : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setEditColor(c)}
                            aria-label={`Color ${c}`}
                          />
                        ))}
                      </div>
                      <div className={styles.editActions}>
                        <button
                          type="button"
                          className={styles.saveBtn}
                          onClick={() => handleSaveEdit(store.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.storeItemRow}>
                      <span
                        className={styles.storeBadge}
                        style={{ backgroundColor: store.color }}
                      >
                        {store.name}
                      </span>
                      <div className={styles.itemActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          aria-label="Move up"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => handleMoveDown(index)}
                          disabled={index === stores.length - 1}
                          aria-label="Move down"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => handleStartEdit(store)}
                          aria-label="Edit"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.deleteIcon}`}
                          onClick={() => onDelete(store.id)}
                          aria-label={`Delete ${store.name}`}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form className={styles.addForm} onSubmit={handleCreate}>
            <h4 className={styles.sectionTitle}>Add New Store</h4>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={styles.input}
              placeholder="Store name (e.g. Walmart, Costco)"
            />
            <div className={styles.colorPicker}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorSwatch} ${newColor === c ? styles.colorSelected : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
            <button type="submit" className={styles.addBtn} disabled={!newName.trim()}>
              Add Store
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

StoreManager.propTypes = {
  stores: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  onAdd: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onReorder: PropTypes.func.isRequired,
};
