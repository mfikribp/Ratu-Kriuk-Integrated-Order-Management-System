package http

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/ratu-kriuk/api/internal/auth"
	"github.com/ratu-kriuk/api/internal/catalog"
	"github.com/ratu-kriuk/api/internal/imports"
	"github.com/ratu-kriuk/api/internal/orders"
)

func SetupRouter(db *sql.DB) *gin.Engine {
	router := gin.New()

	authHandler := auth.NewHandler(db)
	productRepo := catalog.NewProductRepository(db)
	customerRepo := catalog.NewCustomerRepository(db)
	catalogHandler := catalog.NewHandler(productRepo, customerRepo)
	ordersHandler := orders.NewHandler(
		orders.NewRepository(db),
		productRepo,
	)
	importsHandler := imports.NewHandler(
		imports.NewRepository(db, productRepo, customerRepo),
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

				admin.POST("/orders", ordersHandler.CreateOrder)
				admin.GET("/orders", ordersHandler.GetOrders)
				admin.GET("/orders/:id", ordersHandler.GetOrder)
				admin.PATCH("/orders/:id/status", ordersHandler.UpdateStatus)

				admin.POST("/imports", importsHandler.Upload)
				admin.GET("/imports/:id", importsHandler.GetJobStatus)
				admin.GET("/imports/:id/rows", importsHandler.GetJobResults)
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