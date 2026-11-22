package imports

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ratu-kriuk/api/internal/auth"
)

type Handler struct {
	Repo   *Repository
	Parser *CSVParser
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{
		Repo:   repo,
		Parser: NewCSVParser(),
	}
}

func (h *Handler) Upload(c *gin.Context) {
	userClaims, _ := c.Get("user")
	claims := userClaims.(*auth.Claims)

	source := c.PostForm("source")
	if source == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "source is required"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	if file.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file size exceeds 10MB"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open file"})
		return
	}
	defer src.Close()

	fileData, err := io.ReadAll(src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read file"})
		return
	}

	rows, err := h.Parser.Parse(fileData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(rows) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file contains no data rows"})
		return
	}

	job := &ImportJob{
		Source:           source,
		OriginalFilename: file.Filename,
		Status:           "PROCESSING",
		TotalRows:        len(rows),
		CreatedBy:        claims.UserID,
	}

	if err := h.Repo.CreateJob(context.Background(), job); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create import job"})
		return
	}

	successCount := 0
	failedCount := 0
	duplicateCount := 0
	newCustomerCount := 0

	for idx, rowData := range rows {
		result, err := h.Repo.ProcessImportRow(context.Background(), job.ID, claims.UserID, idx+2, rowData)
		if err != nil {
			if result == nil {
				result = &ImportRowResult{
					ImportJobID:         job.ID,
					RowNumber:           idx + 2,
					ExternalOrderNumber: rowData.OrderNumber,
				}
			}
			result.Result = "FAILED"
			result.Message = "Processing error: " + err.Error()
		}
		if result.CreatedCustomer {
			newCustomerCount++
		}

		if err := h.Repo.SaveRowResult(context.Background(), result); err != nil {
			log.Printf("Failed to save import result for row %d: %v", idx+2, err)
		}

		switch result.Result {
		case "SUCCESS":
			successCount++
		case "DUPLICATE":
			duplicateCount++
			log.Printf("Import row %d (%q) skipped: %s", idx+2, rowData.OrderNumber, result.Message)
		case "FAILED":
			failedCount++
			log.Printf("Import row %d (%q) failed: %s", idx+2, rowData.OrderNumber, result.Message)
		}
	}

	if err := h.Repo.UpdateJobStatus(context.Background(), job.ID, "COMPLETED", successCount, failedCount, duplicateCount); err != nil {
		log.Printf("Failed to update import job %s status: %v", job.ID, err)
	}

	c.JSON(http.StatusOK, ImportResponse{
		JobID:            job.ID,
		TotalRows:        len(rows),
		SuccessCount:     successCount,
		FailedCount:      failedCount,
		DuplicateCount:   duplicateCount,
		NewCustomerCount: newCustomerCount,
		Message:          fmt.Sprintf("Import completed: %d success, %d failed, %d duplicate", successCount, failedCount, duplicateCount),
	})
}

func (h *Handler) ArchiveImportedCustomers(c *gin.Context) {
	jobID := c.Param("id")
	archivedCount, err := h.Repo.ArchiveImportedCustomers(c.Request.Context(), jobID)
	if err != nil {
		log.Printf("Failed to archive customers for import job %s: %v", jobID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to archive imported customers"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"archived_count": archivedCount})
}

func (h *Handler) GetJobStatus(c *gin.Context) {
	jobID := c.Param("id")

	c.JSON(http.StatusOK, gin.H{
		"message": "Get job status for " + jobID,
	})
}

func (h *Handler) GetJobResults(c *gin.Context) {
	jobID := c.Param("id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Get results for job %s (limit: %d, offset: %d)", jobID, limit, offset),
	})
}
