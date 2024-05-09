package domain

import (
	"time"
)

type Store struct {
	ID      string
	Name    string
	Address string // Address
	Phone   string
}

type Promotion struct {
	ID        string
	StoreID   string
	ProductID string
	Price     float64
	Quantity  float32
	CreatedAt time.Time
	ExpiresAt time.Time
}

type Product struct {
	ID          string
	Name        string
	Description string
	Price       float64
	Unit        string
	Promotion   *Promotion
}

func (pt *Product) GetTotal() (float64, error) {
	if pt.Promotion == nil {
		return pt.Price, nil
	}
	return pt.Promotion.Price, nil
}
