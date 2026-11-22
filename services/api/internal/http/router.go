package http

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/ratu-kriuk/api/internal/auth"
)

func SetupRouter(db *sql.DB) *gin.Engine {
	router := gin.New()

	authHandler := auth.NewHandler(db)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Ratu Kriuk API is running",
		})
	})

	v1 := router.Group("/api/v1")
	{
		v1.POST("/auth/login", authHandler.Login)

		protected := v1.Group("")
		protected.Use(auth.AuthMiddleware())
		{
			protected.GET("/auth/me", authHandler.Me)
			protected.POST("/auth/logout", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Logged out successfully"})
			})

			admin := protected.Group("")
			admin.Use(auth.RBAC("ADMIN"))
			{
				// TODO: Add admin routes
				admin.GET("/orders", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Admin can see orders"})
				})
			}

			packing := protected.Group("")
			packing.Use(auth.RBAC("EMPLOYEE_PACKING"))
			{
				// TODO: Add packing routes
				packing.GET("/packing/orders", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Packing employee can see packing list"})
				})
			}

			production := protected.Group("")
			production.Use(auth.RBAC("EMPLOYEE_PRODUCTION"))
			{
				// TODO: Add production routes
				production.POST("/production/batches", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Production employee can record batch"})
				})
			}
		}
	}

	return router
}