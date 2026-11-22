package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.New()

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Ratu Kriuk API is running",
		})
	})

	// Add routes here later
	// router.GET("/orders", ordersHandler)
	// router.POST("/orders", createOrderHandler)

	return router
}