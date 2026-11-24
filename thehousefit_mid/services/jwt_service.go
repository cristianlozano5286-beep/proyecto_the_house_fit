package services

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// lo que va guardado dentro del token
// roles: Administrador, Entrenador y Usuario
type Claims struct {
	ID     string `json:"id"`
	Correo string `json:"correo"`
	Nombre string `json:"nombre"`
	Rol    string `json:"rol"`
	jwt.RegisteredClaims
}

func GenerarToken(id string, correo string, nombre string, rol string) (string, error) {
	secreto := os.Getenv("THF_JWT_SECRET")
	if len(secreto) < 32 {
		return "", fmt.Errorf("configura THF_JWT_SECRET con al menos 32 caracteres")
	}

	claims := Claims{
		ID:     id,
		Correo: correo,
		Nombre: nombre,
		Rol:    rol,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secreto))
}

func ValidarToken(texto string) (*Claims, error) {
	secreto := os.Getenv("THF_JWT_SECRET")
	if len(secreto) < 32 {
		return nil, fmt.Errorf("configura THF_JWT_SECRET con al menos 32 caracteres")
	}

	token, err := jwt.ParseWithClaims(texto, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(secreto), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}), jwt.WithExpirationRequired())
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("token invalido")
	}

	return claims, nil
}
