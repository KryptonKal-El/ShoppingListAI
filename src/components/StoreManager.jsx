import { useState } from 'react';
import PropTypes from 'prop-types';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import styles from './StoreManager.module.css';

const PRESET_COLORS = [
  '#1565c0', '#6a1b9a', '#00838f', '#2e7d32', '#ef6c00',
  '#c62828', '#4527a0', '#00695c', '#ad1457', '#37474f',
  '#f9a825', '#4e342e', '#1b5e20', '#283593', '#bf360c',
  '#0277bd', '#558b2f', '#7b1fa2',
];

/**
 * Inline aisle manager for a single store.
 * Allows adding, renaming, deleting, and reordering aisles.
 */
const AisleEditor = ({ aisles, onSave }) => {
  const [localAisles, setLocalAisles] = useState(aisles);
  const [newAisle, setNewAisle] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValue, setEditValue] = useState('');
  const [confirmingDeleteIndex, setConfirmingDeleteIndex] = useState(-1);

  const isDirty = JSON.stringify(localAisles) !== JSON.stringify(aisles);

  const handleAdd = () => {
    const trimmed = newAisle.trim();
    if (!trimmed) return;
    if (localAisles.some((a) => a.toLowerCase() === trimmed.toLowerCase())) return;
    setLocalAisles([...localAisles, trimmed]);
    setNewAisle('');
  };

  const handleAddKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleDelete = (index) => {
    setLocalAisles(localAisles.filter((_, i) => i !== index));
    setConfirmingDeleteIndex(-1);
  };

  const handleStartRename = (index) => {
    setEditingIndex(index);
    setEditValue(localAisles[index]);
  };

  const handleSaveRename = () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditingIndex(-1);
      return;
    }
    const updated = [...localAisles];
    updated[editingIndex] = trimmed;
    setLocalAisles(updated);
    setEditingIndex(-1);
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveRename();
    if (e.key === 'Escape') setEditingIndex(-1);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const reordered = [...localAisles];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    setLocalAisles(reordered);
  };

  const handleMoveDown = (index) => {
    if (index === localAisles.length - 1) return;
    const reordered = [...localAisles];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    setLocalAisles(reordered);
  };

  const handleSaveAll = () => {
    onSave(localAisles);
  };

  return (
    <div className={styles.aisleEditor}>
      <h5 className={styles.aisleTitle}>Aisles ({localAisles.length})</h5>

      {localAisles.length === 0 && (
        <p className={styles.aisleEmpty}>No aisles yet.</p>
      )}

      <div className={styles.aisleList}>
        {localAisles.map((aisle, index) => (
          <div key={`${aisle}-${index}`} className={styles.aisleRow}>
            {editingIndex === index ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                onBlur={handleSaveRename}
                className={styles.aisleRenameInput}
                autoFocus
              />
            ) : (
              <span
                className={styles.aisleName}
                onDoubleClick={() => handleStartRename(index)}
              >
                {aisle}
              </span>
            )}
            <div className={styles.aisleActions}>
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
                disabled={index === localAisles.length - 1}
                aria-label="Move down"
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => handleStartRename(index)}
                aria-label="Rename"
                title="Rename"
              >
                ✎
              </button>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.deleteIcon}`}
                onClick={() => setConfirmingDeleteIndex(index)}
                aria-label={`Delete ${aisle}`}
                title="Delete"
              >
                ×
              </button>
              {confirmingDeleteIndex === index && (
                <ConfirmDialog
                  message={`Delete aisle "${aisle}"?`}
                  onConfirm={() => handleDelete(index)}
                  onCancel={() => setConfirmingDeleteIndex(-1)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.aisleAddRow}>
        <input
          type="text"
          value={newAisle}
          onChange={(e) => setNewAisle(e.target.value)}
          onKeyDown={handleAddKeyDown}
          className={styles.aisleAddInput}
          placeholder="New aisle name..."
        />
        <button
          type="button"
          className={styles.aisleAddBtn}
          onClick={handleAdd}
          disabled={!newAisle.trim()}
        >
          Add
        </button>
      </div>

      {isDirty && (
        <button
          type="button"
          className={styles.aisleSaveBtn}
          onClick={handleSaveAll}
        >
          Save Aisles
        </button>
      )}
    </div>
  );
};

/**
 * Panel for managing stores: create, rename, delete, pick color, reorder,
 * and manage aisles per store.
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
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [aisleExpandedId, setAisleExpandedId] = useState(null);

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

  const handleSaveAisles = (storeId, aisles) => {
    onUpdate(storeId, { aisles });
  };

  const toggleAisleExpanded = (storeId) => {
    setAisleExpandedId((prev) => (prev === storeId ? null : storeId));
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
                    <>
                      <div className={styles.storeItemRow}>
                        <span
                          className={styles.storeBadge}
                          style={{ backgroundColor: store.color }}
                        >
                          {store.name}
                        </span>
                        <span className={styles.aisleCount}>
                          {store.aisles?.length ?? 0} aisles
                        </span>
                        <div className={styles.itemActions}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => toggleAisleExpanded(store.id)}
                            aria-label="Manage aisles"
                            title="Manage aisles"
                          >
                            {aisleExpandedId === store.id ? '▾' : '▸'}
                          </button>
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
                            onClick={() => setConfirmingDeleteId(store.id)}
                            aria-label={`Delete ${store.name}`}
                            title="Delete"
                          >
                            ×
                          </button>
                          {confirmingDeleteId === store.id && (
                            <ConfirmDialog
                              message={`Delete store "${store.name}"?`}
                              onConfirm={() => {
                                onDelete(store.id);
                                setConfirmingDeleteId(null);
                              }}
                              onCancel={() => setConfirmingDeleteId(null)}
                            />
                          )}
                        </div>
                      </div>
                      {aisleExpandedId === store.id && (
                        <AisleEditor
                          aisles={store.aisles ?? []}
                          onSave={(aisles) => handleSaveAisles(store.id, aisles)}
                        />
                      )}
                    </>
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
      aisles: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  onAdd: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onReorder: PropTypes.func.isRequired,
};
