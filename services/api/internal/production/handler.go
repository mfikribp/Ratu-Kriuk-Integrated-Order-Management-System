package production

import (
	"context"
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

func (h *Handler) CreateBatch(c *gin.Context) {
	var req CreateProductionBatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userClaims, _ := c.Get("user")
	claims := userClaims.(*auth.Claims)

	batch := &ProductionBatch{
		ProductID:      req.ProductID,
		Quantity:       req.Quantity,
		ProductionDate: req.ProductionDate,
		BatchCode:      req.BatchCode,
		Notes:          req.Notes,
		RecordedBy:     claims.UserID,
	}

	if err := h.Repo.Create(context.Background(), batch); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create production batch"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": batch})
}

func (h *Handler) GetBatches(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	batches, err := h.Repo.GetAll(context.Background(), limit, offset)
	if err != nil {
		log.Printf("Failed to fetch production batches: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch batches"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": batches})
}

func (h *Handler) GetBatch(c *gin.Context) {
	id := c.Param("id")

	batch, err := h.Repo.GetByID(context.Background(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Batch not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": batch})
}
