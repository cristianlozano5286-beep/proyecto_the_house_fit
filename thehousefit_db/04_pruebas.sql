-- =====================================================================
-- The House Fit - Pruebas de la funcion crud() (opcional)
-- Ejecutar en el Query Tool de db_thehousefit despues de 01, 02 y 03.
-- Muestra una tabla con la columna resultado en OK o FALLA.
-- Todo lo que crea se deshace al final (ROLLBACK), no deja datos.
-- =====================================================================
BEGIN;

CREATE TEMP TABLE resultados (n SERIAL, prueba TEXT, esperado INT, obtenido INT);

-- guarda el codigo que devolvio crud() para compararlo con el esperado
CREATE FUNCTION pg_temp.probar(p_prueba TEXT, p_esperado INT, p_respuesta JSONB) RETURNS VOID AS $$
    INSERT INTO resultados (prueba, esperado, obtenido)
    VALUES (p_prueba, p_esperado, (p_respuesta ->> 'codigo')::INT);
$$ LANGUAGE sql;

-- ---------- leer ----------
SELECT pg_temp.probar('GET gimnasios', 200, crud('GET','gimnasios'));
SELECT pg_temp.probar('GET gimnasios/1', 200, crud('GET','gimnasios','1'));
SELECT pg_temp.probar('GET gimnasios/999 no existe', 404, crud('GET','gimnasios','999'));
SELECT pg_temp.probar('GET usuarios', 200, crud('GET','usuarios'));
SELECT pg_temp.probar('GET instructores', 200, crud('GET','instructores'));
SELECT pg_temp.probar('GET clases', 200, crud('GET','clases'));
SELECT pg_temp.probar('GET productos', 200, crud('GET','productos'));
SELECT pg_temp.probar('GET resenas', 200, crud('GET','resenas'));
SELECT pg_temp.probar('GET noticias', 200, crud('GET','noticias'));
SELECT pg_temp.probar('GET rutinas', 200, crud('GET','rutinas'));
SELECT pg_temp.probar('GET guias-fisicas', 200, crud('GET','guias-fisicas'));
SELECT pg_temp.probar('GET guias-nutricionales', 200, crud('GET','guias-nutricionales'));
SELECT pg_temp.probar('GET metodos-pago', 200, crud('GET','metodos-pago'));
SELECT pg_temp.probar('coleccion que no existe', 404, crud('GET','nada'));
SELECT pg_temp.probar('metodo que no existe', 405, crud('PATCH','gimnasios','1'));

-- ---------- crear ----------
SELECT pg_temp.probar('POST gimnasio', 201, crud('POST','gimnasios',NULL,
  '{"nombre":"PRUEBA","direccion":"Calle 1","ciudad":"Yopal","fotos":["a","b"],"servicios":["Yoga"],"precio":50000}'));
SELECT pg_temp.probar('POST gimnasio sin nombre', 400, crud('POST','gimnasios',NULL,'{"direccion":"x","ciudad":"y"}'));
SELECT pg_temp.probar('POST gimnasio con precio negativo', 400, crud('POST','gimnasios',NULL,
  '{"nombre":"x","direccion":"x","ciudad":"y","precio":-5}'));
SELECT pg_temp.probar('POST instructor', 201, crud('POST','instructores',NULL,'{"nombre":"Instructor prueba","gimnasioId":1}'));
SELECT pg_temp.probar('POST instructor con gimnasio que no existe', 400, crud('POST','instructores',NULL,'{"nombre":"x","gimnasioId":999}'));
SELECT pg_temp.probar('POST producto', 201, crud('POST','productos',NULL,'{"nombre":"Producto","categoria":"Implemento","precio":1000,"stock":3}'));
SELECT pg_temp.probar('POST producto con categoria mala', 400, crud('POST','productos',NULL,'{"nombre":"x","categoria":"Comida","precio":1}'));
SELECT pg_temp.probar('POST clase', 201, crud('POST','clases',NULL,
  '{"gimnasioId":1,"tipoClase":"Yoga","instructor":"x","hora":"7:00 am","cupos":5,"duracion":"50 min","precio":1000}'));
SELECT pg_temp.probar('POST clase con tipo malo', 400, crud('POST','clases',NULL,
  '{"gimnasioId":1,"tipoClase":"Baile","instructor":"x","hora":"7:00 am","cupos":5,"duracion":"50 min"}'));
SELECT pg_temp.probar('POST reserva', 201, crud('POST','reservas-clases',NULL,
  '{"usuario":"Andrés Torres","claseId":1,"fecha":"2026-12-01","personas":2,"estado":"Confirmada"}'));
SELECT pg_temp.probar('POST reserva con 0 personas', 400, crud('POST','reservas-clases',NULL,
  '{"usuario":"x","claseId":1,"fecha":"2026-12-01","personas":0}'));
SELECT pg_temp.probar('POST favorito', 201, crud('POST','favoritos',NULL,'{"usuarioId":3,"gimnasioId":2}'));
SELECT pg_temp.probar('POST favorito repetido', 409, crud('POST','favoritos',NULL,'{"usuarioId":3,"gimnasioId":2}'));
SELECT pg_temp.probar('POST resena', 201, crud('POST','resenas',NULL,
  '{"gimnasioId":1,"usuario":"x","titulo":"t","cuerpo":"c","puntuacion":5}'));
SELECT pg_temp.probar('POST resena con puntuacion 9', 400, crud('POST','resenas',NULL,
  '{"gimnasioId":1,"usuario":"x","titulo":"t","cuerpo":"c","puntuacion":9}'));
SELECT pg_temp.probar('POST noticia', 201, crud('POST','noticias',NULL,'{"titulo":"t","cuerpo":"c","tipo":"Oferta"}'));
SELECT pg_temp.probar('POST noticia con tipo malo', 400, crud('POST','noticias',NULL,'{"titulo":"t","cuerpo":"c","tipo":"Otra"}'));
SELECT pg_temp.probar('POST rutina', 201, crud('POST','rutinas',NULL,
  '{"tipoEntrenamiento":"Cardio","nombre":"r","nivel":"Principiante","ejercicios":["a","b"],"duracionSemanas":4}'));
SELECT pg_temp.probar('POST guia fisica', 201, crud('POST','guias-fisicas',NULL,'{"titulo":"t","metodo":"m","contenido":"c"}'));
SELECT pg_temp.probar('POST guia nutricional', 201, crud('POST','guias-nutricionales',NULL,
  '{"categoriaIMC":"Sobrepeso","titulo":"t","recomendaciones":"r"}'));
SELECT pg_temp.probar('POST guia nutricional con categoria mala', 400, crud('POST','guias-nutricionales',NULL,
  '{"categoriaIMC":"Flaco","titulo":"t","recomendaciones":"r"}'));
SELECT pg_temp.probar('POST transaccion', 201, crud('POST','transacciones',NULL,
  '{"usuario":"x","concepto":"Mensualidad","monto":50000,"metodoPagoId":1,"estado":"Aprobado"}'));
SELECT pg_temp.probar('POST transaccion con monto 0', 400, crud('POST','transacciones',NULL,
  '{"usuario":"x","concepto":"c","monto":0,"metodoPagoId":1}'));
SELECT pg_temp.probar('POST usuario', 201, crud('POST','usuarios',NULL,
  '{"nombre":"Nuevo","correo":"nuevo@correo.com","password":"hash","rol":"Usuario"}'));
SELECT pg_temp.probar('POST usuario con correo repetido', 409, crud('POST','usuarios',NULL,
  '{"nombre":"Otro","correo":"admin@thehousefit.com","password":"hash"}'));
SELECT pg_temp.probar('POST usuario con rol malo', 400, crud('POST','usuarios',NULL,
  '{"nombre":"x","correo":"x@x.com","password":"hash","rol":"Dios"}'));

-- ---------- editar ----------
SELECT pg_temp.probar('PUT gimnasio (solo el precio)', 200, crud('PUT','gimnasios','1','{"precio":130000}'));
SELECT pg_temp.probar('PUT gimnasio que no existe', 404, crud('PUT','gimnasios','999','{"precio":1}'));
SELECT pg_temp.probar('PUT producto con stock negativo', 400, crud('PUT','productos','1','{"stock":-1}'));
SELECT pg_temp.probar('PUT rutina (lista de ejercicios)', 200, crud('PUT','rutinas','1','{"ejercicios":["x","y"]}'));
SELECT pg_temp.probar('PUT rol de usuario', 200, crud('PUT','usuarios','3','{"rol":"Entrenador"}'));
SELECT pg_temp.probar('PUT reserva (cancelar)', 200, crud('PUT','reservas-clases','1','{"estado":"Cancelada"}'));

-- ---------- borrar ----------
SELECT pg_temp.probar('DELETE producto', 204, crud('DELETE','productos','4'));
SELECT pg_temp.probar('DELETE producto otra vez', 404, crud('DELETE','productos','4'));
SELECT pg_temp.probar('DELETE gimnasio (borra sus clases)', 204, crud('DELETE','gimnasios','3'));

-- ---------- comprobaciones de contenido ----------
INSERT INTO resultados (prueba, esperado, obtenido)
SELECT 'el IMC se escribe categoriaIMC', 1,
       (crud('GET','guias-nutricionales','1') -> 'datos' ? 'categoriaIMC')::INT;
INSERT INTO resultados (prueba, esperado, obtenido)
SELECT 'las fotos salen como lista', 1,
       (jsonb_typeof(crud('GET','gimnasios','1') -> 'datos' -> 'fotos') = 'array')::INT;
INSERT INTO resultados (prueba, esperado, obtenido)
SELECT 'el borrado de gimnasio borro sus clases', 0,
       (SELECT COUNT(*)::INT FROM clases WHERE gimnasio_id = 3);

SELECT n, prueba, esperado, obtenido,
       CASE WHEN esperado = obtenido THEN 'OK' ELSE 'FALLA' END AS resultado
  FROM resultados ORDER BY n;

ROLLBACK;
