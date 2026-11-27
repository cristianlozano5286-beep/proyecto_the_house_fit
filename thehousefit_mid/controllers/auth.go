package controllers

import (
	"crypto/rand"
	"crypto/subtle"
	"fmt"
	"html"
	"math/big"
	"net/mail"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	beego "github.com/beego/beego/v2/server/web"
	"golang.org/x/crypto/bcrypt"

	"thehousefit_mid/models"
	"thehousefit_mid/services"
)

// los codigos se guardan en la ram, no en la base
var codigos = make(map[claveCodigo]models.CodigoVerificacion)

// candado para que no se crucen las peticiones
var candadoCodigos sync.Mutex

type claveCodigo struct {
	correo    string
	proposito string
}

const (
	verificacion = "verificacion"
	recuperacion = "recuperacion"
)

const maximoIntentos = 5

type AuthController struct {
	beego.Controller
}

// POST /api/v1/auth/login
func (c *AuthController) Login() {
	var solicitud models.SolicitudLogin

	if !leerCuerpo(&c.Controller, &solicitud) {
		return
	}

	correo := limpiarCorreo(solicitud.Correo)

	usuario, err := buscarUsuarioPorCorreo(correo)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}

	// el mismo mensaje si el correo no existe o la contraseña esta mal
	if usuario == nil || bcrypt.CompareHashAndPassword([]byte(usuario.Password), []byte(solicitud.Password)) != nil {
		responderError(&c.Controller, 401, "Correo o contraseña incorrectos.")
		return
	}

	if !usuario.CorreoVerificado {
		responder(&c.Controller, 403, map[string]interface{}{
			"ok":                   false,
			"mensaje":              "Primero verifica tu correo.",
			"requiereVerificacion": true,
		})
		return
	}

	respuesta, err := armarSesion(usuario)
	if err != nil {
		responderError(&c.Controller, 500, "No se pudo crear el token.")
		return
	}

	responder(&c.Controller, 200, respuesta)
}

// POST /api/v1/auth/registro
func (c *AuthController) Registro() {
	var solicitud models.SolicitudRegistro

	if !leerCuerpo(&c.Controller, &solicitud) {
		return
	}

	nombre := strings.TrimSpace(solicitud.Nombre)
	correo := limpiarCorreo(solicitud.Correo)

	if nombre == "" {
		responderError(&c.Controller, 400, "El nombre es obligatorio.")
		return
	}

	_, err := mail.ParseAddress(correo)
	if err != nil {
		responderError(&c.Controller, 400, "El correo no tiene un formato válido.")
		return
	}

	if len(solicitud.Password) < 6 {
		responderError(&c.Controller, 400, "La contraseña debe tener mínimo 6 caracteres.")
		return
	}

	if len(solicitud.Password) > 72 {
		responderError(&c.Controller, 400, "La contraseña es demasiado larga.")
		return
	}

	existente, err := buscarUsuarioPorCorreo(correo)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}
	if existente != nil {
		responderError(&c.Controller, 409, "Ese correo ya está registrado.")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(solicitud.Password), bcrypt.DefaultCost)
	if err != nil {
		responderError(&c.Controller, 500, "No se pudo proteger la contraseña.")
		return
	}

	rol := strings.TrimSpace(solicitud.Rol)
	if rol == "" {
		rol = "Usuario"
	} else if rol == "Creador Gym" {
		rol = "Creador gym"
	}
	if rol != "Usuario" && rol != "Creador gym" {
		responderError(&c.Controller, 400, "Solo puedes registrarte como Usuario o Creador gym.")
		return
	}

	nuevo := models.Usuario{
		Nombre:           nombre,
		Correo:           correo,
		Password:         string(hash),
		Rol:              rol,
		CorreoVerificado: false,
	}

	err = services.NuevoServicioCrud().Crear("usuarios", nuevo, nil)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}

	mensaje := "Cuenta creada. Te enviamos un código al correo."
	if err := enviarCodigo(claveCodigo{correo, verificacion}, nombre); err != nil {
		mensaje = "Cuenta creada. No pudimos enviar el código. Usa Reenviar código para volver a intentarlo."
	}
	responder(&c.Controller, 201, map[string]interface{}{"ok": true, "mensaje": mensaje})
}

// POST /api/v1/auth/codigo
// sirve para pedir otro codigo de verificacion
func (c *AuthController) PedirCodigo() {
	var solicitud models.SolicitudCorreo

	if !leerCuerpo(&c.Controller, &solicitud) {
		return
	}

	correo := limpiarCorreo(solicitud.Correo)

	usuario, err := buscarUsuarioPorCorreo(correo)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}
	if usuario == nil {
		responderError(&c.Controller, 404, "No existe una cuenta con ese correo.")
		return
	}

	if usuario.CorreoVerificado {
		responderError(&c.Controller, 409, "La cuenta ya está verificada.")
		return
	}
	if err := enviarCodigo(claveCodigo{correo, verificacion}, usuario.Nombre); err != nil {
		responderError(&c.Controller, err.estado, err.mensaje)
		return
	}
	responder(&c.Controller, 200, map[string]interface{}{"ok": true, "mensaje": "Te enviamos un código al correo."})
}

// POST /api/v1/auth/verificar
func (c *AuthController) VerificarCodigo() {
	var solicitud models.SolicitudVerificar

	if !leerCuerpo(&c.Controller, &solicitud) {
		return
	}

	correo := limpiarCorreo(solicitud.Correo)

	if !comprobarCodigo(&c.Controller, claveCodigo{correo, verificacion}, solicitud.Codigo) {
		return
	}

	usuario, err := buscarUsuarioPorCorreo(correo)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}
	if usuario == nil {
		responderError(&c.Controller, 404, "No existe una cuenta con ese correo.")
		return
	}

	cambios := map[string]interface{}{"correoVerificado": true}
	err = services.NuevoServicioCrud().Actualizar("usuarios", strconv.Itoa(usuario.Id), cambios, nil)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}
	usuario.CorreoVerificado = true

	respuesta, err := armarSesion(usuario)
	if err != nil {
		responderError(&c.Controller, 500, "No se pudo crear el token.")
		return
	}

	responder(&c.Controller, 200, respuesta)
}

// POST /api/v1/auth/recuperar
func (c *AuthController) Recuperar() {
	var solicitud models.SolicitudCorreo

	if !leerCuerpo(&c.Controller, &solicitud) {
		return
	}

	correo := limpiarCorreo(solicitud.Correo)
	if _, err := mail.ParseAddress(correo); err != nil {
		responderError(&c.Controller, 400, "Ingresa un correo electrónico con formato válido.")
		return
	}

	usuario, err := buscarUsuarioPorCorreo(correo)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}
	if usuario == nil {
		responderError(&c.Controller, 404, "No existe ninguna cuenta registrada con ese correo.")
		return
	}

	if errEnvio := enviarCodigo(claveCodigo{correo, recuperacion}, usuario.Nombre); errEnvio != nil {
		responderError(&c.Controller, errEnvio.estado, errEnvio.mensaje)
		return
	}

	responder(&c.Controller, 200, map[string]interface{}{
		"ok":      true,
		"mensaje": "Te enviamos un código de 6 dígitos a tu correo electrónico.",
	})
}

// POST /api/v1/auth/recuperar/verificar
// Valida que el codigo de recuperacion sea correcto y vigente sin consumirlo todavia,
// para que el paso siguiente (POST /api/v1/auth/restablecer) guarde la nueva contraseña.
func (c *AuthController) VerificarRecuperacion() {
	var solicitud models.SolicitudVerificar

	if !leerCuerpo(&c.Controller, &solicitud) {
		return
	}

	correo := limpiarCorreo(solicitud.Correo)
	if !comprobarCodigoModo(&c.Controller, claveCodigo{correo, recuperacion}, solicitud.Codigo, false) {
		return
	}

	responder(&c.Controller, 200, map[string]interface{}{
		"ok":      true,
		"mensaje": "Código verificado correctamente. Ahora ingresa tu nueva contraseña.",
	})
}

// POST /api/v1/auth/restablecer
func (c *AuthController) Restablecer() {
	var solicitud models.SolicitudRestablecer

	if !leerCuerpo(&c.Controller, &solicitud) {
		return
	}

	correo := limpiarCorreo(solicitud.Correo)

	if len(solicitud.NuevaPassword) < 6 {
		responderError(&c.Controller, 400, "La contraseña debe tener mínimo 6 caracteres.")
		return
	}

	if len(solicitud.NuevaPassword) > 72 {
		responderError(&c.Controller, 400, "La contraseña es demasiado larga.")
		return
	}

	if !comprobarCodigo(&c.Controller, claveCodigo{correo, recuperacion}, solicitud.Codigo) {
		return
	}

	usuario, err := buscarUsuarioPorCorreo(correo)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}
	if usuario == nil {
		responderError(&c.Controller, 404, "No existe una cuenta con ese correo.")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(solicitud.NuevaPassword), bcrypt.DefaultCost)
	if err != nil {
		responderError(&c.Controller, 500, "No se pudo proteger la contraseña.")
		return
	}

	// si pudo usar el codigo, el correo es suyo
	cambios := map[string]interface{}{
		"password":         string(hash),
		"correoVerificado": true,
	}
	err = services.NuevoServicioCrud().Actualizar("usuarios", strconv.Itoa(usuario.Id), cambios, nil)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}

	responder(&c.Controller, 200, map[string]interface{}{
		"ok":      true,
		"mensaje": "Tu contraseña fue cambiada.",
	})
}

// GET /api/v1/auth/perfil
func (c *AuthController) Perfil() {
	sesion, valido := exigirSesion(&c.Controller)
	if !valido {
		return
	}

	var usuario models.Usuario
	err := services.NuevoServicioCrud().Obtener("usuarios", sesion.ID, &usuario)
	if err != nil {
		errorCrud(&c.Controller, err)
		return
	}

	responder(&c.Controller, 200, models.UsuarioAuth{
		Id:         usuario.Id,
		Nombre:     usuario.Nombre,
		Correo:     usuario.Correo,
		Rol:        usuario.Rol,
		FotoPerfil: usuario.FotoPerfil,
	})
}

// PUT /api/v1/auth/perfil
func (c *AuthController) ActualizarPerfil() {
	sesion, valido := exigirSesion(&c.Controller)
	if !valido {
		return
	}

	var solicitud models.SolicitudActualizarPerfil
	if !leerCuerpo(&c.Controller, &solicitud) {
		return
	}

	cambios := map[string]interface{}{}

	if solicitud.Nombre != nil {
		nombre := strings.TrimSpace(*solicitud.Nombre)
		if len(nombre) < 2 || len(nombre) > 100 {
			responderError(&c.Controller, 400, "El nombre debe tener entre 2 y 100 caracteres.")
			return
		}
		cambios["nombre"] = nombre
	}

	if solicitud.FotoPerfil != nil {
		foto := strings.TrimSpace(*solicitud.FotoPerfil)
		if len(foto) > 1500000 {
			responderError(&c.Controller, 400, "La imagen es demasiado grande. Usa una foto menor a 1.5 MB.")
			return
		}
		if foto != "" &&
			!strings.HasPrefix(foto, "data:image/") &&
			!strings.HasPrefix(foto, "http://") &&
			!strings.HasPrefix(foto, "https://") &&
			!strings.HasPrefix(foto, "assets/") {
			responderError(&c.Controller, 400, "Formato de imagen de perfil no válido.")
			return
		}
		cambios["fotoPerfil"] = foto
	}

	if len(cambios) == 0 {
		responderError(&c.Controller, 400, "No se enviaron cambios para actualizar el perfil.")
		return
	}

	var actualizado models.Usuario
	if err := services.NuevoServicioCrud().Actualizar("usuarios", sesion.ID, cambios, &actualizado); err != nil {
		errorCrud(&c.Controller, err)
		return
	}

	responder(&c.Controller, 200, models.UsuarioAuth{
		Id:         actualizado.Id,
		Nombre:     actualizado.Nombre,
		Correo:     actualizado.Correo,
		Rol:        actualizado.Rol,
		FotoPerfil: actualizado.FotoPerfil,
	})
}

// ---------- funciones de apoyo ----------

func limpiarCorreo(correo string) string {
	return strings.ToLower(strings.TrimSpace(correo))
}

// busca en el CRUD al usuario con ese correo, devuelve nil si no existe
func buscarUsuarioPorCorreo(correo string) (*models.Usuario, error) {
	var usuarios []models.Usuario

	err := services.NuevoServicioCrud().Listar("usuarios", &usuarios)
	if err != nil {
		return nil, err
	}

	for i := range usuarios {
		if strings.ToLower(usuarios[i].Correo) == correo {
			return &usuarios[i], nil
		}
	}

	return nil, nil
}

// arma la respuesta del login: el token y los datos de la sesion
func armarSesion(usuario *models.Usuario) (map[string]interface{}, error) {
	token, err := services.GenerarToken(strconv.Itoa(usuario.Id), usuario.Correo, usuario.Nombre, usuario.Rol)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"token": token,
		"usuario": models.UsuarioAuth{
			Id:         usuario.Id,
			Nombre:     usuario.Nombre,
			Correo:     usuario.Correo,
			Rol:        usuario.Rol,
			FotoPerfil: usuario.FotoPerfil,
		},
	}, nil
}

type errorEnvio struct {
	estado  int
	mensaje string
}

func enviarCodigo(clave claveCodigo, nombre string) *errorEnvio {
	codigo, err := generarCodigo()
	if err != nil {
		return &errorEnvio{500, "No se pudo generar el código."}
	}
	ahora := time.Now()
	candadoCodigos.Lock()
	for k, anterior := range codigos {
		if !anterior.Vence.After(ahora) {
			delete(codigos, k)
		}
	}
	if anterior, existe := codigos[clave]; existe && ahora.Sub(anterior.Creado) < 30*time.Second {
		candadoCodigos.Unlock()
		return &errorEnvio{429, "Espera unos segundos para pedir otro código."}
	}
	codigos[clave] = models.CodigoVerificacion{Codigo: codigo, Creado: ahora, Vence: ahora.Add(10 * time.Minute)}
	candadoCodigos.Unlock()

	if err := mandarCodigo(clave.correo, codigo, nombre, clave.proposito); err != nil {
		candadoCodigos.Lock()
		if guardado := codigos[clave]; guardado.Creado == ahora {
			delete(codigos, clave)
		}
		candadoCodigos.Unlock()
		fmt.Printf("Error de entrega de código: %v\n", err)
		return &errorEnvio{502, "No pudimos enviar el código. Inténtalo de nuevo."}
	}

	candadoCodigos.Lock()
	if guardado := codigos[clave]; guardado.Creado == ahora {
		guardado.Activo = true
		codigos[clave] = guardado
	}
	candadoCodigos.Unlock()
	return nil
}

func comprobarCodigo(c *beego.Controller, clave claveCodigo, codigo string) bool {
	return comprobarCodigoModo(c, clave, codigo, true)
}

func comprobarCodigoModo(c *beego.Controller, clave claveCodigo, codigo string, consumirSiCoincide bool) bool {
	codigo = strings.TrimSpace(codigo)
	if clave.correo == "" || codigo == "" {
		responderError(c, 400, "El correo y el código son obligatorios.")
		return false
	}

	candadoCodigos.Lock()
	guardado := codigos[clave]
	if !guardado.Activo || !guardado.Vence.After(time.Now()) {
		candadoCodigos.Unlock()
		responderError(c, 401, "Ese código ya no sirve o venció. Pide uno nuevo.")
		return false
	}

	coincide := subtle.ConstantTimeCompare([]byte(codigo), []byte(guardado.Codigo)) == 1
	if coincide {
		if consumirSiCoincide {
			guardado.Activo = false
		}
	} else {
		guardado.Intentos++
		guardado.Activo = guardado.Intentos < maximoIntentos
	}
	codigos[clave] = guardado
	candadoCodigos.Unlock()

	if !coincide {
		responderError(c, 401, "El código no coincide o ya no sirve.")
	}
	return coincide
}

func generarCodigo() (string, error) {
	numero, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", numero.Int64()+100000), nil
}

func mandarCodigo(correo string, codigo string, nombre string, proposito string) error {
	if !beego.AppConfig.DefaultBool("enviar_correo", false) {
		if beego.BConfig.RunMode == "dev" && beego.AppConfig.DefaultBool("codigos_en_consola", false) {
			fmt.Printf("Código de desarrollo para %s: %s\n", correo, codigo)
			return nil
		}
		return fmt.Errorf("el correo de verificación está deshabilitado")
	}

	plantilla, err := os.ReadFile("templates/correo_codigo.html")
	if err != nil {
		return err
	}

	saludo := "Hola,"
	if strings.TrimSpace(nombre) != "" {
		saludo = "Hola, " + html.EscapeString(strings.Fields(nombre)[0])
	}

	asunto := "Confirma tu correo · The House Fit"
	etiqueta := "Verificación de cuenta"
	subtitulo := "Gracias por unirte a The House Fit. Ingresa este código de 6 dígitos para confirmar tu correo electrónico y activar tu acceso:"
	if proposito == recuperacion {
		asunto = "Código para restablecer tu contraseña · The House Fit"
		etiqueta = "Recuperación segura"
		subtitulo = "Recibimos una solicitud para cambiar la contraseña de tu cuenta. Ingresa este código de 6 dígitos en la plataforma para continuar:"
	}

	cuerpo := string(plantilla)
	cuerpo = strings.ReplaceAll(cuerpo, "{{ASUNTO}}", html.EscapeString(asunto))
	cuerpo = strings.ReplaceAll(cuerpo, "{{ETIQUETA}}", html.EscapeString(etiqueta))
	cuerpo = strings.ReplaceAll(cuerpo, "{{SALUDO}}", saludo)
	cuerpo = strings.ReplaceAll(cuerpo, "{{SUBTITULO}}", html.EscapeString(subtitulo))
	cuerpo = strings.ReplaceAll(cuerpo, "{{CODIGO}}", codigo)

	if services.SmtpConfigurado() {
		return services.EnviarCorreoSMTP(correo, asunto, cuerpo)
	}

	if os.Getenv("THF_GMAIL_CREDENTIALS") != "" && os.Getenv("THF_GMAIL_TOKEN") != "" {
		servicioGmail, err := services.NuevoServicioGmail()
		if err != nil {
			return err
		}
		_, err = servicioGmail.EnviarCorreo(correo, asunto, cuerpo, nil)
		return err
	}

	if beego.BConfig.RunMode == "dev" && beego.AppConfig.DefaultBool("codigos_en_consola", false) {
		fmt.Printf("Código de desarrollo para %s (configura SMTP para enviarlo al correo): %s\n", correo, codigo)
		return nil
	}

	return fmt.Errorf("configura SMTP (smtp_usuario / smtp_clave) o Gmail OAuth para enviar correos")
}

// GET /api/v1/apk/TheHouseFit.apk
func (c *AuthController) DescargarApk() {
	rutas := []string{
		"../proyecto_the_house_fit/THE_HOUSE_FIT/public/TheHouseFit.apk",
		"../proyecto_the_house_fit/THE_HOUSE_FIT/android/app/build/outputs/apk/debug/app-debug.apk",
	}
	for _, ruta := range rutas {
		datos, err := os.ReadFile(ruta)
		if err == nil && len(datos) > 0 {
			c.Ctx.Output.Header("Content-Type", "application/vnd.android.package-archive")
			c.Ctx.Output.Header("Content-Disposition", `attachment; filename="TheHouseFit.apk"`)
			c.Ctx.Output.Header("Cache-Control", "no-store, no-cache, must-revalidate")
			c.Ctx.Output.Header("Content-Length", strconv.Itoa(len(datos)))
			_ = c.Ctx.Output.Body(datos)
			return
		}
	}
	responderError(&c.Controller, 404, "El archivo APK aún se está compilando, intenta de nuevo en unos segundos.")
}
