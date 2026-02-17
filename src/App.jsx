import { useShoppingList } from './hooks/useShoppingList.js';
import { getSuggestions } from './services/suggestions.js';
import { ListSelector } from './components/ListSelector.jsx';
import { AddItemForm } from './components/AddItemForm.jsx';
import { ShoppingList } from './components/ShoppingList.jsx';
import { Suggestions } from './components/Suggestions.jsx';
import { RecipePanel } from './components/RecipePanel.jsx';
import styles from './App.module.css';

/**
 * Root application component.
 * Composes the list selector, item form, shopping list, suggestions, and recipe panel.
 */
export const App = () => {
  const { state, actions, activeList } = useShoppingList();

  const suggestions = getSuggestions(
    state.history,
    activeList?.items ?? [],
  );

  const handleAddItem = (name) => {
    if (!activeList) return;
    actions.addItem(activeList.id, name);
  };

  const handleAddItems = (items) => {
    if (!activeList) return;
    actions.addItems(activeList.id, items);
  };

  const handleToggleItem = (itemId) => {
    if (!activeList) return;
    actions.toggleItem(activeList.id, itemId);
  };

  const handleRemoveItem = (itemId) => {
    if (!activeList) return;
    actions.removeItem(activeList.id, itemId);
  };

  const handleClearChecked = () => {
    if (!activeList) return;
    actions.clearChecked(activeList.id);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>ShoppingList<span className={styles.ai}>AI</span></h1>
        <p className={styles.tagline}>Smart grocery lists powered by AI</p>
      </header>

      <main className={styles.main}>
        <aside className={styles.sidebar}>
          <ListSelector
            lists={state.lists}
            activeListId={state.activeListId}
            onSelect={actions.selectList}
            onCreate={actions.createList}
            onDelete={actions.deleteList}
          />
        </aside>

        <section className={styles.content}>
          {activeList ? (
            <>
              <h2 className={styles.listTitle}>{activeList.name}</h2>
              <AddItemForm onAdd={handleAddItem} />
              <ShoppingList
                items={activeList.items}
                onToggle={handleToggleItem}
                onRemove={handleRemoveItem}
                onClearChecked={handleClearChecked}
              />
              <Suggestions suggestions={suggestions} onAdd={handleAddItem} />
              <RecipePanel onAddItems={handleAddItems} />
            </>
          ) : (
            <div className={styles.noList}>
              <h2>Welcome to ShoppingListAI</h2>
              <p>Create a new list to get started.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
