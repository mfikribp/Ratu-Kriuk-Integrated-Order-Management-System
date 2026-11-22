package http

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/ratu-kriuk/api/internal/auth"
	"github.com/ratu-kriuk/api/internal/catalog"
)

func SetupRouter(db *sql.DB) *gin.Engine {
	router := gin.New()

	authHandler := auth.NewHandler(db)
	catalogHandler := catalog.NewHandler(
		catalog.NewProductRepository(db),
		catalog.NewCustomerRepository(db),
	)

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
				admin.POST("/products", catalogHandler.CreateProduct)
				admin.GET("/products", catalogHandler.GetProducts)
				admin.GET("/products/:id", catalogHandler.GetProduct)
				admin.PATCH("/products/:id", catalogHandler.UpdateProduct)

				admin.POST("/customers", catalogHandler.CreateCustomer)
				admin.GET("/customers", catalogHandler.GetCustomers)
				admin.GET("/customers/:id", catalogHandler.GetCustomer)
				admin.PATCH("/customers/:id", catalogHandler.UpdateCustomer)

				admin.GET("/orders", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Admin can see orders"})
				})
			}

			packing := protected.Group("")
			packing.Use(auth.RBAC("EMPLOYEE_PACKING"))
			{
				packing.GET("/packing/orders", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Packing employee can see packing list"})
				})
			}

			production := protected.Group("")
			production.Use(auth.RBAC("EMPLOYEE_PRODUCTION"))
			{
				production.POST("/production/batches", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Production employee can record batch"})
				})
			}
		}
	}

	return router
}