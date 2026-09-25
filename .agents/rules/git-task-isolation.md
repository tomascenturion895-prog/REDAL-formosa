# Regla de Trabajo Git: Aislamiento Estricto por Tarea

Para todas las tareas asignadas en este proyecto (Hackathon REDAL Formosa):

1. **Aislamiento de Rama (Feature Branch)**:
   - Toda nueva tarea debe desarrollarse en una rama dedicada basada en la última versión de `origin/main` (ejemplo: `feature/devX-nombre-tarea`).

2. **Stage y Commit Exclusivo por Tarea**:
   - Solo se debe hacer `git add` y `git commit` sobre los archivos directamente asignados a la tarea (componentes, utilidades o vistas específicas).
   - **NO** modificar ni incluir cambios accidentales en archivos compartidos (`src/app/page.tsx`, `src/app/layout.tsx`, `src/lib/supabase/*`, etc.) salvo que la tarea lo requiera explícitamente.

3. **Prevención de Conflictos (Clean Pull Requests)**:
   - Al finalizar la tarea, verificar con `git status` que el commit contenga **únicamente** los entregables del rol assigned, garantizando que el Pull Request hacia `main` no sobrescriba el código de otros desarrolladores del equipo.
