/**
 * Cook mode E2E tests for desktop-chrome project.
 * Creates a scratch collection + recipe (1 ingredient, 2 steps), cooks it
 * through the guided cooking mode (gather ingredients, step through, close
 * mid-cook, resume, finish), verifies the Cook History section appears, then
 * deletes the scratch data (cook sessions cascade with the recipe).
 */
import { test, expect } from '@playwright/test';

const COLLECTION_NAME = `E2E Cook Collection ${Date.now()}`;
const RECIPE_NAME = `E2E Cook Recipe ${Date.now()}`;

test.describe.serial('Cook mode', () => {
  let page;

  test.skip(({ isMobile }) => isMobile, 'Desktop recipes grid flow');

  const collectionChip = () =>
    page.locator('[class*="_chip_"]').filter({ hasText: COLLECTION_NAME }).first();

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/app');
    await expect(page.getByRole('heading', { name: 'Lists', exact: true })).toBeVisible({ timeout: 10000 });
  });

  test.afterAll(async () => {
    // Cleanup: try to delete test data if still exists
    try {
      const chip = collectionChip();
      if (await chip.isVisible({ timeout: 1000 })) {
        await chip.click();
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
      }
    } catch {
      // Swallow errors during cleanup
    }
    await page?.close();
  });

  test('creates a scratch recipe with ingredients and steps', async () => {
    const recipesTab = page.locator('button').filter({ hasText: 'Recipes' }).first();
    await recipesTab.click();
    await expect(page.locator('[class*="_chipActive_"]').filter({ hasText: 'All' })).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('button', { name: 'New Collection' }).click();
    await page.getByPlaceholder('Collection name...').fill(COLLECTION_NAME);
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(collectionChip()).toBeVisible({ timeout: 5000 });

    await collectionChip().click();
    await page.getByRole('button', { name: `Add recipe to ${COLLECTION_NAME}` }).click();
    await page.getByRole('button', { name: /Start from scratch/ }).click();

    const recipeNameInput = page.getByPlaceholder('Recipe name');
    await expect(recipeNameInput).toBeVisible({ timeout: 5000 });
    await recipeNameInput.fill(RECIPE_NAME);

    await page.getByPlaceholder('Ingredient name').first().fill('Rice');
    await page.getByPlaceholder('Qty').first().fill('1 cup');

    // Ensure two step rows exist, then fill both
    const stepInputs = page.getByPlaceholder('Step instruction');
    while ((await stepInputs.count()) < 2) {
      await page.getByRole('button', { name: '+ Add step' }).click();
    }
    await stepInputs.nth(0).fill('Rinse the rice.');
    await stepInputs.nth(1).fill('Boil until tender.');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('button', { name: `Options for ${RECIPE_NAME}` })).toBeVisible({ timeout: 5000 });
  });

  test('starts a cook and gathers ingredients', async () => {
    await page.locator('[class*="_recipeCard_"]').filter({ hasText: RECIPE_NAME }).first().click();

    const startBtn = page.getByRole('button', { name: /Start Cooking/ });
    await expect(startBtn).toBeVisible({ timeout: 5000 });
    await startBtn.click();

    // Cook mode opens with the ingredient gather phase. Scope queries to the
    // overlay — the recipe detail behind it shows the same ingredient names
    // and its own checkboxes.
    const overlay = page.locator('[class*="_overlay_"]');
    await expect(overlay.getByRole('heading', { name: 'Gather your ingredients' })).toBeVisible({ timeout: 5000 });
    await expect(overlay.getByText('Rice', { exact: true })).toBeVisible();

    await overlay.locator('input[type="checkbox"]').first().check();
    await overlay.getByRole('button', { name: /Begin Cooking/ }).click();

    await expect(overlay.getByText('Step 1 of 2')).toBeVisible({ timeout: 5000 });
    await expect(overlay.getByText('Rinse the rice.')).toBeVisible();
  });

  test('closes mid-cook and resumes on the same step', async () => {
    // Complete step 1 and advance to step 2, then close the cooking view
    const overlay = page.locator('[class*="_overlay_"]');
    await page.getByRole('button', { name: 'Next Step' }).click();
    await expect(overlay.getByText('Step 2 of 2')).toBeVisible();
    await page.getByRole('button', { name: 'Close cooking mode' }).click();

    // The detail now offers to continue instead of starting fresh
    const continueBtn = page.getByRole('button', { name: /Continue Cooking/ });
    await expect(continueBtn).toBeVisible({ timeout: 5000 });
    await continueBtn.click();

    // Resumes on the step we left off (ingredient phase is skipped)
    await expect(overlay.getByText('Step 2 of 2')).toBeVisible({ timeout: 5000 });
    await expect(overlay.getByText('Boil until tender.')).toBeVisible();
  });

  test('finishes the cook and sees it in Cook History', async () => {
    await page.getByRole('button', { name: 'All Steps Done' }).click();
    await expect(page.getByText('Nice cooking!')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Finish Cooking' }).click();

    // Back on the detail: fresh-start button restored, history section present
    await expect(page.getByRole('button', { name: /Start Cooking/ })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('COOK HISTORY (1)')).toBeVisible({ timeout: 5000 });
  });

  test('deletes the scratch recipe and collection', async () => {
    await page.getByRole('button', { name: `Options for ${RECIPE_NAME}` }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    const dialogMessage = page.getByText(`Delete "${RECIPE_NAME}" and all its contents?`);
    await expect(dialogMessage).toBeVisible({ timeout: 5000 });
    await page.locator('[class*="confirmBtn"]').click();
    await expect(page.getByRole('button', { name: `Options for ${RECIPE_NAME}` })).not.toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: `Options for ${COLLECTION_NAME}` }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    const dialogTitle = page.getByRole('heading', { name: /Delete.*Cook Collection/i });
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });
    await page.locator('[class*="deleteBtn"]').click();
    await expect(collectionChip()).not.toBeVisible({ timeout: 5000 });
  });
});
