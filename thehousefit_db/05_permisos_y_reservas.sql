BEGIN;

-- Los registros anteriores conservan sus datos. Asigna las cuentas verificadas
-- explícitamente cuando conozcas su titular; un nombre no identifica a una cuenta.
ALTER TABLE gimnasios ADD COLUMN propietario_id INT REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE reservas_clases ADD COLUMN usuario_id INT REFERENCES usuarios(id);
ALTER TABLE transacciones ADD COLUMN usuario_id INT REFERENCES usuarios(id);

CREATE INDEX reservas_clases_usuario_idx ON reservas_clases (usuario_id);
CREATE INDEX reservas_clases_confirmadas_idx
    ON reservas_clases (clase_id, fecha) WHERE estado = 'Confirmada';
CREATE INDEX transacciones_usuario_idx ON transacciones (usuario_id);

CREATE OR REPLACE VIEW crud_gimnasios AS SELECT * FROM gimnasios;
CREATE OR REPLACE VIEW crud_reservas_clases AS SELECT * FROM reservas_clases;
CREATE OR REPLACE VIEW crud_transacciones AS SELECT * FROM transacciones;

CREATE FUNCTION validar_cupos_reserva() RETURNS trigger AS $$
DECLARE
    capacidad INT;
    ocupados BIGINT;
BEGIN
    IF NEW.estado <> 'Confirmada' THEN
        RETURN NEW;
    END IF;

    -- El candado de la clase serializa las asignaciones, incluidas las de la misma fecha.
    SELECT cupos INTO capacidad FROM clases WHERE id = NEW.clase_id FOR NO KEY UPDATE;
    SELECT COALESCE(SUM(personas), 0) INTO ocupados
      FROM reservas_clases
     WHERE clase_id = NEW.clase_id AND fecha = NEW.fecha AND estado = 'Confirmada'
       AND id IS DISTINCT FROM NEW.id;

    IF ocupados + NEW.personas > capacidad THEN
        RAISE unique_violation USING MESSAGE = 'No hay cupos suficientes para ese día.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validar_cupos_reserva
    BEFORE INSERT OR UPDATE OF clase_id, fecha, personas, estado ON reservas_clases
    FOR EACH ROW EXECUTE FUNCTION validar_cupos_reserva();

COMMIT;

