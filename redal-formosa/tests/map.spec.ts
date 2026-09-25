import { test, expect } from '@playwright/test';

test.describe('Módulo de Mapa', () => {
  test.beforeEach(async ({ page }) => {
    // Navegamos a la ruta del mapa antes de cada prueba
    await page.goto('/mapa');
  });

  test('debe cargar la página del mapa correctamente', async ({ page }) => {
    // Verificar que el título o encabezado principal esté visible
    await expect(page.locator('h1')).toContainText('Mapa de emprendimientos');
    
    // El componente EmprendimientosMap renderiza un div con role="application"
    // Leaflet se carga dinámicamente (lazy), por eso le damos más tiempo
    const mapContainer = page.getByRole('application', { name: 'Mapa de emprendimientos de Formosa' });
    await expect(mapContainer).toBeVisible({ timeout: 15000 });
  });

  test('debe contener un buscador de emprendimientos interactivo', async ({ page }) => {
    // Buscar el input de búsqueda específico del mapa (id="map-search")
    const searchInput = page.locator('#map-search');
    await expect(searchInput).toBeVisible();

    // Escribir un texto en el buscador
    await searchInput.fill('Prueba de busqueda');
    await expect(searchInput).toHaveValue('Prueba de busqueda');

    // Podemos validar si aparece el estado vacío o una lista de items, 
    // pero depende de los datos que vengan de Supabase.
    // Con comprobar que el input funciona está perfecto para E2E básico.
  });
});
