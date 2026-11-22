package auth

import "time"

type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	PasswordHash string `json:"-"`
	Role      string    `json:"role"` // ADMIN, EMPLOYEE_PACKING, EMPLOYEE_PRODUCTION
	FullName  string    `json:"full_name"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	FullName string `json:"full_name"`
	Token    string `json:"token,omitempty"`
}

type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}