import { useState } from 'react';
import PropTypes from 'prop-types';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/categories.js';
import styles from './CategoryManager.module.css';

const PRESET_COLORS = [
  '#4caf50', '#2196f3', '#e53935', '#ff9800', '#00bcd4',
  '#795548', '#9c27b0', '#ffc107', '#ff5722', '#607d8b',
  '#e91e63', '#3f51b5', '#009688', '#8bc34a', '#ff7043',
  '#5c6bc0', '#26a69a', '#d4e157',
];

const BUILT_IN_KEYS = Object.values(CATEGORIES);

/**
 * Panel for managing custom categories: create, rename, delete, pick color, and edit keywords.
 */
export const CategoryManager = ({
  customCategories,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newKeywords, setNewKeywords] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editKeywords, setEditKeywords] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const keywords = newKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    onAdd(trimmed, newColor, keywords);
    setNewName('');
    setNewKeywords('');
    setNewColor(PRESET_COLORS[0]);
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditKeywords(cat.keywords.join(', '));
  };

  const handleSaveEdit = (id) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    const keywords = editKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    onUpdate(id, { name: trimmed, color: editColor, keywords });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const reordered = [...customCategories];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    onReorder(reordered);
  };

  const handleMoveDown = (index) => {
    if (index === customCategories.length - 1) return;
    const reordered = [...customCategories];
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
        Manage Categories
      </button>

      {isOpen && (
        <div className={styles.panel}>
          {/* Built-in categories (read-only display) */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Built-in Categories</h4>
            <div className={styles.builtInGrid}>
              {BUILT_IN_KEYS.map((key) => (
                <span
                  key={key}
                  className={styles.builtInBadge}
                  style={{ backgroundColor: CATEGORY_COLORS[key] }}
                >
                  {CATEGORY_LABELS[key]}
                </span>
              ))}
            </div>
          </div>

          {/* Custom categories */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Custom Categories ({customCategories.length})
            </h4>

            {customCategories.length === 0 && (
              <p className={styles.emptyHint}>No custom categories yet.</p>
            )}

            <div className={styles.customList}>
              {customCategories.map((cat, index) => (
                <div key={cat.id} className={styles.customItem}>
                  {editingId === cat.id ? (
                    <div className={styles.editForm}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={styles.input}
                        placeholder="Category name"
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
                      <input
                        type="text"
                        value={editKeywords}
                        onChange={(e) => setEditKeywords(e.target.value)}
                        className={styles.input}
                        placeholder="Keywords (comma-separated)"
                      />
                      <div className={styles.editActions}>
                        <button
                          type="button"
                          className={styles.saveBtn}
                          onClick={() => handleSaveEdit(cat.id)}
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
                    <div className={styles.customItemRow}>
                      <span
                        className={styles.customBadge}
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.name}
                      </span>
                      <span className={styles.keywordPreview}>
                        {cat.keywords.length > 0
                          ? cat.keywords.slice(0, 3).join(', ') +
                            (cat.keywords.length > 3 ? ` +${cat.keywords.length - 3}` : '')
                          : 'No keywords'}
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
                          disabled={index === customCategories.length - 1}
                          aria-label="Move down"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => handleStartEdit(cat)}
                          aria-label="Edit"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.deleteIcon}`}
                          onClick={() => onDelete(cat.id)}
                          aria-label={`Delete ${cat.name}`}
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

          {/* Add new category form */}
          <form className={styles.addForm} onSubmit={handleCreate}>
            <h4 className={styles.sectionTitle}>Add New Category</h4>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={styles.input}
              placeholder="Category name"
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
            <input
              type="text"
              value={newKeywords}
              onChange={(e) => setNewKeywords(e.target.value)}
              className={styles.input}
              placeholder="Keywords (comma-separated, e.g. tofu, tempeh)"
            />
            <button type="submit" className={styles.addBtn} disabled={!newName.trim()}>
              Add Category
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

CategoryManager.propTypes = {
  customCategories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  onAdd: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onReorder: PropTypes.func.isRequired,
};
