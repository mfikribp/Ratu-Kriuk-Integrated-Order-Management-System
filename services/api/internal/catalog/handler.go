package catalog

import (
	"encoding/csv"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	ProductRepo  *ProductRepository
	CustomerRepo *CustomerRepository
}

func NewHandler(productRepo *ProductRepository, customerRepo *CustomerRepository) *Handler {
	return &Handler{
		ProductRepo:  productRepo,
		CustomerRepo: customerRepo,
	}
}

func (h *Handler) CreateProduct(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product := &Product{
		SKU:         req.SKU,
		Name:        req.Name,
		Category:    req.Category,
		Description: req.Description,
		UnitPrice:   req.UnitPrice,
		IsActive:    true,
	}

	if err := h.ProductRepo.Create(product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": product})
}

func (h *Handler) GetProducts(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	products, err := h.ProductRepo.GetAll(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": products})
}

func (h *Handler) GetProduct(c *gin.Context) {
	id := c.Param("id")
	product, err := h.ProductRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": product})
}

func (h *Handler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product := &Product{
		ID:          id,
		SKU:         req.SKU,
		Name:        req.Name,
		Category:    req.Category,
		Description: req.Description,
		UnitPrice:   req.UnitPrice,
		IsActive:    true,
	}

	if err := h.ProductRepo.Update(product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": product})
}

func (h *Handler) CreateCustomer(c *gin.Context) {
	var req CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.CustomerType == "" {
		req.CustomerType = "REGULAR"
	}
	if req.CustomerType != "REGULAR" && req.CustomerType != "AGENT" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "customer_type must be REGULAR or AGENT"})
		return
	}

	customer := &Customer{
		Name:                 req.Name,
		Phone:                req.Phone,
		Address:              req.Address,
		CityRegionPostalCode: req.CityRegionPostalCode,
		CustomerType:         req.CustomerType,
		IsActive:             true,
	}

	if err := h.CustomerRepo.Create(customer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create customer"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": customer})
}

func (h *Handler) GetCustomers(c *gin.Context) {
	limit, offset, err := parsePagination(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	customerType := c.Query("type")
	if customerType != "" && customerType != "REGULAR" && customerType != "AGENT" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type must be REGULAR or AGENT"})
		return
	}
	customers, total, err := h.CustomerRepo.GetAll(limit, offset, c.Query("search"), customerType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch customers"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       customers,
		"pagination": gin.H{"total": total, "limit": limit, "offset": offset},
	})
}

func (h *Handler) ExportCustomers(c *gin.Context) {
	customerType := c.Query("type")
	if customerType != "" && customerType != "REGULAR" && customerType != "AGENT" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type must be REGULAR or AGENT"})
		return
	}

	rows, err := h.CustomerRepo.QueryAllForExport(c.Request.Context(), c.Query("search"), customerType)
	if err != nil {
		log.Printf("Failed to query customers for export: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export customers"})
		return
	}
	defer rows.Close()

	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", `attachment; filename="pelanggan.csv"`)
	if _, err := c.Writer.Write([]byte{0xEF, 0xBB, 0xBF}); err != nil {
		log.Printf("Failed to write customer export header: %v", err)
		return
	}

	writer := csv.NewWriter(c.Writer)
	if err := writer.Write([]string{"Nama", "Jenis Pelanggan", "Nomor Kontak", "Alamat", "Kota / Kode Pos", "Tanggal Dibuat"}); err != nil {
		log.Printf("Failed to write customer export columns: %v", err)
		return
	}

	for rows.Next() {
		customer, err := scanCustomer(rows)
		if err != nil {
			log.Printf("Failed to read customer for export: %v", err)
			return
		}
		customerTypeLabel := "Pelanggan Biasa"
		if customer.CustomerType == "AGENT" {
			customerTypeLabel = "Agen"
		}
		if err := writer.Write([]string{
			customer.Name,
			customerTypeLabel,
			customer.Phone,
			customer.Address,
			customer.CityRegionPostalCode,
			customer.CreatedAt.Format("2006-01-02 15:04:05"),
		}); err != nil {
			log.Printf("Failed to write customer export row: %v", err)
			return
		}
	}
	writer.Flush()
	if err := writer.Error(); err != nil {
		log.Printf("Failed to flush customer export: %v", err)
		return
	}
	if err := rows.Err(); err != nil {
		log.Printf("Failed while iterating customer export rows: %v", err)
	}
}

func (h *Handler) ArchiveExportedRegularCustomers(c *gin.Context) {
	var req struct {
		Search string `json:"search"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	archivedCount, err := h.CustomerRepo.ArchiveRegularCustomers(req.Search)
	if err != nil {
		log.Printf("Failed to archive exported regular customers: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to archive exported customers"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"archived_count": archivedCount})
}

func (h *Handler) GetCustomer(c *gin.Context) {
	id := c.Param("id")
	customer, err := h.CustomerRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": customer})
}

func (h *Handler) UpdateCustomer(c *gin.Context) {
	id := c.Param("id")
	var req CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	customer := &Customer{
		ID:                   id,
		Name:                 req.Name,
		Phone:                req.Phone,
		Address:              req.Address,
		CityRegionPostalCode: req.CityRegionPostalCode,
		CustomerType:         req.CustomerType,
	}
	if customer.CustomerType == "" {
		customer.CustomerType = "REGULAR"
	}
	if customer.CustomerType != "REGULAR" && customer.CustomerType != "AGENT" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "customer_type must be REGULAR or AGENT"})
		return
	}

	if err := h.CustomerRepo.Update(customer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update customer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": customer})
}

func parsePagination(c *gin.Context) (int, int, error) {
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if err != nil || limit < 1 || limit > 100 {
		return 0, 0, fmt.Errorf("limit must be between 1 and 100")
	}
	offset, err := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil || offset < 0 {
		return 0, 0, fmt.Errorf("offset must be zero or greater")
	}
	return limit, offset, nil
}
