package controllers

import (
	"database/sql"
	"encoding/json"

	beego "github.com/beego/beego/v2/server/web"
)

// conexion a la base, se llena en main.go
var BD *sql.DB

// un solo controlador sirve para todas las colecciones
// (gimnasios, productos, clases, etc.)
type CrudController struct {
	beego.Controller
}

// GET /usuarios
func (c *CrudController) Listar() {
	c.llamarBD("GET", false)
}

// GET /usuarios/1
func (c *CrudController) Obtener() {
	c.llamarBD("GET", false)
}

// POST /usuarios
func (c *CrudController) Crear() {
	c.llamarBD("POST", true)
}

// PUT /usuarios/1
func (c *CrudController) Actualizar() {
	c.llamarBD("PUT", true)
}

// DELETE /usuarios/1
func (c *CrudController) Borrar() {
	c.llamarBD("DELETE", false)
}

// la funcion crud() de PostgreSQL hace el trabajo (ver sql/03_crud.sql)
// y devuelve un JSON con "codigo" y "datos"
func (c *CrudController) llamarBD(metodo string, llevaCuerpo bool) {
	coleccion := c.Ctx.Input.Param(":coleccion")
	id := c.Ctx.Input.Param(":id")

	// parametros que van a la funcion; nil llega como NULL
	var idParam interface{}
	if id != "" {
		idParam = id
	}

	var cuerpoParam interface{}
	if llevaCuerpo {
		cuerpo := c.Ctx.Input.RequestBody
		if len(cuerpo) == 0 || !json.Valid(cuerpo) {
			c.responder(400, []byte(`{"error":"el cuerpo no es un JSON valido"}`))
			return
		}
		cuerpoParam = string(cuerpo)
	}

	var respuesta string
	err := BD.QueryRow("SELECT crud($1::text, $2::text, $3::text, $4::jsonb)",
		metodo, coleccion, idParam, cuerpoParam).Scan(&respuesta)
	if err != nil {
		c.responder(500, []byte(`{"error":"fallo la consulta a la base de datos"}`))
		return
	}

	var resultado struct {
		Codigo int             `json:"codigo"`
		Datos  json.RawMessage `json:"datos"`
	}
	err = json.Unmarshal([]byte(respuesta), &resultado)
	if err != nil {
		c.responder(500, []byte(`{"error":"respuesta inesperada de la base de datos"}`))
		return
	}

	if resultado.Codigo == 204 {
		c.responder(204, []byte(""))
		return
	}

	c.responder(resultado.Codigo, resultado.Datos)
}

func (c *CrudController) responder(codigo int, cuerpo []byte) {
	c.Ctx.Output.SetStatus(codigo)
	c.Ctx.Output.Header("Content-Type", "application/json; charset=utf-8")
	c.Ctx.Output.Body(cuerpo)
}
