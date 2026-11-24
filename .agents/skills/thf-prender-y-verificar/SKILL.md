---
name: thf-prender-y-verificar
description: >-
  Enciende, reinicia y verifica el stack completo de The House Fit en Windows
  (CRUD Go en :3000 con PostgreSQL, MID Go en :8080 y cliente Angular en :4200).
  Úsalo cuando el usuario pida prender, arrancar, reiniciar, comprobar o verificar
  los servidores y endpoints locales del proyecto.
---

# Prender y Verificar — The House Fit

Este skill estandariza el arranque en orden correcto y la verificación integral de los 3 servicios locales del monorepo `proyecto_the_house_fit`.

## Rutas base del proyecto

Desde la raíz del repositorio (`proyecto_the_house_fit`):

- **CRUD (Go + Beego, puerto `3000`):** `thehousefit_crud`
- **MID (Go + Beego, puerto `8080`):** `thehousefit_mid`
- **Cliente Angular (puerto `4200`):** `THE_HOUSE_FIT`

---

## Parte 1: Prender todo el stack

> **Regla crítica en Windows:** Los servidores que el usuario va a abrir en su navegador o probar entre procesos **deben** lanzarse con `BypassSandbox: true` e `IsDaemon: true`.

1. **Revisar tareas activas primero** con `manage_task` (`Action: "list"`).
   - No dupliques servicios que ya estén corriendo en el mismo puerto; si necesitas reiniciar alguno, termínalo antes con `manage_task` (`Action: "kill"`).

2. **Recompilar binarios Go si hay cambios recientes en `.go` o si aún no existen los `.exe`:**
   - CRUD: `Set-Location "thehousefit_crud"; go build -o thehousefit_crud.exe .`
   - MID: `Set-Location "thehousefit_mid"; go build -o thehousefit_mid.exe .`

3. **Arrancar en orden estricto (CRUD → MID → Angular):**
   - **Paso A — CRUD (`:3000`, conecta a PostgreSQL `5432`):**
     ```powershell
     Set-Location "thehousefit_crud"; .\thehousefit_crud.exe
     ```
     - Verifica en el log que aparezca `Conectado a PostgreSQL` y `http server Running on http://127.0.0.1:3000`.
     - Si falla la conexión a PostgreSQL, revisa que exista `thehousefit_crud/conf/app.conf` (copiado desde `app.conf.example`) con `bd_host`, `bd_puerto`, `bd_nombre`, `bd_usuario` y `bd_clave`.
   - **Paso B — MID (`:8080`, requiere `THF_JWT_SECRET` >= 32 caracteres):**
     ```powershell
     Set-Location "thehousefit_mid"; $env:THF_JWT_SECRET="the_house_fit_jwt_secret_key_2026_super_segura"; .\thehousefit_mid.exe
     ```
     - Verifica en el log: `http server Running on http://127.0.0.1:8080`.
   - **Paso C — Frontend Angular (`:4200`):**
     ```powershell
     Set-Location "THE_HOUSE_FIT"; npx.cmd ng serve --host 0.0.0.0 --allowed-hosts
     ```
     - Espera (usando `schedule`, nunca `sleep`) hasta que el log del task muestre `Application bundle generation complete` sin errores de compilación.

---

## Parte 2: Verificar que todo funcione

1. **Verificación rápida de endpoints en vivo:**
   Ejecuta el script [verificar-servicios.ps1](./scripts/verificar-servicios.ps1) con `BypassSandbox: true`:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File ".agents/skills/thf-prender-y-verificar/scripts/verificar-servicios.ps1"
   ```

   El script valida:
   - **CRUD (`3000`)**: `GET http://127.0.0.1:3000/gimnasios` -> HTTP `200`
   - **MID (`8080`)**: `GET http://127.0.0.1:8080/api/v1/gimnasios` -> HTTP `200`
   - **Angular (`4200`)**: `GET http://localhost:4200/` -> HTTP `200`
