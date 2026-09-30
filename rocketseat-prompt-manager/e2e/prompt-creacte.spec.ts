import { PrismaClient } from '@/generated/prisma/client';
import test, { expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

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

test('Duplicate title validation', async ({ page }) => {
  const duplicateTitle = 'E2E Duplicate Prompt';
  const content = 'Content';

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  await prisma.prompt.deleteMany({ where: { title: duplicateTitle, content } });

  await prisma.$disconnect();

  await page.goto('new');
  await expect(page.getByPlaceholder('Title of the prompt')).toBeVisible();
  await page.fill('input[name="title"]', duplicateTitle);
  await page.fill('textarea[name="content"]', content);
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Prompt created successfully.')).toBeVisible({
    timeout: 15000,
  });

  await expect(page.getByRole('heading', { name: duplicateTitle })).toHaveCount(
    1
  );
});
