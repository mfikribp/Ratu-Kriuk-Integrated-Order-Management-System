package http

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/ratu-kriuk/api/internal/auth"
	"github.com/ratu-kriuk/api/internal/catalog"
	"github.com/ratu-kriuk/api/internal/imports"
	"github.com/ratu-kriuk/api/internal/orders"
	"github.com/ratu-kriuk/api/internal/packing"
	"github.com/ratu-kriuk/api/internal/production"
)

func corsMiddleware() gin.HandlerFunc {
	allowedOrigins := map[string]bool{
		"http://localhost:3000": true,
		"http://127.0.0.1:3000": true,
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if allowedOrigins[origin] {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Vary", "Origin")
			c.Header("Access-Control-Allow-Credentials", "true")
		}
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func SetupRouter(db *sql.DB) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery(), corsMiddleware())

	authHandler := auth.NewHandler(db)
	productRepo := catalog.NewProductRepository(db)
	customerRepo := catalog.NewCustomerRepository(db)
	catalogHandler := catalog.NewHandler(productRepo, customerRepo)
	orderRepo := orders.NewRepository(db)
	ordersHandler := orders.NewHandler(orderRepo, productRepo)
	importsHandler := imports.NewHandler(
		imports.NewRepository(db, productRepo, customerRepo),
	)
	packingHandler := packing.NewHandler(
		packing.NewRepository(db, orderRepo, customerRepo),
	)
	productionHandler := production.NewHandler(
		production.NewRepository(db, productRepo),
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
				packing.GET("/packing/orders", packingHandler.GetPackingList)
				packing.GET("/packing/orders/:id", packingHandler.GetPackingDetail)
				packing.POST("/packing/orders/:id/mark-packed", packingHandler.MarkPacked)
			}

			production := protected.Group("")
			production.Use(auth.RBAC("EMPLOYEE_PRODUCTION", "ADMIN"))
			{
				production.POST("/production/batches", productionHandler.CreateBatch)
				production.GET("/production/batches", productionHandler.GetBatches)
				production.GET("/production/batches/:id", productionHandler.GetBatch)
			}
		}
	}

	return router
}