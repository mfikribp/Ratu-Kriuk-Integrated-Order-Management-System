package auth

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	DB *sql.DB
}

func NewHandler(db *sql.DB) *Handler {
	return &Handler{DB: db}
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user User
	var storedHash string
	query := "SELECT id, username, password_hash, role, full_name, is_active FROM users WHERE username = ?"
	err := h.DB.QueryRowContext(c, query, req.Username).Scan(
		&user.ID, &user.Username, &storedHash, &user.Role, &user.FullName, &user.IsActive,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if !user.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "Account is disabled"})
		return
	}

	if !VerifyPassword(storedHash, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	tokenClaims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
	}

	token, err := GenerateToken(tokenClaims)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		ID:       user.ID,
		Username: user.Username,
		Role:     user.Role,
		FullName: user.FullName,
		Token:    token.Token,
	})
}

func (h *Handler) Me(c *gin.Context) {
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": claims})
}