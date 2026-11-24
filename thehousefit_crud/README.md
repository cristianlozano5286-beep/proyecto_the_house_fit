# thehousefit_crud

API CRUD de The House Fit (Go + Beego, puerto 3000). Es la única que se conecta a PostgreSQL.
El MID le pide los datos por HTTP.

## Correr
1. Crear la base y ejecutar los scripts de `thehousefit_db`.
2. En `conf/app.conf` poner la clave de PostgreSQL en `bd_clave` (y `bd_puerto` si no es 5432).
3. ```
   go mod tidy
   go run main.go
   ```
   Debe salir "Conectado a PostgreSQL". Prueba rápida: http://localhost:3000/gimnasios

## Cómo funciona
Hay un solo controlador (`controllers/crud.go`) para todas las colecciones. Las rutas son
`GET /coleccion`, `GET /coleccion/id`, `POST /coleccion`, `PUT /coleccion/id` y `DELETE /coleccion/id`.
El controlador llama a la función `crud()` de PostgreSQL, que hace el SELECT, INSERT, UPDATE o DELETE
y devuelve el JSON.

Colecciones: usuarios, gimnasios, instructores, clases, reservas-clases, favoritos, productos, resenas,
noticias, rutinas, guias-fisicas, guias-nutricionales, metodos-pago y transacciones.

Códigos: 200/201 bien, 204 borrado, 400 dato inválido (lo rechazó una regla de la base), 404 no existe,
409 ya existe (por ejemplo un correo repetido).

El `PUT` solo cambia las claves que vengan en el cuerpo (sirve para cambios parciales).
