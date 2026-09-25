import { test, expect } from '@playwright/test';

test.describe('Carrito de compras', () => {
  test('debe mostrar el carrito vacío con mensaje y enlace a productos', async ({ page }) => {
    await page.goto('/carrito');

    // El carrito vacío muestra "Tu carrito está vacío"
    await expect(page.getByText('Tu carrito está vacío')).toBeVisible();

    // Debe existir un enlace/botón para ir a ver productos
    const verProductosLink = page.getByRole('link', { name: 'Ver productos' });
    await expect(verProductosLink).toBeVisible();
  });

  test('el enlace "Ver productos" del carrito vacío debe llevar a /productos', async ({ page }) => {
    await page.goto('/carrito');

    const verProductosLink = page.getByRole('link', { name: 'Ver productos' });
    await verProductosLink.click();

    // Debe navegar a la página de productos
    await expect(page).toHaveURL(/\/productos/);
  });
});
