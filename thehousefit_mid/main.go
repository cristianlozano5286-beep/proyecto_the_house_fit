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
	// si el envio de correo esta activo, valida SMTP o Gmail OAuth al inicio
	if beego.AppConfig.DefaultBool("enviar_correo", false) {
		switch {
		case services.SmtpConfigurado():
			fmt.Println("Correo SMTP listo:", services.LeerConfigSMTP().Usuario)
		case os.Getenv("THF_GMAIL_CREDENTIALS") != "" && os.Getenv("THF_GMAIL_TOKEN") != "":
			if _, err := services.NuevoServicioGmail(); err != nil {
				fmt.Println("Gmail no está listo:", err)
				return
			}
		case beego.BConfig.RunMode == "dev" && beego.AppConfig.DefaultBool("codigos_en_consola", false):
			fmt.Println("Aviso: enviar_correo=true pero falta configurar smtp_usuario/smtp_clave; se imprimirán los códigos en consola hasta configurarlos.")
		default:
			fmt.Println("Configura SMTP (THF_SMTP_USER/THF_SMTP_PASS o smtp_usuario/smtp_clave) o Gmail OAuth.")
			return
		}
	}

	beego.Run()
}
