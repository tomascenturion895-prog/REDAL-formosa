import { test, expect } from '@playwright/test';

test.describe('Rutas Protegidas (Dashboard y Tracking)', () => {
  test('debe redirigir al login si se intenta acceder al dashboard sin autenticación', async ({ page }) => {
    await page.goto('/dashboard');
    // useRequireAuth hook redirects to /login?next=/dashboard
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('debe redirigir al login si se intenta acceder a tracking sin autenticación', async ({ page }) => {
    await page.goto('/tracking');
    // useRequireAuth hook redirects to /login?next=/tracking
    await expect(page).toHaveURL(/.*\/login/);
  });
});
