/**
 * Recipe collections E2E tests for desktop-chrome project.
 * Tests collection and recipe CRUD on the unified recipes accordion view
 * (collections expand in place; recipes are created via per-collection
 * "Add recipe to X" buttons and a New Recipe modal).
 */
import { test, expect } from '@playwright/test';

const COLLECTION_NAME = `E2E Test Collection ${Date.now()}`;
const RECIPE_NAME = `E2E Test Recipe ${Date.now()}`;

test.describe.serial('Recipe collections', () => {
  let page;

  test.skip(({ isMobile }) => isMobile, 'Desktop recipes accordion flow');

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/app');
    await expect(page.getByRole('heading', { name: 'Lists', exact: true })).toBeVisible({ timeout: 10000 });
  });

  test.afterAll(async () => {
    // Cleanup: try to delete test data if still exists
    try {
      const collectionOptions = page.getByRole('button', { name: `Options for ${COLLECTION_NAME}` });
      if (await collectionOptions.isVisible({ timeout: 1000 })) {
        await collectionOptions.click();
        const deleteBtn = page.getByRole('button', { name: 'Delete' });
        if (await deleteBtn.isVisible({ timeout: 1000 })) {
          await deleteBtn.click();
          const deleteConfirm = page.locator('button').filter({ hasText: /Delete/ }).last();
          if (await deleteConfirm.isVisible({ timeout: 1000 })) {
            await deleteConfirm.click();
          }
        }
      }
    } catch {
      // Swallow errors during cleanup
    }
    await page?.close();
  });

  test('navigates to Recipes tab and sees the recipes view', async () => {
    const recipesTab = page.locator('button').filter({ hasText: 'Recipes' }).first();
    await expect(recipesTab).toBeVisible();
    await recipesTab.click();

    // The unified recipes view always shows the built-in My Recipes collection
    await expect(page.getByRole('button', { name: 'Add recipe to My Recipes' })).toBeVisible({ timeout: 5000 });
  });

  test('creates a new collection', async () => {
    // "+ Add" opens a menu with New Recipe / New Collection
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('button', { name: 'New Collection' }).click();

    await page.getByPlaceholder('Collection name...').fill(COLLECTION_NAME);
    await page.getByRole('button', { name: 'Create' }).click();

    // The new collection appears as an accordion section
    await expect(page.getByRole('button', { name: `Add recipe to ${COLLECTION_NAME}` })).toBeVisible({ timeout: 5000 });
  });

  test('creates a recipe in the collection', async () => {
    await page.getByRole('button', { name: `Add recipe to ${COLLECTION_NAME}` }).click();

    // New Recipe modal: choose manual entry
    await page.getByRole('button', { name: /Start from scratch/ }).click();

    const recipeNameInput = page.getByPlaceholder('Recipe name');
    await expect(recipeNameInput).toBeVisible({ timeout: 5000 });
    await recipeNameInput.fill(RECIPE_NAME);

    // At least one named ingredient is required to save
    await page.getByPlaceholder('Ingredient name').first().fill('Flour');
    await page.getByPlaceholder('Qty').first().fill('2 cups');

    await page.getByRole('button', { name: 'Save' }).click();

    // The recipe appears in the collection's accordion section
    await expect(page.getByRole('button', { name: `Options for ${RECIPE_NAME}` })).toBeVisible({ timeout: 5000 });
  });

  test('verifies recipe appears with ingredient count', async () => {
    // Recipe rows show "X ingredients · Y steps" metadata; scope to this
    // recipe's row so other recipes with one ingredient don't collide
    const recipeRow = page.locator('button').filter({ hasText: RECIPE_NAME }).first();
    await expect(recipeRow).toContainText('1 ingredients');
  });

  test('deletes the test recipe', async () => {
    await page.getByRole('button', { name: `Options for ${RECIPE_NAME}` }).click();

    // Options menu: Edit / Move to Collection / Delete
    await page.getByRole('button', { name: 'Delete' }).click();

    // ConfirmDialog renders via portal to document.body
    const dialogMessage = page.getByText(`Delete "${RECIPE_NAME}" and all its contents?`);
    await expect(dialogMessage).toBeVisible({ timeout: 5000 });

    const confirmBtn = page.locator('[class*="confirmBtn"]');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    await expect(dialogMessage).not.toBeVisible({ timeout: 5000 });

    await expect(page.getByRole('button', { name: `Options for ${RECIPE_NAME}` })).not.toBeVisible({ timeout: 5000 });
  });

  test('deletes the test collection', async () => {
    await page.getByRole('button', { name: `Options for ${COLLECTION_NAME}` }).click();

    // Options menu: Rename / Share / Delete
    await page.getByRole('button', { name: 'Delete' }).click();

    // DeleteCollectionDialog opens via portal; for an empty collection it is a
    // simple confirmation with a delete button
    const dialogTitle = page.getByRole('heading', { name: /Delete.*Test Collection/i });
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });

    const deleteBtn = page.locator('[class*="deleteBtn"]');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();
    await expect(dialogTitle).not.toBeVisible({ timeout: 5000 });

    await expect(page.getByRole('button', { name: `Add recipe to ${COLLECTION_NAME}` })).not.toBeVisible({ timeout: 5000 });
  });
});
