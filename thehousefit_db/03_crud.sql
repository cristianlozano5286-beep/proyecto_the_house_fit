-- =====================================================================
-- The House Fit - Funcion que usa la API CRUD (despues de 01 y 02)
-- El CRUD en Go solo llama a la funcion crud(); aqui se hace el trabajo.
-- Los JSON entran y salen en camelCase (como los usa el MID y el cliente)
-- y las tablas usan snake_case.
-- =====================================================================

-- nombre de la coleccion (el que usa el MID) -> tabla real
CREATE TABLE crud_colecciones (
    coleccion  TEXT PRIMARY KEY,
    tabla      TEXT NOT NULL,
    solo_leer  BOOLEAN NOT NULL DEFAULT FALSE
);
INSERT INTO crud_colecciones (coleccion, tabla, solo_leer) VALUES
    ('usuarios','usuarios',FALSE),
    ('gimnasios','gimnasios',FALSE),
    ('instructores','instructores',FALSE),
    ('clases','clases',FALSE),
    ('reservas-clases','reservas_clases',FALSE),
    ('favoritos','favoritos',FALSE),
    ('productos','productos',FALSE),
    ('resenas','resenas',FALSE),
    ('noticias','noticias',FALSE),
    ('rutinas','rutinas',FALSE),
    ('guias-fisicas','guias_fisicas',FALSE),
    ('guias-nutricionales','guias_nutricionales',FALSE),
    ('metodos-pago','metodos_pago',FALSE),
    ('transacciones','transacciones',FALSE);

-- ---------------------------------------------------------------------
-- Vistas de lectura: lo que el CRUD devuelve de cada tabla
-- ---------------------------------------------------------------------
-- en usuarios la clave se llama password (es el hash, el MID nunca la muestra)
CREATE VIEW crud_usuarios AS
    SELECT id, nombre, correo, password_hash AS password, rol, correo_verificado, fecha_registro, foto_perfil
      FROM usuarios;

CREATE VIEW crud_gimnasios           AS SELECT * FROM gimnasios;
CREATE VIEW crud_instructores        AS SELECT * FROM instructores;
CREATE VIEW crud_clases              AS SELECT * FROM clases;
CREATE VIEW crud_reservas_clases     AS SELECT * FROM reservas_clases;
CREATE VIEW crud_favoritos           AS SELECT * FROM favoritos;
CREATE VIEW crud_productos           AS SELECT * FROM productos;
CREATE VIEW crud_resenas             AS SELECT * FROM resenas;
CREATE VIEW crud_noticias            AS SELECT * FROM noticias;
CREATE VIEW crud_rutinas             AS SELECT * FROM rutinas;
CREATE VIEW crud_guias_fisicas       AS SELECT * FROM guias_fisicas;
CREATE VIEW crud_guias_nutricionales AS SELECT * FROM guias_nutricionales;
CREATE VIEW crud_metodos_pago        AS SELECT * FROM metodos_pago;
CREATE VIEW crud_transacciones       AS SELECT * FROM transacciones;

-- ---------------------------------------------------------------------
-- Cambiar nombres de claves: snake_case <-> camelCase
-- (categoria_imc es la unica que el cliente escribe categoriaIMC)
-- ---------------------------------------------------------------------
CREATE FUNCTION a_camel(texto TEXT) RETURNS TEXT AS $$
    SELECT replace(string_agg(CASE WHEN n = 1 THEN p ELSE initcap(p) END, ''),
                   'categoriaImc', 'categoriaIMC')
      FROM unnest(string_to_array(texto, '_')) WITH ORDINALITY AS t(p, n);
$$ LANGUAGE sql IMMUTABLE;

CREATE FUNCTION a_snake(texto TEXT) RETURNS TEXT AS $$
    SELECT replace(lower(regexp_replace(texto, '([A-Z])', '_\1', 'g')),
                   'categoria_i_m_c', 'categoria_imc');
$$ LANGUAGE sql IMMUTABLE;

-- convierte una fila (jsonb) a camelCase
CREATE FUNCTION fila_a_camel(fila JSONB) RETURNS JSONB AS $$
    SELECT COALESCE(jsonb_object_agg(a_camel(key), value), '{}'::jsonb)
      FROM jsonb_each(fila);
$$ LANGUAGE sql IMMUTABLE;

-- ---------------------------------------------------------------------
-- Prepara el JSON que manda el MID para guardarlo en la tabla:
--  * claves a snake_case
--  * password -> password_hash
--  * se ignoran las claves que no son columnas
--  * '' en fechas y numeros pasa a NULL
-- ---------------------------------------------------------------------
CREATE FUNCTION preparar_json(p_tabla TEXT, p_cuerpo JSONB, p_nuevo BOOLEAN) RETURNS JSONB AS $$
DECLARE
    resultado JSONB := '{}'::jsonb;
    campo     RECORD;
    clave     TEXT;
    valor     JSONB;
    tipo      TEXT;
BEGIN
    FOR campo IN SELECT key, value FROM jsonb_each(p_cuerpo) LOOP
        clave := a_snake(campo.key);
        valor := campo.value;

        IF p_tabla = 'usuarios' AND clave = 'password' THEN
            clave := 'password_hash';
        END IF;

        -- solo columnas reales
        SELECT data_type INTO tipo FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = p_tabla AND column_name = clave;
        CONTINUE WHEN tipo IS NULL;

        -- id vacio: que lo genere la secuencia
        IF clave = 'id' AND (valor = '""'::jsonb OR valor = 'null'::jsonb OR valor = '0'::jsonb) THEN
            CONTINUE;
        END IF;

        -- '' en columnas que no son texto -> NULL
        IF valor = '""'::jsonb AND tipo NOT IN ('text','character varying') THEN
            valor := 'null'::jsonb;
        END IF;

        -- al crear, un NULL se omite para que se use el valor por defecto
        IF p_nuevo AND valor = 'null'::jsonb THEN
            CONTINUE;
        END IF;

        resultado := resultado || jsonb_build_object(clave, valor);
    END LOOP;
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- Funcion principal. Devuelve {"codigo": 200, "datos": ...}
--   metodo: GET, POST, PUT, DELETE
-- ---------------------------------------------------------------------
CREATE FUNCTION crud(p_metodo TEXT, p_coleccion TEXT, p_id TEXT DEFAULT NULL,
                     p_cuerpo JSONB DEFAULT NULL) RETURNS JSONB AS $$
DECLARE
    v_tabla     TEXT;
    v_solo_leer BOOLEAN;
    v_json      JSONB;
    v_resultado JSONB;
    v_id        TEXT;
    v_columnas  TEXT;
    v_cambios   TEXT;
    v_filas     INT;
BEGIN
    SELECT tabla, solo_leer INTO v_tabla, v_solo_leer
      FROM crud_colecciones WHERE coleccion = p_coleccion;
    IF v_tabla IS NULL THEN
        RETURN jsonb_build_object('codigo', 404, 'datos', jsonb_build_object('error', 'coleccion no existe'));
    END IF;

    -- ---------- LEER ----------
    IF p_metodo = 'GET' THEN
        IF p_id IS NULL THEN
            EXECUTE format(
                'SELECT COALESCE(jsonb_agg(fila_a_camel(to_jsonb(v)) ORDER BY v.id), ''[]''::jsonb) FROM %I v',
                'crud_' || v_tabla) INTO v_resultado;
            RETURN jsonb_build_object('codigo', 200, 'datos', v_resultado);
        END IF;
        EXECUTE format('SELECT fila_a_camel(to_jsonb(v)) FROM %I v WHERE v.id::text = $1', 'crud_' || v_tabla)
            INTO v_resultado USING p_id;
        IF v_resultado IS NULL THEN
            RETURN jsonb_build_object('codigo', 404, 'datos', jsonb_build_object('error', 'no encontrado'));
        END IF;
        RETURN jsonb_build_object('codigo', 200, 'datos', v_resultado);
    END IF;

    IF v_solo_leer THEN
        RETURN jsonb_build_object('codigo', 405, 'datos', jsonb_build_object('error', 'coleccion de solo lectura'));
    END IF;

    -- ---------- CREAR ----------
    IF p_metodo = 'POST' THEN
        v_json := preparar_json(v_tabla, COALESCE(p_cuerpo, '{}'::jsonb), TRUE);
        SELECT string_agg(format('%I', key), ',') INTO v_columnas FROM jsonb_object_keys(v_json) AS key;
        IF v_columnas IS NULL THEN
            EXECUTE format('INSERT INTO %I DEFAULT VALUES RETURNING id::text', v_tabla) INTO v_id;
        ELSE
            EXECUTE format('INSERT INTO %1$I (%2$s) SELECT %2$s FROM jsonb_populate_record(NULL::%1$I, $1) RETURNING id::text',
                           v_tabla, v_columnas) INTO v_id USING v_json;
        END IF;

    -- ---------- ACTUALIZAR ----------
    ELSIF p_metodo = 'PUT' THEN
        v_json := preparar_json(v_tabla, COALESCE(p_cuerpo, '{}'::jsonb), FALSE);
        v_json := v_json - 'id';
        SELECT string_agg(format('%1$I = r.%1$I', key), ',') INTO v_cambios FROM jsonb_object_keys(v_json) AS key;
        IF v_cambios IS NOT NULL THEN
            EXECUTE format('UPDATE %1$I t SET %2$s FROM jsonb_populate_record(NULL::%1$I, $1) r WHERE t.id::text = $2',
                           v_tabla, v_cambios) USING v_json, p_id;
            GET DIAGNOSTICS v_filas = ROW_COUNT;
            IF v_filas = 0 THEN
                RETURN jsonb_build_object('codigo', 404, 'datos', jsonb_build_object('error', 'no encontrado'));
            END IF;
        END IF;
        v_id := p_id;

    -- ---------- BORRAR ----------
    ELSIF p_metodo = 'DELETE' THEN
        EXECUTE format('DELETE FROM %I WHERE id::text = $1', v_tabla) USING p_id;
        GET DIAGNOSTICS v_filas = ROW_COUNT;
        IF v_filas = 0 THEN
            RETURN jsonb_build_object('codigo', 404, 'datos', jsonb_build_object('error', 'no encontrado'));
        END IF;
        RETURN jsonb_build_object('codigo', 204, 'datos', NULL);
    ELSE
        RETURN jsonb_build_object('codigo', 405, 'datos', jsonb_build_object('error', 'metodo no permitido'));
    END IF;

    -- devuelve el registro guardado
    EXECUTE format('SELECT fila_a_camel(to_jsonb(v)) FROM %I v WHERE v.id::text = $1', 'crud_' || v_tabla)
        INTO v_resultado USING v_id;
    RETURN jsonb_build_object('codigo', CASE WHEN p_metodo = 'POST' THEN 201 ELSE 200 END,
                              'datos', COALESCE(v_resultado, '{}'::jsonb));

EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object('codigo', 409, 'datos', jsonb_build_object('error', 'ya existe ese registro: ' || SQLERRM));
    WHEN foreign_key_violation OR check_violation OR not_null_violation
         OR invalid_text_representation OR datetime_field_overflow OR string_data_right_truncation THEN
        RETURN jsonb_build_object('codigo', 400, 'datos', jsonb_build_object('error', SQLERRM));
END;
$$ LANGUAGE plpgsql;
