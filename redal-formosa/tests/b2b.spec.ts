import { test, expect } from '@playwright/test';

test.describe('Compras mayoristas', () => {
  test('la página presenta el canal y pide ingresar para solicitar cotización', async ({ page }) => {
    await page.goto('/b2b');

    await expect(page.getByRole('heading', { level: 1, name: /Comprá por volumen/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Directo de la chacra' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pedí tu cotización' })).toBeVisible();

    // Sin sesión no se muestra el formulario: se invita a ingresar y se vuelve a /b2b.
    const login = page.getByRole('link', { name: 'Ingresar' }).last();
    await expect(login).toHaveAttribute('href', '/login?next=%2Fb2b');
  });
});
