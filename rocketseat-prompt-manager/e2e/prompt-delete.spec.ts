import { PrismaClient } from '@/generated/prisma/client';
import { test, expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';

test.describe('Delecao de prompt via UI(sucesso)', () => {
  test('Sucesso', async ({ page }) => {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    const prisma = new PrismaClient({ adapter });

    const uniqueTitle = `E2E Deletable Prompt ${Date.now()}`;
    const content = 'content';
    await prisma.prompt.create({
      data: {
        title: uniqueTitle,
        content,
      },
    });
    await prisma.$disconnect();

    await page.goto('/');
    const list = page.getByRole('list');
    await expect(list).toBeVisible();

    const heading = page.getByRole('heading', { name: uniqueTitle });
    await expect(heading).toBeVisible({ timeout: 15000 });
    const promptItem = page
      .getByRole('listitem')
      .filter({ hasText: uniqueTitle });
    await expect(promptItem).toBeVisible();

    await promptItem.getByRole('button', { name: 'Remove Prompt' }).click();

    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Prompt deleted successfully.')).toBeVisible();
    await expect(page.getByRole('heading', { name: uniqueTitle })).toHaveCount(
      0
    );
  });
});
