package main

import (
	"fmt"
	"log"
	"os"

	_ "thehousefit_mid/routers"
	"thehousefit_mid/services"

	beego "github.com/beego/beego/v2/server/web"
)

func main() {
	if len(os.Getenv("THF_JWT_SECRET")) < 32 {
		log.Fatal("Configura THF_JWT_SECRET con al menos 32 caracteres.")
	}
	if beego.BConfig.RunMode == "dev" && beego.AppConfig.DefaultBool("codigos_en_consola", false) && !beego.AppConfig.DefaultBool("enviar_correo", false) {
		beego.BConfig.Listen.HTTPAddr = "127.0.0.1"
	}
	// si los codigos son por Gmail, se autoriza al inicio y no en medio de una peticion
	if beego.AppConfig.DefaultBool("enviar_correo", false) {
		_, err := services.NuevoServicioGmail()
		if err != nil {
			fmt.Println("Gmail no está listo:", err)
			return
		}
	}

	beego.Run()
}
