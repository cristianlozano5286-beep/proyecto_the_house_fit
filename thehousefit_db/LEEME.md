# thehousefit_db

Scripts de PostgreSQL. Crear la base `db_thehousefit` y ejecutar en el Query Tool, en este orden:

1. `01_esquema.sql`: las 16 tablas (usuarios, gimnasios, instructores, clases, reservas_clases, favoritos,
   productos, resenas, noticias, rutinas, guias_fisicas, guias_nutricionales, metodos_pago, transacciones).
2. `02_datos_ejemplo.sql`: los mismos datos que tenía el cliente (6 gimnasios, 2 instructores, 6 clases,
   4 productos, rutinas, guías, métodos de pago) y los 3 usuarios de prueba.
3. `03_crud.sql`: la función `crud()` que usa el CRUD en Go, más las vistas.
4. `05_permisos_y_reservas.sql` agrega los IDs de propietarios, reservas y transacciones y el control de cupos.
5. `04_pruebas.sql` (opcional) ejecuta las pruebas de CRUD y hace ROLLBACK.

En una instalación existente ejecuta únicamente 05. Los gimnasios antiguos quedan a cargo del administrador hasta asignar su propietario verificado. Las reservas y transacciones históricas sin ID se conservan y se muestran a su titular cuando se les asigna el ID correcto.

## Cosas a tener en cuenta
- Los id son números (`SERIAL`), como los usa el cliente.
- Las listas (`fotos`, `servicios`, `ejercicios`) son arreglos de texto de PostgreSQL.
- Los roles son `Administrador`, `Entrenador` y `Usuario` (regla `CHECK`).
- La contraseña se guarda como hash de bcrypt (`password_hash`), nunca en texto.
- Al borrar un gimnasio se borran sus clases, reseñas y favoritos; sus instructores y noticias quedan sin gimnasio.
