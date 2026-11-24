# thehousefit_mid

API MID de The House Fit (Go + Beego, puerto 8080). Valida, revisa el token y el rol, aplica las reglas
y le pide los datos al CRUD (3000). No tiene base de datos propia.

## Correr
Copia conf/app.conf.example a conf/app.conf si aún no tienes configuración local. Antes de iniciar el MID, define THF_JWT_SECRET con un secreto aleatorio de al menos 32 caracteres. Al cambiar el secreto, las sesiones anteriores deben iniciar sesión otra vez.

- En producción, activa enviar_correo y configura THF_GMAIL_CREDENTIALS y THF_GMAIL_TOKEN con rutas privadas fuera del proyecto. Si los archivos anteriores se compartieron, revoca el token y rota las credenciales de Gmail antes de emitir los reemplazos.
- Para una prueba en este equipo, usa runmode=dev, enviar_correo=false y codigos_en_consola=true. El MID escucha solo en 127.0.0.1 y el código se consulta en la consola del servidor.
- Aplica la migración 05_permisos_y_reservas.sql antes de iniciar esta versión del MID. Arranca PostgreSQL y el CRUD antes de ejecutar go run . en esta carpeta.

## Carpetas
- `controllers`: una función por ruta (`auth.go`, `gimnasios.go`, `clases.go`...). `base.go` tiene las funciones que se repiten.
- `models`: los datos, con los mismos nombres que usa el cliente.
- `services`: hablar con el CRUD (`crud_service.go`), el token (`jwt_service.go`) y Gmail (`gmail_service.go`).
- `routers`: las rutas.
- `templates`: el HTML del correo del código.

## Rutas (todas empiezan con /api/v1)
Sin sesión = público.

| Ruta | Quién | Qué hace |
| --- | --- | --- |
| POST /auth/registro | público | Crea la cuenta (rol Usuario) y manda un código de 6 dígitos al correo |
| POST /auth/codigo | público | Pide otro código (espera de 30 s entre uno y otro) |
| POST /auth/verificar | público | Revisa el código, marca el correo como verificado y devuelve el token |
| POST /auth/login | público | Correo y contraseña. Devuelve el token y `{nombre, correo, rol}` |
| POST /auth/recuperar | público | Manda un código para cambiar la contraseña |
| POST /auth/restablecer | público | Código + nueva contraseña |
| GET /auth/perfil | con sesión | Nombre, correo y rol |
| GET /usuarios | Administrador | Lista de usuarios (sin contraseñas) |
| PUT /usuarios/:id/rol | Administrador | Cambia el rol (no el propio) |
| GET /resumen | Administrador | Totales para el dashboard |
| GET /gimnasios, /gimnasios/ciudades, /gimnasios/:id | público | Catálogo (filtros `?ciudad=` y `?activo=true`) |
| POST, PUT, DELETE /gimnasios | Cuenta verificada para crear. Propietario o Administrador para editar y borrar | Publicar y gestionar anuncios |
| GET /favoritos, POST /gimnasios/:id/favorito | con sesión | Mis favoritos / agregar o quitar |
| GET /instructores, /productos | público | Listas |
| POST, PUT, DELETE /instructores, /productos | Administrador | Crear, editar, borrar |
| GET /clases | público | Filtros `?gimnasioId=` y `?tipoClase=` |
| POST, DELETE /clases | Administrador, Entrenador | Crear y borrar clases |
| POST /clases/:id/reservar | con sesión | Reserva con `{fecha, personas}`; revisa los cupos del día |
| GET /reservas, PUT /reservas/:id/cancelar | con sesión | Mis reservas / cancelar una mía |
| GET /resenas, /resenas/promedio/:gimnasioId | público | Reseñas y promedio |
| POST /resenas | con sesión | El autor y la fecha los pone el MID |
| DELETE /resenas/:id | Administrador | Borrar |
| GET /noticias | público | Lista |
| POST, DELETE /noticias | Administrador | Crear y borrar |
| GET /rutinas, /guias-fisicas, /guias-nutricionales | público | Contenido (`/rutinas?tipo=Fuerza`) |
| POST, DELETE de lo anterior | Administrador, Entrenador | Crear y borrar |
| GET /imc?peso=70&estatura=1.75 | público | Calcula el IMC y devuelve la guía que le toca |
| GET /pagos/metodos | público | Métodos disponibles |
| POST /pagos | con sesión | Pago simulado `{concepto, monto, metodoPagoId}` |
| GET /pagos/transacciones | con sesión | Mis pagos |

El token se manda en el encabezado `Authorization: Bearer <token>`.

Códigos que devuelve el MID: 400 dato mal, 401 sin sesión o código malo, 403 sin permiso,
404 no existe, 409 ya existe o sin cupos, 429 pidió el código muy rápido, 502 el CRUD no respondió.
