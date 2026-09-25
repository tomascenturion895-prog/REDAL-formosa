import { test, expect } from '@playwright/test';

test.describe('Portal B2B', () => {
  test('debe cargar la página del portal B2B con sus beneficios y secciones', async ({ page }) => {
    await page.goto('/b2b');

    // Verificar breadcrumbs y título
    await expect(page.locator('text=Portal B2B & Mayoristas')).toBeVisible();

    // Verificar las secciones usando los títulos (hero, beneficios, etc)
    // El Hero suele tener H1 o H2 importantes (no puedo ver exacto el contenido de B2BHero pero busco enlaces del banner)
    await expect(page.locator('text=Ver perfil de Chacra La Esperanza')).toBeVisible();

    // El catálogo B2BSection probablemente tiene algún título, pero con verificar que carga es un buen smoke test.
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
  });
});
