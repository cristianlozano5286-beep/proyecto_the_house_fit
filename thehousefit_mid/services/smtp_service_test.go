package services

import (
	"strings"
	"testing"
)

func TestLeerConfigSMTPDesdeEnv(t *testing.T) {
	t.Setenv("THF_SMTP_USER", "notificaciones@thehousefit.com")
	t.Setenv("THF_SMTP_PASS", "abcd efgh ijkl mnop")
	t.Setenv("THF_SMTP_HOST", "")
	t.Setenv("THF_SMTP_PORT", "")
	t.Setenv("THF_SMTP_FROM", "")

	cfg := LeerConfigSMTP()
	if cfg.Host != "smtp.gmail.com" {
		t.Fatalf("host esperado smtp.gmail.com, obtenido %q", cfg.Host)
	}
	if cfg.Puerto != "587" {
		t.Fatalf("puerto esperado 587, obtenido %q", cfg.Puerto)
	}
	if cfg.Clave != "abcdefghijklmnop" {
		t.Fatalf("se esperaba clave sin espacios, obtenido %q", cfg.Clave)
	}
	if cfg.Remitente != "The House Fit <notificaciones@thehousefit.com>" {
		t.Fatalf("remitente inesperado: %q", cfg.Remitente)
	}
	if !SmtpConfigurado() {
		t.Fatal("se esperaba SmtpConfigurado() == true")
	}
}

func TestArmarCorreoSMTPSanitize(t *testing.T) {
	msg := ArmarCorreoSMTP("The House Fit <a@b.com>\r\n", "user@test.com\n", "Tu código\r\n", "<b>123456</b>", nil)
	if strings.Contains(msg, "From: The House Fit <a@b.com>\r\n\r\n") {
		t.Fatal("no deben quedar saltos de linea extra en cabeceras")
	}
	if !strings.Contains(msg, "To: user@test.com\r\n") {
		t.Fatalf("falta cabecera To limpia: %s", msg)
	}
	if !strings.Contains(msg, "Content-Type: text/html; charset=UTF-8\r\n") {
		t.Fatalf("falta Content-Type HTML: %s", msg)
	}

	msgConLogo := ArmarCorreoSMTP("The House Fit <a@b.com>", "user@test.com", "Código", "<img src='cid:logo-thehousefit'>", []byte{0x89, 0x50, 0x4e, 0x47})
	if !strings.Contains(msgConLogo, "Content-Type: multipart/related; boundary=limite-thehousefit-smtp") {
		t.Fatalf("debe construir multipart/related cuando hay logo")
	}
	if !strings.Contains(msgConLogo, "Content-ID: <logo-thehousefit>") {
		t.Fatalf("falta Content-ID inline para el logo")
	}
}

func TestEnviarCorreoSMTPValidacion(t *testing.T) {
	t.Setenv("THF_SMTP_USER", "")
	t.Setenv("THF_SMTP_PASS", "")

	if err := EnviarCorreoSMTP("", "Asunto", "<p>Hola</p>"); err == nil {
		t.Fatal("se esperaba error con destinatario vacio")
	}
	if err := EnviarCorreoSMTP("test@example.com", "Asunto", "<p>Hola</p>"); err == nil {
		t.Fatal("se esperaba error sin credenciales SMTP")
	}
}
