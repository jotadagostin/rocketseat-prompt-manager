import { expect, test, type Page } from '@playwright/test';

test('deve carregar a página inicial', async ({ page }: { page: Page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Select a prompt' })
  ).toBeVisible();
  await expect(
    page.getByText('Choose a prompt of the list to view and edit')
  ).toBeVisible();
});
