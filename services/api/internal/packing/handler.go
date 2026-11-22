package packing

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ratu-kriuk/api/internal/auth"
)

type Handler struct {
	Repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{Repo: repo}
}

func (h *Handler) GetPackingList(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	orders, err := h.Repo.GetPackingList(context.Background(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch packing list"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func (h *Handler) GetPackingDetail(c *gin.Context) {
	orderID := c.Param("id")

	detail, err := h.Repo.GetPackingDetail(context.Background(), orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found or not ready for packing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": detail})
}

func (h *Handler) MarkPacked(c *gin.Context) {
	orderID := c.Param("id")

	var req MarkPackedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userClaims, _ := c.Get("user")
	claims := userClaims.(*auth.Claims)

	if err := h.Repo.MarkPacked(context.Background(), orderID, claims.UserID, req.Note); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark order as packed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order marked as packed successfully"})
}