import { useState } from 'react';
import PropTypes from 'prop-types';
import { RECIPE_TEMPLATES, parseRecipeText, recipeTemplateToItems } from '../services/recipes.js';
import styles from './RecipePanel.module.css';

/**
 * Panel for converting recipes into shopping list items.
 * Supports both preset recipe templates and custom recipe text input.
 */
export const RecipePanel = ({ onAddItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [recipeText, setRecipeText] = useState('');

  const handleTemplateClick = (template) => {
    const items = recipeTemplateToItems(template);
    onAddItems(items);
  };

  const handleParseRecipe = () => {
    const items = parseRecipeText(recipeText);
    if (items.length > 0) {
      onAddItems(items);
      setRecipeText('');
    }
  };

  if (!isOpen) {
    return (
      <button className={styles.openBtn} onClick={() => setIsOpen(true)}>
        Recipe to List
      </button>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recipe to Shopping List</h3>
        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
          Close
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'templates' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Quick Recipes
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'custom' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Paste Recipe
        </button>
      </div>

      {activeTab === 'templates' && (
        <div className={styles.templates}>
          {RECIPE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              className={styles.templateCard}
              onClick={() => handleTemplateClick(template)}
            >
              <span className={styles.templateName}>{template.name}</span>
              <span className={styles.templateDesc}>{template.description}</span>
              <span className={styles.templateCount}>
                {template.ingredients.length} items
              </span>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className={styles.custom}>
          <textarea
            className={styles.textarea}
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
            placeholder={`Paste your recipe ingredients here, one per line:\n\n2 cups flour\n3 eggs\n1 cup milk\n1/2 cup sugar\n1 tsp vanilla extract`}
            rows={8}
          />
          <button
            className={styles.parseBtn}
            onClick={handleParseRecipe}
            disabled={!recipeText.trim()}
          >
            Add to List
          </button>
        </div>
      )}
    </div>
  );
};

RecipePanel.propTypes = {
  onAddItems: PropTypes.func.isRequired,
};
