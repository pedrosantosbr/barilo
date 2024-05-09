package entities

import "time"

type UnitOfPrice string

type Store struct {
	ID      string
	Name    string
	Address string // Address
	Phone   string
}

type Product struct {
	ID          string
	Name        string
	Description string
	Price       float64
	Unit        string
	Quantity    float32
	Promotion   Promotion
	PromotionID string
}

func (p *Product) GetTotalPrice() float64 {
	return p.Price - p.Promotion.CalculateDiscountedPrice()
}

type Promotion struct {
	ID           string
	StoreID      string
	ProductID    string
	Product      Product
	Discount     float64
	DiscountType string
	ExpiresAt    time.Time
}

// Calculate the discounted price of a product
func (pn *Promotion) CalculateDiscountedPrice() float64 {
	switch pn.DiscountType {
	case "percentage":
		return pn.Discount * pn.Product.Price
	case "fixed":
		return pn.Product.Price - pn.Discount
	default:
	}
}
