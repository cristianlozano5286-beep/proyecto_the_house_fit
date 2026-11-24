package models

type MetodoPago struct {
	Id          int    `json:"id,omitempty"`
	Nombre      string `json:"nombre"`
	Icono       string `json:"icono"`
	Descripcion string `json:"descripcion"`
	Disponible  bool   `json:"disponible"`
}

type Transaccion struct {
	UsuarioId    int     `json:"usuarioId"`
	Id           int     `json:"id,omitempty"`
	Usuario      string  `json:"usuario"`
	Concepto     string  `json:"concepto"`
	Monto        float64 `json:"monto"`
	MetodoPagoId int     `json:"metodoPagoId"`
	MetodoNombre string  `json:"metodoNombre,omitempty"`
	Pasarela     string  `json:"pasarela,omitempty"`
	Referencia   string  `json:"referencia,omitempty"`
	Cedula       string  `json:"cedula,omitempty"`
	Estado       string  `json:"estado"`
	Pagado       bool    `json:"pagado,omitempty"`
	Fecha        string  `json:"fecha,omitempty"`
	FechaHora    string  `json:"fechaHora,omitempty"`
}

// Payload exacto compatible con columnas SQL de la tabla transacciones
type TransaccionCrud struct {
	UsuarioId    *int    `json:"usuarioId,omitempty"`
	Usuario      string  `json:"usuario"`
	Concepto     string  `json:"concepto"`
	Monto        float64 `json:"monto"`
	MetodoPagoId int     `json:"metodoPagoId"`
	Estado       string  `json:"estado"`
	Fecha        string  `json:"fecha"`
}

// lo que manda el cliente para pagar
type SolicitudPago struct {
	Concepto     string  `json:"concepto"`
	Monto        float64 `json:"monto"`
	MetodoPagoId int     `json:"metodoPagoId"`
}

// confirmacion de pasarela (ej. Wompi Sandbox) hacia PostgreSQL
type SolicitudPasarela struct {
	Concepto       string  `json:"concepto"`
	Monto          float64 `json:"monto"`
	MetodoPagoId   int     `json:"metodoPagoId"`
	MetodoNombre   string  `json:"metodoNombre"`
	Pasarela       string  `json:"pasarela"`
	Referencia     string  `json:"referencia"`
	Usuario        string  `json:"usuario"`
	Cedula         string  `json:"cedula"`
	Correo         string  `json:"correo"`
	GimnasioNombre string  `json:"gimnasioNombre"`
}
