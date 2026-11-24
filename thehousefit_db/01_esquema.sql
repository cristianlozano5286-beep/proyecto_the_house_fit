-- =====================================================================
-- The House Fit - Base de datos (PostgreSQL)
-- Plataforma de gimnasios, rutinas, tienda y reservas de clases
-- Crear la base db_thehousefit en pgAdmin y ejecutar este archivo en
-- el Query Tool, despues el 02 y el 03.
-- =====================================================================
-- Notas rapidas:
--  * Los id son numeros (1, 2, 3...) porque el cliente Angular ya los
--    usa asi. Los genera solo la base con SERIAL.
--  * Las listas del cliente (fotos, servicios, ejercicios) se guardan
--    como arreglos de texto de PostgreSQL.
--  * Los roles son: Administrador, Entrenador y Usuario.
-- =====================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- ---------------------------------------------------------------------
-- 1. USUARIOS
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id                SERIAL PRIMARY KEY,
    nombre            VARCHAR(100) NOT NULL,
    correo            VARCHAR(120) NOT NULL UNIQUE,
    password_hash     VARCHAR(100) NOT NULL,
    rol               VARCHAR(15)  NOT NULL DEFAULT 'Usuario'
                      CHECK (rol IN ('Administrador','Entrenador','Usuario','Creador gym')),
    correo_verificado BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha_registro    DATE         NOT NULL DEFAULT CURRENT_DATE,
    foto_perfil       TEXT         NOT NULL DEFAULT ''
);

-- ---------------------------------------------------------------------
-- 2. GIMNASIOS, INSTRUCTORES Y CLASES
-- ---------------------------------------------------------------------
CREATE TABLE gimnasios (
    id           SERIAL PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    direccion    VARCHAR(150) NOT NULL,
    barrio       VARCHAR(80)  NOT NULL DEFAULT '',
    ciudad       VARCHAR(80)  NOT NULL,
    pais         VARCHAR(60)  NOT NULL DEFAULT 'Colombia',
    telefono     VARCHAR(25)  NOT NULL DEFAULT '',
    horario      VARCHAR(120) NOT NULL DEFAULT '',
    descripcion  TEXT         NOT NULL DEFAULT '',
    imagen       VARCHAR(20)  NOT NULL DEFAULT '',
    fotos        TEXT[]       NOT NULL DEFAULT '{}',
    precio       NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (precio >= 0),
    moneda       VARCHAR(5)   NOT NULL DEFAULT 'COP',
    servicios    TEXT[]       NOT NULL DEFAULT '{}',
    activo       BOOLEAN      NOT NULL DEFAULT TRUE,
    lat          NUMERIC(9,6),
    lng          NUMERIC(9,6)
);

CREATE TABLE instructores (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    correo        VARCHAR(120) NOT NULL DEFAULT '',
    telefono      VARCHAR(25)  NOT NULL DEFAULT '',
    especialidad  VARCHAR(100) NOT NULL DEFAULT '',
    experiencia   INT          NOT NULL DEFAULT 0 CHECK (experiencia >= 0),
    biografia     TEXT         NOT NULL DEFAULT '',
    imagen        VARCHAR(20)  NOT NULL DEFAULT '',
    gimnasio_id   INT REFERENCES gimnasios(id) ON DELETE SET NULL,
    activo        BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE clases (
    id           SERIAL PRIMARY KEY,
    gimnasio_id  INT NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
    tipo_clase   VARCHAR(15) NOT NULL
                 CHECK (tipo_clase IN ('Spinning','CrossFit','Yoga','Funcional','Boxeo','Pilates')),
    instructor   VARCHAR(100) NOT NULL,
    hora         VARCHAR(15)  NOT NULL,
    cupos        INT NOT NULL CHECK (cupos >= 0),
    duracion     VARCHAR(20)  NOT NULL,
    precio       NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (precio >= 0)
);

CREATE TABLE reservas_clases (
    id        SERIAL PRIMARY KEY,
    usuario   VARCHAR(100) NOT NULL,
    clase_id  INT NOT NULL REFERENCES clases(id) ON DELETE CASCADE,
    fecha     DATE NOT NULL,
    personas  INT  NOT NULL DEFAULT 1 CHECK (personas >= 1),
    estado    VARCHAR(12) NOT NULL DEFAULT 'Confirmada'
              CHECK (estado IN ('Confirmada','Cancelada'))
);

-- gimnasios favoritos de cada usuario
CREATE TABLE favoritos (
    id           SERIAL PRIMARY KEY,
    usuario_id   INT NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
    gimnasio_id  INT NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
    UNIQUE (usuario_id, gimnasio_id)
);

-- ---------------------------------------------------------------------
-- 3. TIENDA
-- ---------------------------------------------------------------------
CREATE TABLE productos (
    id                SERIAL PRIMARY KEY,
    nombre            VARCHAR(120) NOT NULL,
    categoria         VARCHAR(20) NOT NULL
                      CHECK (categoria IN ('Suplemento','Implemento','Ropa deportiva')),
    precio            NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
    stock             INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    descripcion       TEXT NOT NULL DEFAULT '',
    guia_nutricional  TEXT NOT NULL DEFAULT '',
    imagen            VARCHAR(20) NOT NULL DEFAULT ''
);

-- ---------------------------------------------------------------------
-- 4. BLOG: RESEÑAS Y NOTICIAS
-- ---------------------------------------------------------------------
CREATE TABLE resenas (
    id           SERIAL PRIMARY KEY,
    gimnasio_id  INT NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
    usuario      VARCHAR(100) NOT NULL,
    titulo       VARCHAR(150) NOT NULL,
    cuerpo       TEXT NOT NULL,
    imagen       VARCHAR(20) NOT NULL DEFAULT '⭐',
    puntuacion   INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    fecha        DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE noticias (
    id           SERIAL PRIMARY KEY,
    titulo       VARCHAR(150) NOT NULL,
    cuerpo       TEXT NOT NULL,
    imagen       VARCHAR(20) NOT NULL DEFAULT '📰',
    tipo         VARCHAR(12) NOT NULL
                 CHECK (tipo IN ('Novedad','Oferta','Promoción')),
    gimnasio_id  INT REFERENCES gimnasios(id) ON DELETE SET NULL,
    fecha        DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------------------
-- 5. RUTINAS Y GUIAS
-- ---------------------------------------------------------------------
CREATE TABLE rutinas (
    id                  SERIAL PRIMARY KEY,
    tipo_entrenamiento  VARCHAR(20) NOT NULL
                        CHECK (tipo_entrenamiento IN ('Fuerza','Cardio','Funcional','Flexibilidad','Pérdida de peso')),
    nombre              VARCHAR(150) NOT NULL,
    nivel               VARCHAR(15) NOT NULL
                        CHECK (nivel IN ('Principiante','Intermedio','Avanzado')),
    descripcion         TEXT NOT NULL DEFAULT '',
    ejercicios          TEXT[] NOT NULL DEFAULT '{}',
    duracion_semanas    INT NOT NULL DEFAULT 4 CHECK (duracion_semanas > 0)
);

CREATE TABLE guias_fisicas (
    id                 SERIAL PRIMARY KEY,
    titulo             VARCHAR(150) NOT NULL,
    metodo             VARCHAR(60) NOT NULL,
    contenido          TEXT NOT NULL,
    fecha_publicacion  DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE guias_nutricionales (
    id               SERIAL PRIMARY KEY,
    categoria_imc    VARCHAR(15) NOT NULL
                     CHECK (categoria_imc IN ('Bajo peso','Peso normal','Sobrepeso','Obesidad')),
    titulo           VARCHAR(150) NOT NULL,
    recomendaciones  TEXT NOT NULL,
    ejemplo_comidas  TEXT NOT NULL DEFAULT ''
);

-- ---------------------------------------------------------------------
-- 6. PAGOS
-- ---------------------------------------------------------------------
CREATE TABLE metodos_pago (
    id           SERIAL PRIMARY KEY,
    nombre       VARCHAR(60) NOT NULL UNIQUE,
    icono        VARCHAR(20) NOT NULL DEFAULT '',
    descripcion  VARCHAR(200) NOT NULL DEFAULT '',
    disponible   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE transacciones (
    id              SERIAL PRIMARY KEY,
    usuario         VARCHAR(100) NOT NULL,
    concepto        VARCHAR(200) NOT NULL,
    monto           NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    metodo_pago_id  INT NOT NULL REFERENCES metodos_pago(id),
    estado          VARCHAR(10) NOT NULL DEFAULT 'Pendiente'
                    CHECK (estado IN ('Pendiente','Aprobado','Rechazado')),
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE
);
