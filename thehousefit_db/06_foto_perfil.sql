-- =====================================================================
-- 06_foto_perfil.sql - Agrega columna foto_perfil a usuarios y actualiza vista crud_usuarios
-- =====================================================================

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS foto_perfil TEXT NOT NULL DEFAULT '';

CREATE OR REPLACE VIEW crud_usuarios AS
    SELECT id, nombre, correo, password_hash AS password, rol, correo_verificado, fecha_registro, foto_perfil
      FROM usuarios;

