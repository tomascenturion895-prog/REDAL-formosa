# REDAL - Paso 1: Inicialización del Proyecto y Configuración del Stack

**Proyecto:** REDAL (Red de Emprendimientos y Desarrollo de Abastecimiento Local)  
**Ubicación:** Provincia de Formosa, Argentina  
**Objetivo:** Configurar la base funcional del proyecto con el stack tecnológico acordado para Next.js (App Router), Tailwind CSS, Supabase, Leaflet y PWA.

---

## 1. Comando de Creación del Proyecto Next.js

Ejecutar en la terminal para crear la estructura base del proyecto con TypeScript, Tailwind CSS, App Router y directorio `src/`:

```bash
npx create-next-app@latest redal-formosa \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm