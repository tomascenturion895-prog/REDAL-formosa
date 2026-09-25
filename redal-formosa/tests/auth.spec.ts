import { test, expect } from '@playwright/test';

test.describe('Módulo de Autenticación', () => {
  test('debe cargar la página de login con todos sus elementos', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText('Ingresar');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Registrarme' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Creá una' })).toBeVisible();
  });

  test('debe cargar la página de registro con todos sus elementos', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('h1')).toContainText('Crear cuenta');
    await expect(page.getByLabel('Nombre y apellido')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirmar contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ingresá' })).toBeVisible();
  });

  test('la navegación entre login y registro debe funcionar', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('link', { name: 'Creá una' }).click();
    await expect(page).toHaveURL(/.*\/register/);

    await page.getByRole('link', { name: 'Ingresá' }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('no-existe@redal.local');
    await page.getByLabel('Contraseña').fill('wrongpassword123');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Debe mostrar un alert de error
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
  });
});
