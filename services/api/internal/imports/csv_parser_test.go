package imports

import "testing"

func TestCSVParserParsesOrderNumberWithUTF8BOM(t *testing.T) {
	data := []byte("\uFEFForder_number,customer_name,product_sku,quantity\nMKP-1001,Toko,MKR-ORG,2\n")

	rows, err := NewCSVParser().Parse(data)
	if err != nil {
		t.Fatalf("Parse() error = %v", err)
	}
	if len(rows) != 1 {
		t.Fatalf("Parse() returned %d rows, want 1", len(rows))
	}
	if rows[0].OrderNumber != "MKP-1001" {
		t.Errorf("OrderNumber = %q, want %q", rows[0].OrderNumber, "MKP-1001")
	}
}
