import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/LeafInk/);
});

test('has setup verification heading', async ({ page }) => {
  await page.goto('/');

  // Expect the heading to contain "Setup Verification"
  await expect(page.getByRole('heading', { name: 'Setup Verification' })).toBeVisible();
});
