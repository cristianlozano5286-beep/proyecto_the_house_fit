package controllers

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	beego "github.com/beego/beego/v2/server/web"

	"thehousefit_mid/models"
	"thehousefit_mid/services"
)

type PagosController struct {
	beego.Controller
}

// GET /api/v1/pagos/metodos
func (c *PagosController) ListarMetodos() {
	var metodos []models.MetodoPago
	if !listarColeccion(&c.Controller, "metodos-pago", &metodos) {
		return
	}

	// solo los que se pueden usar
	disponibles := []models.MetodoPago{}
	for _, m := range metodos {
		if m.Disponible {
			disponibles = append(disponibles, m)
		}
	}

	responder(&c.Controller, 200, disponibles)
}

// POST /api/v1/pagos
// el pago es simulado: no hay una pasarela de pago de verdad
func (c *PagosController) Pagar() {
	sesion, valido := exigirSesion(&c.Controller)
	if !valido {
		return
	}

	var solicitud models.SolicitudPago

	if !leerCuerpo(&c.Controller, &solicitud) {
		return
	}

	if strings.TrimSpace(solicitud.Concepto) == "" {
		responderError(&c.Controller, 400, "El concepto es obligatorio.")
		return
	}

	if solicitud.Monto <= 0 {
		responderError(&c.Controller, 400, "El monto debe ser mayor a cero.")
		return
	}

	// el metodo de pago tiene que existir y estar disponible
	var metodos []models.MetodoPago
	if !listarColeccion(&c.Controller, "metodos-pago", &metodos) {
		return
	}

	metodoBueno := false
	for _, m := range metodos {
		if m.Id == solicitud.MetodoPagoId && m.Disponible {
			metodoBueno = true
		}
	}
	if !metodoBueno {
		responderError(&c.Controller, 400, "Ese método de pago no está disponible.")
		return
	}

	usuarioId, _ := strconv.Atoi(sesion.ID)
	var uidPtr *int
	if usuarioId > 0 {
		uidPtr = &usuarioId
	}
	nueva := models.TransaccionCrud{
		UsuarioId:    uidPtr,
		Usuario:      sesion.Nombre,
		Concepto:     truncarTexto(strings.TrimSpace(solicitud.Concepto), 200),
		Monto:        solicitud.Monto,
		MetodoPagoId: solicitud.MetodoPagoId,
		Estado:       "Aprobado",
		Fecha:        hoy(),
	}

	var creada map[string]interface{}
	err := services.NuevoServicioCrud().Crear("transacciones", nueva, &creada)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}

	creada["pagado"] = true
	creada["fechaHora"] = time.Now().Format("2006-01-02 15:04:05")
	responder(&c.Controller, 201, creada)
}

func resolverMetodoPagoId(solicitudId int, metodoNombre string) int {
	if solicitudId >= 1 && solicitudId <= 4 {
		return solicitudId
	}
	lower := strings.ToLower(metodoNombre)
	switch {
	case strings.Contains(lower, "tarjeta") || strings.Contains(lower, "visa") || strings.Contains(lower, "card"):
		return 1
	case strings.Contains(lower, "pse") || strings.Contains(lower, "bancolombia"):
		return 2
	case strings.Contains(lower, "efectivo"):
		return 3
	default:
		return 4
	}
}

func truncarTexto(valor string, maxLen int) string {
	runas := []rune(valor)
	if len(runas) <= maxLen {
		return valor
	}
	return string(runas[:maxLen])
}

// POST /api/v1/pagos/pasarela
// Registra en PostgreSQL un pago aprobado desde la pasarela Sandbox (ej. Wompi Sandbox)
func (c *PagosController) ConfirmarPasarela() {
	var solicitud models.SolicitudPasarela
	if !leerCuerpo(&c.Controller, &solicitud) {
		return
	}

	if strings.TrimSpace(solicitud.Concepto) == "" {
		responderError(&c.Controller, 400, "El concepto es obligatorio.")
		return
	}
	if solicitud.Monto <= 0 {
		responderError(&c.Controller, 400, "El monto debe ser mayor a cero.")
		return
	}

	var uidPtr *int
	usuarioNombre := strings.TrimSpace(solicitud.Usuario)
	if sesion, ok := leerToken(&c.Controller); ok && sesion != nil {
		if uid, err := strconv.Atoi(sesion.ID); err == nil && uid > 0 {
			uidPtr = &uid
		}
		if usuarioNombre == "" {
			usuarioNombre = sesion.Nombre
		}
	}
	if usuarioNombre == "" {
		usuarioNombre = "Atleta The House Fit"
	}

	pasarela := strings.TrimSpace(solicitud.Pasarela)
	if pasarela == "" {
		pasarela = "Wompi Sandbox"
	}
	referencia := strings.TrimSpace(solicitud.Referencia)
	if referencia == "" {
		referencia = fmt.Sprintf("WMP-THF-%d", time.Now().UnixMilli())
	}
	metodoNombre := strings.TrimSpace(solicitud.MetodoNombre)
	if metodoNombre == "" {
		metodoNombre = "Wompi · Nequi Sandbox"
	}
	metodoPagoId := resolverMetodoPagoId(solicitud.MetodoPagoId, metodoNombre)
	fechaHora := time.Now().Format("2006-01-02 15:04:05")
	conceptoSql := truncarTexto(
		fmt.Sprintf("%s [%s · Ref %s · Pagado]", strings.TrimSpace(solicitud.Concepto), pasarela, referencia),
		200,
	)

	nueva := models.TransaccionCrud{
		UsuarioId:    uidPtr,
		Usuario:      truncarTexto(usuarioNombre, 100),
		Concepto:     conceptoSql,
		Monto:        solicitud.Monto,
		MetodoPagoId: metodoPagoId,
		Estado:       "Aprobado",
		Fecha:        hoy(),
	}

	var creada map[string]interface{}
	err := services.NuevoServicioCrud().Crear("transacciones", nueva, &creada)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}

	creada["metodoNombre"] = metodoNombre
	creada["pasarela"] = pasarela
	creada["referencia"] = referencia
	creada["pagado"] = true
	creada["fechaHora"] = fechaHora
	if strings.TrimSpace(solicitud.Cedula) != "" {
		creada["cedula"] = strings.TrimSpace(solicitud.Cedula)
	}

	responder(&c.Controller, 201, creada)
}

// GET /api/v1/pagos/transacciones
// los pagos de la persona que inicio sesion
func (c *PagosController) MisTransacciones() {
	sesion, valido := exigirSesion(&c.Controller)
	if !valido {
		return
	}

	var transacciones []models.Transaccion
	if !listarColeccion(&c.Controller, "transacciones", &transacciones) {
		return
	}

	mias := []models.Transaccion{}
	for _, t := range transacciones {
		if strconv.Itoa(t.UsuarioId) == sesion.ID {
			mias = append(mias, t)
		}
	}

	responder(&c.Controller, 200, mias)
}
