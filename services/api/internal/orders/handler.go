package orders

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ratu-kriuk/api/internal/auth"
	"github.com/ratu-kriuk/api/internal/catalog"
)

type Handler struct {
	Repo        *Repository
	ProductRepo *catalog.ProductRepository
}

func NewHandler(repo *Repository, productRepo *catalog.ProductRepository) *Handler {
	return &Handler{
		Repo:        repo,
		ProductRepo: productRepo,
	}
}

func (h *Handler) CreateOrder(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userClaims, _ := c.Get("user")
	claims := userClaims.(*auth.Claims)

	var productTotal float64
	var orderItems []OrderItem

	for _, itemReq := range req.Items {
		product, err := h.ProductRepo.GetByID(itemReq.ProductID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Product %s not found", itemReq.ProductID)})
			return
		}

		subtotal := product.UnitPrice * float64(itemReq.Quantity)
		productTotal += subtotal

		orderItems = append(orderItems, OrderItem{
			ProductID:           product.ID,
			ProductNameSnapshot: product.Name,
			UnitPriceSnapshot:   product.UnitPrice,
			Quantity:            itemReq.Quantity,
			Subtotal:            subtotal,
		})
	}

	order := &Order{
		Source:       "MANUAL",
		CustomerID:   req.CustomerID,
		OrderDate:    req.OrderDate,
		Status:       "Diproses",
		ProductTotal: productTotal,
		ShippingCost: req.ShippingCost,
		GrandTotal:   productTotal + req.ShippingCost,
		Notes:        req.Notes,
		CreatedBy:    claims.UserID,
		UpdatedBy:    claims.UserID,
	}

	if err := h.Repo.Create(context.Background(), order, orderItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": order})
}

func (h *Handler) GetOrders(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	orders, err := h.Repo.GetAll(context.Background(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func (h *Handler) GetOrder(c *gin.Context) {
	id := c.Param("id")
	order, items, err := h.Repo.GetByID(context.Background(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  order,
		"items": items,
	})
}

func (h *Handler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userClaims, _ := c.Get("user")
	claims := userClaims.(*auth.Claims)

	order, _, err := h.Repo.GetByID(context.Background(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// Simple state validation logic can be added here
	if err := h.Repo.UpdateStatus(context.Background(), id, order.Status, req.NewStatus, claims.UserID, req.Note); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully"})
}