package catalog

import (
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

	customer := &Customer{
		Name:                 req.Name,
		Phone:                req.Phone,
		Address:              req.Address,
		CityRegionPostalCode: req.CityRegionPostalCode,
	}

	if err := h.CustomerRepo.Create(customer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create customer"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": customer})
}

func (h *Handler) GetCustomers(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	customers, err := h.CustomerRepo.GetAll(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch customers"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": customers})
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
	}

	if err := h.CustomerRepo.Update(customer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update customer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": customer})
}