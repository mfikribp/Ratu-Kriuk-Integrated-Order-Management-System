package auth

import (
	"crypto/rand"
	"encoding/hex"

	"golang.org/x/crypto/argon2"
)

func HashPassword(password string) (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	hash := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
	hashStr := hex.EncodeToString(hash)
	saltStr := hex.EncodeToString(salt)

	return saltStr + ":" + hashStr, nil
}

func VerifyPassword(storedHash, password string) bool {
	parts := make([]string, 2)
	n, _ := 0, 0
	for i, ch := range storedHash {
		if ch == ':' {
			parts[0] = storedHash[:i]
			parts[1] = storedHash[i+1:]
			break
		}
	}

	if len(parts) != 2 {
		return false
	}

	salt := make([]byte, hex.DecodedLen(len(parts[0])))
	_, err := hex.Decode(salt, []byte(parts[0]))
	if err != nil {
		return false
	}

	hash := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
	hashStr := hex.EncodeToString(hash)

	return hashStr == parts[1]
}