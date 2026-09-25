import { test, expect } from '@playwright/test';

test('has title and page loads correctly', async ({ page }) => {
  // Go to the base URL (http://localhost:3000)
  await page.goto('/');

  // Expect a title "to contain" a substring. Next.js default is usually something like "Create Next App" or "REDAL"
  // If the title is different, we will update it. For now let's just make sure it loads.
  await expect(page).toHaveTitle(/REDAL|Next/i);
});
