import { test, expect } from '@playwright/test';

test.describe('Catálogo de Emprendimientos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/emprendimientos');
  });

  test('debe cargar la página de emprendimientos', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Emprendimientos');
  });

  test('debe mostrar el buscador de emprendimientos', async ({ page }) => {
    const searchInput = page.locator('#emp-search');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Buscar por nombre o rubro');
  });

  test('debe permitir escribir en el buscador', async ({ page }) => {
    const searchInput = page.locator('#emp-search');
    await searchInput.fill('miel');
    await expect(searchInput).toHaveValue('miel');
  });
});
