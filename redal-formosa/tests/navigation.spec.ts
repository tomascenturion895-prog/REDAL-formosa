import { test, expect } from '@playwright/test';

test.describe('Navegación general y Homepage', () => {
  test('la homepage debe cargar con el hero y título principal', async ({ page }) => {
    await page.goto('/');

    // El título real del hero es "Red de Abastecimiento Local de Formosa"
    await expect(page.locator('h1')).toContainText('Red de Abastecimiento Local de Formosa');
  });

  test('debe poder navegar desde el home al mapa', async ({ page }) => {
    await page.goto('/');

    await page.goto('/mapa');
    await expect(page.locator('h1')).toContainText('Mapa de emprendimientos');
  });

  test('debe poder navegar desde el home a emprendimientos', async ({ page }) => {
    await page.goto('/');

    await page.goto('/emprendimientos');
    await expect(page.locator('h1')).toContainText('Emprendimientos');
  });

  test('debe poder navegar desde el home al carrito', async ({ page }) => {
    await page.goto('/');

    await page.goto('/carrito');
    await expect(page.getByText('Tu carrito está vacío')).toBeVisible();
  });
});
