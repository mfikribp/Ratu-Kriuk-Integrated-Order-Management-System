package auth

import (
	"crypto/rand"
	"time"

	"github.com/dgrijalva/jwt-go"
)

var jwtSecret []byte

func init() {
	jwtSecret = make([]byte, 32)
	rand.Read(jwtSecret)
}

type Token struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
}

type CustomClaims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.StandardClaims
}

func GenerateToken(c *Claims) (*Token, error) {
	claims := &CustomClaims{
		UserID:   c.UserID,
		Username: c.Username,
		Role:     c.Role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return nil, err
	}

	return &Token{
		Token:     tokenString,
		ExpiresAt: time.Unix(claims.StandardClaims.ExpiresAt, 0),
	}, nil
}

func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	claims, ok := token.Claims.(*CustomClaims)
	if !ok {
		return nil, err
	}

	return &Claims{
		UserID:   claims.UserID,
		Username: claims.Username,
		Role:     claims.Role,
	}, nil
}