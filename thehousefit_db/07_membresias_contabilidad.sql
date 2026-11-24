-- =====================================================================
-- The House Fit - 07. Contabilidad de Membresías e Ingresos por Cédula
-- Almacena los pagos de membresía mensual y pase diario junto con los
-- datos completos del afiliado (nombre, cédula, correo, celular,
-- dirección de residencia) y la bitácora de ingresos verificados.
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS membresias_gym (
    id                   SERIAL PRIMARY KEY,
    gimnasio_id          INT NOT NULL DEFAULT 1,
    gimnasio_nombre      VARCHAR(150) NOT NULL DEFAULT '',
    nombre               VARCHAR(120) NOT NULL,
    cedula               VARCHAR(40)  NOT NULL,
    correo               VARCHAR(140) NOT NULL DEFAULT '',
    celular              VARCHAR(40)  NOT NULL DEFAULT '',
    direccion_residencia TEXT         NOT NULL DEFAULT '',
    tipo_membresia       VARCHAR(20)  NOT NULL DEFAULT 'mensual'
                         CHECK (tipo_membresia IN ('mensual', 'diaria')),
    monto                NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monto >= 0),
    moneda               VARCHAR(10)  NOT NULL DEFAULT 'COP',
    metodo_pago          VARCHAR(80)  NOT NULL DEFAULT '',
    fecha_pago           VARCHAR(20)  NOT NULL DEFAULT '',
    fecha_vencimiento    VARCHAR(20)  NOT NULL DEFAULT '',
    total_ingresos       INT          NOT NULL DEFAULT 1,
    ultimo_ingreso       VARCHAR(80)  NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS membresias_gym_cedula_idx ON membresias_gym (cedula);
CREATE INDEX IF NOT EXISTS membresias_gym_gimnasio_idx ON membresias_gym (gimnasio_id);

CREATE TABLE IF NOT EXISTS ingresos_cedula (
    id              SERIAL PRIMARY KEY,
    afiliado_id     INT NOT NULL DEFAULT 0,
    cedula          VARCHAR(40)  NOT NULL,
    nombre          VARCHAR(120) NOT NULL DEFAULT '',
    gimnasio_id     INT NOT NULL DEFAULT 0,
    gimnasio_nombre VARCHAR(150) NOT NULL DEFAULT '',
    tipo_membresia  VARCHAR(20)  NOT NULL DEFAULT 'mensual',
    fecha_hora      VARCHAR(80)  NOT NULL DEFAULT '',
    autorizado      BOOLEAN      NOT NULL DEFAULT TRUE,
    observacion     TEXT         NOT NULL DEFAULT ''
);

CREATE OR REPLACE VIEW crud_membresias_gym AS SELECT * FROM membresias_gym;
CREATE OR REPLACE VIEW crud_ingresos_cedula AS SELECT * FROM ingresos_cedula;

INSERT INTO crud_colecciones (coleccion, tabla, solo_leer) VALUES
    ('membresias-gym', 'membresias_gym', FALSE),
    ('ingresos-cedula', 'ingresos_cedula', FALSE)
ON CONFLICT (coleccion) DO NOTHING;

COMMIT;
