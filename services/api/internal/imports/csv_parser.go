package imports

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"
)

type CSVParser struct{}

func NewCSVParser() *CSVParser {
	return &CSVParser{}
}

func (p *CSVParser) Parse(fileData []byte) ([]ImportRowData, error) {
	reader := csv.NewReader(bytes.NewReader(fileData))
	reader.FieldsPerRecord = -1

	rows := make([]ImportRowData, 0)

	header, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("failed to read header: %w", err)
	}

	columnMap := make(map[string]int)
	for i, col := range header {
		columnMap[strings.ToLower(strings.TrimSpace(col))] = i
	}

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to read row: %w", err)
		}

		row := ImportRowData{}

		if idx, ok := columnMap["order_number"]; ok && idx < len(record) {
			row.OrderNumber = strings.TrimSpace(record[idx])
		}
		if idx, ok := columnMap["customer_name"]; ok && idx < len(record) {
			row.CustomerName = strings.TrimSpace(record[idx])
		}
		if idx, ok := columnMap["customer_phone"]; ok && idx < len(record) {
			row.CustomerPhone = strings.TrimSpace(record[idx])
		}
		if idx, ok := columnMap["customer_address"]; ok && idx < len(record) {
			row.CustomerAddress = strings.TrimSpace(record[idx])
		}
		if idx, ok := columnMap["product_sku"]; ok && idx < len(record) {
			row.ProductSKU = strings.TrimSpace(record[idx])
		}
		if idx, ok := columnMap["product_name"]; ok && idx < len(record) {
			row.ProductName = strings.TrimSpace(record[idx])
		}
		if idx, ok := columnMap["quantity"]; ok && idx < len(record) {
			q, _ := strconv.Atoi(strings.TrimSpace(record[idx]))
			row.Quantity = q
		}
		if idx, ok := columnMap["unit_price"]; ok && idx < len(record) {
			p, _ := strconv.ParseFloat(strings.TrimSpace(record[idx]), 64)
			row.UnitPrice = p
		}
		if idx, ok := columnMap["shipping_cost"]; ok && idx < len(record) {
			s, _ := strconv.ParseFloat(strings.TrimSpace(record[idx]), 64)
			row.ShippingCost = s
		}
		if idx, ok := columnMap["order_date"]; ok && idx < len(record) {
			t, _ := time.Parse("2006-01-02", strings.TrimSpace(record[idx]))
			row.OrderDate = t
		}

		rows = append(rows, row)
	}

	return rows, nil
}