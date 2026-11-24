# Guía de trabajo en equipo (4 personas con Antigravity + GitHub)

Este repositorio unifica todo **The House Fit** (`THE_HOUSE_FIT`, `thehousefit_mid`, `thehousefit_crud`, `thehousefit_db` y las reglas compartidas de **Antigravity** en `AGENTS.md` y `.agents/`) para que los 4 integrantes puedan trabajar desde computadores independientes sin romper el proyecto.

---

## 1. Configuración inicial (solo la primera vez en cada PC)

1. **Instalar herramientas base:**
   - Git
   - Node.js 22+ (o 24)
   - Go 1.24+
   - PostgreSQL + pgAdmin
   - Antigravity

2. **Clonar el repositorio y abrir la carpeta correcta:**
   ```powershell
   git clone https://github.com/cristianlozano5286-beep/proyecto_the_house_fit.git
   cd proyecto_the_house_fit
   ```
   > **Importante:** En **Antigravity**, cada persona debe abrir la carpeta raíz `proyecto_the_house_fit` para que cargue automáticamente `AGENTS.md` y `.agents/`.

3. **Configurar la base de datos PostgreSQL:**
   - Crea la base de datos en PostgreSQL (`db_thehousefit` o el nombre que uses en `bd_nombre`).
   - Ejecuta los scripts de `thehousefit_db/` en orden numérico:
     `01_esquema.sql` → `02_datos_ejemplo.sql` → `03_crud.sql` → `05_permisos_y_reservas.sql` → `06_foto_perfil.sql` → `07_membresias_contabilidad.sql`.

4. **Crear archivos locales de configuración (no se suben a Git):**
   - Copia `thehousefit_crud/conf/app.conf.example` como `thehousefit_crud/conf/app.conf` y ajusta `bd_nombre`, `bd_usuario` y `bd_clave`.
   - Copia `thehousefit_mid/conf/app.conf.example` como `thehousefit_mid/conf/app.conf`.

5. **Instalar dependencias:**
   ```powershell
   cd THE_HOUSE_FIT && npm ci
   cd ../thehousefit_crud && go mod download
   cd ../thehousefit_mid && go mod download
   ```

---

## 2. Flujo diario de trabajo (cada uno en su PC)

1. **Ir a tu rama y traer lo último de `develop`:**
   ```powershell
   git checkout feature_TuApellido
   git pull origin develop
   ```
   Ramas del equipo:
   - `feature_Gaitan`
   - `feature_Gomez`
   - `feature_Lozano`
   - `feature_Saurez`

2. **Trabajar con Antigravity:**
   - Pídele los cambios de tu módulo (por ejemplo: *"En mi rama feature_Gomez implementa..."*).
   - Si necesitan correr el proyecto local, simplemente pídele a Antigravity: *"prende todo y verifica"*.

3. **Verificar que todo compila antes de subir cambios:**
   ```powershell
   cd THE_HOUSE_FIT && npx ng build
   cd ../thehousefit_mid && go build ./...
   cd ../thehousefit_crud && go build ./...
   ```

4. **Hacer commit y push:**
   ```powershell
   git add .
   git commit -m "feat: descripcion clara del cambio"
   git push origin feature_TuApellido
   ```

5. **Abrir Pull Request (PR) en GitHub:**
   - Entra a GitHub → **Pull requests** → **New pull request**.
   - Base: `develop` ← Compare: `feature_TuApellido`.
   - Espera a que **GitHub Actions** marque en verde los 3 checks (`Build Angular`, `Build Go MID`, `Build Go CRUD`).
   - Si algún check sale en rojo, corrígelo en tu rama y haz `git push` de nuevo (el PR se actualiza solo).

---

## 3. Activar protección de ramas en GitHub (recomendado, 1 sola vez)

Para que **nadie** pueda subir código que rompa la compilación a `main` o `develop`:

1. En GitHub ve a **Settings** → **Branches** → **Add branch ruleset** (o **Add classic branch protection rule**).
2. Aplica la regla para `main` y `develop`:
   - Activa **Require a pull request before merging**.
   - Activa **Require status checks to pass before merging** y selecciona:
     - `Build Angular`
     - `Build Go MID`
     - `Build Go CRUD`
   - Activa **Do not allow bypassing the above settings**.
