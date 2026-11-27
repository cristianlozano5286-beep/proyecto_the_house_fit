package services

import (
	"encoding/base64"
	"fmt"
	"mime"
	"net/smtp"
	"os"
	"strings"

	beego "github.com/beego/beego/v2/server/web"
)

type ConfigSMTP struct {
	Host      string
	Puerto    string
	Usuario   string
	Clave     string
	Remitente string
}

// LeerConfigSMTP obtiene la configuracion SMTP dando prioridad a variables de entorno sobre app.conf.
func LeerConfigSMTP() ConfigSMTP {
	host := leerValorSMTP("THF_SMTP_HOST", "smtp_host", "smtp.gmail.com")
	puerto := leerValorSMTP("THF_SMTP_PORT", "smtp_puerto", "587")
	usuario := leerValorSMTP("THF_SMTP_USER", "smtp_usuario", "")
	// Google muestra las contraseñas de aplicacion en bloques separados por espacios
	clave := strings.ReplaceAll(leerValorSMTP("THF_SMTP_PASS", "smtp_clave", ""), " ", "")
	remitente := leerValorSMTP("THF_SMTP_FROM", "smtp_remitente", "")
	if remitente == "" && usuario != "" {
		remitente = fmt.Sprintf("The House Fit <%s>", usuario)
	}

	return ConfigSMTP{
		Host:      host,
		Puerto:    puerto,
		Usuario:   usuario,
		Clave:     clave,
		Remitente: remitente,
	}
}

func leerValorSMTP(claveEnv string, claveConf string, defecto string) string {
	if valor := strings.TrimSpace(os.Getenv(claveEnv)); valor != "" {
		return valor
	}
	if beego.AppConfig != nil {
		if valor := strings.TrimSpace(beego.AppConfig.DefaultString(claveConf, "")); valor != "" {
			return valor
		}
	}
	return defecto
}

// SmtpConfigurado indica si existen credenciales SMTP minimas para enviar correos.
func SmtpConfigurado() bool {
	cfg := LeerConfigSMTP()
	return cfg.Usuario != "" && cfg.Clave != ""
}

func limpiarCabecera(valor string) string {
	sinCR := strings.ReplaceAll(valor, "\r", "")
	return strings.TrimSpace(strings.ReplaceAll(sinCR, "\n", ""))
}

// ArmarCorreoSMTP construye el mensaje MIME HTML listo para enviar por net/smtp,
// adjuntando opcionalmente el logo inline (cid:logo-thehousefit) cuando logo no esta vacio.
func ArmarCorreoSMTP(remitente string, destinatario string, asunto string, cuerpoHTML string, logo []byte) string {
	cabeceras := []string{
		"From: " + limpiarCabecera(remitente),
		"To: " + limpiarCabecera(destinatario),
		"Subject: " + mime.QEncoding.Encode("UTF-8", limpiarCabecera(asunto)),
		"MIME-Version: 1.0",
	}

	if len(logo) == 0 {
		cabeceras = append(cabeceras,
			"Content-Type: text/html; charset=UTF-8",
			"Content-Transfer-Encoding: base64",
			"",
			partirLineas(base64.StdEncoding.EncodeToString([]byte(cuerpoHTML))),
			"",
		)
		return strings.Join(cabeceras, "\r\n")
	}

	limite := "limite-thehousefit-smtp"
	cabeceras = append(cabeceras,
		"Content-Type: multipart/related; boundary="+limite,
		"",
		"--"+limite,
		"Content-Type: text/html; charset=UTF-8",
		"Content-Transfer-Encoding: base64",
		"",
		partirLineas(base64.StdEncoding.EncodeToString([]byte(cuerpoHTML))),
		"--"+limite,
		"Content-Type: image/png",
		"Content-Transfer-Encoding: base64",
		"Content-ID: <logo-thehousefit>",
		"Content-Disposition: inline; filename=\"logo-thehousefit.png\"",
		"",
		partirLineas(base64.StdEncoding.EncodeToString(logo)),
		"--"+limite+"--",
		"",
	)
	return strings.Join(cabeceras, "\r\n")
}

// EnviarCorreoSMTP envia un correo HTML usando STARTTLS (por ejemplo smtp.gmail.com:587).
func EnviarCorreoSMTP(destinatario string, asunto string, cuerpoHTML string) error {
	return EnviarCorreoSMTPConLogo(destinatario, asunto, cuerpoHTML, nil)
}

// EnviarCorreoSMTPConLogo envia un correo HTML e incluye un logo PNG inline (cid:logo-thehousefit).
func EnviarCorreoSMTPConLogo(destinatario string, asunto string, cuerpoHTML string, logo []byte) error {
	destinatarioLimpio := limpiarCabecera(destinatario)
	asuntoLimpio := limpiarCabecera(asunto)
	if destinatarioLimpio == "" {
		return fmt.Errorf("el destinatario es obligatorio")
	}
	if asuntoLimpio == "" {
		return fmt.Errorf("el asunto es obligatorio")
	}

	cfg := LeerConfigSMTP()
	if cfg.Usuario == "" || cfg.Clave == "" {
		return fmt.Errorf("configura smtp_usuario y smtp_clave (o THF_SMTP_USER y THF_SMTP_PASS)")
	}

	mensaje := ArmarCorreoSMTP(cfg.Remitente, destinatarioLimpio, asuntoLimpio, cuerpoHTML, logo)
	autenticacion := smtp.PlainAuth("", cfg.Usuario, cfg.Clave, cfg.Host)
	direccion := cfg.Host + ":" + cfg.Puerto

	if err := smtp.SendMail(direccion, autenticacion, cfg.Usuario, []string{destinatarioLimpio}, []byte(mensaje)); err != nil {
		return fmt.Errorf("no fue posible enviar el correo por SMTP: %w", err)
	}
	return nil
}
