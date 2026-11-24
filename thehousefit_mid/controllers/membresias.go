package controllers

import (
	beego "github.com/beego/beego/v2/server/web"
)

type MembresiasController struct {
	beego.Controller
}

// GET /api/v1/membresias
func (c *MembresiasController) Listar() {
	var lista []map[string]interface{}
	if !listarColeccion(&c.Controller, "membresias-gym", &lista) {
		return
	}
	responder(&c.Controller, 200, lista)
}

// POST /api/v1/membresias
func (c *MembresiasController) Crear() {
	var cuerpo map[string]interface{}
	if !leerCuerpo(&c.Controller, &cuerpo) {
		return
	}
	crearEnColeccion(&c.Controller, "membresias-gym", cuerpo)
}

// PUT /api/v1/membresias/:id
func (c *MembresiasController) Actualizar() {
	actualizarEnColeccion(&c.Controller, "membresias-gym")
}

// DELETE /api/v1/membresias/:id
func (c *MembresiasController) Borrar() {
	borrarDeColeccion(&c.Controller, "membresias-gym")
}

// GET /api/v1/membresias/ingresos
func (c *MembresiasController) ListarIngresos() {
	var lista []map[string]interface{}
	if !listarColeccion(&c.Controller, "ingresos-cedula", &lista) {
		return
	}
	responder(&c.Controller, 200, lista)
}

// POST /api/v1/membresias/ingresos
func (c *MembresiasController) CrearIngreso() {
	var cuerpo map[string]interface{}
	if !leerCuerpo(&c.Controller, &cuerpo) {
		return
	}
	crearEnColeccion(&c.Controller, "ingresos-cedula", cuerpo)
}
