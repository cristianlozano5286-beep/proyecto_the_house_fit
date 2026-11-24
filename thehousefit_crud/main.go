package main

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"

	beego "github.com/beego/beego/v2/server/web"

	"thehousefit_crud/controllers"
	_ "thehousefit_crud/routers"
)

func main() {
	if beego.BConfig.Listen.HTTPAddr == "" {
		beego.BConfig.Listen.HTTPAddr = "127.0.0.1"
	}
	conexion := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		beego.AppConfig.DefaultString("bd_host", "localhost"),
		beego.AppConfig.DefaultString("bd_puerto", "5432"),
		beego.AppConfig.DefaultString("bd_usuario", "postgres"),
		beego.AppConfig.DefaultString("bd_clave", ""),
		beego.AppConfig.DefaultString("bd_nombre", "db_thehousefit"))

	bd, err := sql.Open("postgres", conexion)
	if err != nil {
		fmt.Println("No se pudo abrir la base de datos:", err)
		return
	}

	// probamos la conexion antes de arrancar
	err = bd.Ping()
	if err != nil {
		fmt.Println("No se pudo conectar a PostgreSQL, revisa conf/app.conf:", err)
		return
	}
	fmt.Println("Conectado a PostgreSQL")

	asegurarTablasMembresias(bd)

	controllers.BD = bd

	beego.Run()
}

func asegurarTablasMembresias(bd *sql.DB) {
	ddl := `
CREATE TABLE IF NOT EXISTS membresias_gym (
    id                   SERIAL PRIMARY KEY,
    gimnasio_id          INT NOT NULL DEFAULT 1,
    gimnasio_nombre      VARCHAR(150) NOT NULL DEFAULT '',
    nombre               VARCHAR(120) NOT NULL,
    cedula               VARCHAR(40)  NOT NULL,
    correo               VARCHAR(140) NOT NULL DEFAULT '',
    celular              VARCHAR(40)  NOT NULL DEFAULT '',
    direccion_residencia TEXT         NOT NULL DEFAULT '',
    tipo_membresia       VARCHAR(20)  NOT NULL DEFAULT 'mensual',
    monto                NUMERIC(12,2) NOT NULL DEFAULT 0,
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
`
	if _, err := bd.Exec(ddl); err != nil {
		fmt.Println("Aviso al asegurar tablas de membresias:", err)
		return
	}

	var total int
	if err := bd.QueryRow("SELECT COUNT(*) FROM membresias_gym").Scan(&total); err == nil && total == 0 {
		seed := `
INSERT INTO membresias_gym (gimnasio_id, gimnasio_nombre, nombre, cedula, correo, celular, direccion_residencia, tipo_membresia, monto, moneda, metodo_pago, fecha_pago, fecha_vencimiento, total_ingresos, ultimo_ingreso) VALUES
(12, 'KAIROS GYM', 'Alejandro', '1029660209', 'pilodaniel4000@gmail.com', '3028185491', 'Calle 34 A #678, Casa', 'mensual', 116351, 'COP', 'Transferencia / Nequi', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'), TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD'), 1, 'Recién registrado'),
(12, 'KAIROS GYM', 'Carlos Andrés Mendoza', '1118542390', 'carlos.mendoza@gmail.com', '3104589210', 'Calle 24 # 18-35, Barrio El Nogal · Yopal', 'mensual', 116351, 'COP', 'Transferencia / Nequi', TO_CHAR(CURRENT_DATE - INTERVAL '5 days', 'YYYY-MM-DD'), TO_CHAR(CURRENT_DATE + INTERVAL '25 days', 'YYYY-MM-DD'), 5, 'Hoy, 06:45 a. m.'),
(12, 'KAIROS GYM', 'Laura Valentina Rojas', '1052398412', 'laura.rojas.fit@outlook.com', '3217845123', 'Transversal 7 # 35-10, Zona Deportiva · Yopal', 'diaria', 15000, 'COP', 'Efectivo en Sede', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'), TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'), 1, 'Hoy, 07:30 a. m.'),
(1, 'KAIROS GYM', 'Jhon Sebastián Pérez', '1116890451', 'jhon.perez@yahoo.com', '3148923011', 'Carrera 19 # 14-60, Barrio Centro · Yopal', 'mensual', 120000, 'COP', 'Tarjeta Débito / Crédito', TO_CHAR(CURRENT_DATE - INTERVAL '10 days', 'YYYY-MM-DD'), TO_CHAR(CURRENT_DATE + INTERVAL '20 days', 'YYYY-MM-DD'), 8, 'Hoy, 08:15 a. m.');
`
		_, _ = bd.Exec(seed)
	}
}
