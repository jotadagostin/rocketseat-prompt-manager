import test, { expect } from '@playwright/test';

test('creates a prompt through the UI', async ({ page }) => {
  const uniqueTitle = `E2E Prompt ${Date.now()}`;
  const content = 'Content generated via E2E';

  await page.goto('/new');
  await expect(page.getByPlaceholder('Title of the prompt')).toBeVisible();
  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('textarea[name="content"]', content);
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Prompt created successfully.')).toBeVisible({
    timeout: 15000,
  });
});
