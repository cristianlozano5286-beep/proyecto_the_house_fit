# The House Fit — Reglas compartidas del equipo (Antigravity + GitHub)

Este repositorio es un **monorepo** con los 4 componentes de **The House Fit**:

- `THE_HOUSE_FIT/` — Frontend Angular (puerto `4200`, proxy `/api` -> MID `8080`).
- `thehousefit_mid/` — API MID en Go + Beego (puerto `8080`, JWT, roles, validaciones y reglas de negocio).
- `thehousefit_crud/` — API CRUD en Go + Beego (puerto `3000`, única capa conectada a PostgreSQL).
- `thehousefit_db/` — Scripts SQL de PostgreSQL en orden (`01_esquema.sql` ... `07_membresias_contabilidad.sql`).

## Flujo obligatorio de trabajo en Git (4 colaboradores)

1. **Nunca trabajes ni hagas `push` directo a `main`, `develop` ni `release`.**
2. Cada integrante trabaja en su propia rama (`feature_Gaitan`, `feature_Gomez`, `feature_Lozano`, `feature_Saurez` o ramas `feat/<modulo>` creadas desde `develop`).
3. Antes de empezar una tarea nueva, actualiza desde `develop`:
   `git pull origin develop`
4. Al terminar cambios, **verifica siempre la compilación local antes de hacer commit/push**:
   - Frontend Angular: `cd THE_HOUSE_FIT && npx ng build`
   - MID Go: `cd thehousefit_mid && go build ./...`
   - CRUD Go: `cd thehousefit_crud && go build ./...`
5. Sube tu rama (`git push origin <tu-rama>`) y abre un **Pull Request hacia `develop`**. Espera a que todos los checks de GitHub Actions (`CI`) pasen en verde antes de hacer merge.

## Reglas de archivos sensibles y limpieza

- **Nunca subas al repositorio**: `conf/app.conf`, `credentials/`, `token/`, `.env`, `node_modules/`, `dist/`, `*.exe`, `*.apk`, `*.bak`, `*.zip`.
- Si agregas nuevas variables de configuración en MID o CRUD, documéntalas en `conf/app.conf.example`.
- Todo cambio de tablas, columnas o funciones en PostgreSQL debe agregarse como un script nuevo numerado en `thehousefit_db/` (por ejemplo `08_...sql`), sin romper instalaciones existentes.
- En el frontend Angular, usa siempre rutas relativas `/api/v1` mediante `THE_HOUSE_FIT/src/app/config/api.ts` (no hardcodear `localhost` en componentes o servicios) para que funcione tanto en PC como en red local, túneles HTTPS y Capacitor.
