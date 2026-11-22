package packing

import (
	"context"
	"database/sql"
	"errors"
	"log"
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
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if err != nil || limit < 1 || limit > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "limit must be between 1 and 100"})
		return
	}
	offset, err := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil || offset < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "offset must be zero or greater"})
		return
	}
	status := c.DefaultQuery("status", "Diproses")
	if status != "Diproses" && status != "Dikemas" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status must be Diproses or Dikemas"})
		return
	}

	orders, total, err := h.Repo.GetPackingList(c.Request.Context(), limit, offset, status, c.Query("search"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch packing list"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       orders,
		"pagination": gin.H{"total": total, "limit": limit, "offset": offset},
	})
}

func (h *Handler) GetPackingDetail(c *gin.Context) {
	orderID := c.Param("id")

	detail, err := h.Repo.GetPackingDetail(context.Background(), orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) || errors.Is(err, ErrOrderNotInPackingStatus) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found or not in a packing status"})
			return
		}
		log.Printf("Failed to fetch packing detail for order %s: %v", orderID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch packing detail"})
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
