package routers

import (
	beego "github.com/beego/beego/v2/server/web"

	"thehousefit_crud/controllers"
)

func init() {
	// el MID llama a estas rutas, por ejemplo GET /gimnasios o PUT /productos/3
	beego.Router("/:coleccion", &controllers.CrudController{}, "get:Listar;post:Crear")
	beego.Router("/:coleccion/:id", &controllers.CrudController{}, "get:Obtener;put:Actualizar;delete:Borrar")
}
