import { test, expect } from '@playwright/test';

test.describe('Módulo de Checkout / Pagos', () => {
  test('debe mostrar mensaje de carrito vacío si se entra sin productos', async ({ page }) => {
    await page.goto('/checkout');
    
    await expect(page.getByText('No hay nada para pagar')).toBeVisible();
    await expect(page.locator('text=Agregá productos al carrito para armar tu pedido.')).toBeVisible();
    
    const productsLink = page.getByRole('link', { name: 'Ver productos' });
    await expect(productsLink).toBeVisible();
    await productsLink.click();
    
    await expect(page).toHaveURL(/.*\/productos/);
  });
});
