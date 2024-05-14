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

type Offer struct {
	ID        string
	StoreID   string
	ProductID string
	Price     float64
	CreatedAt time.Time
	ExpiresAt time.Time
}

type Product struct {
	ID          string
	Name        string
	Description string
	Price       float64
	Unit        string
	Offer       *Offer
}

func (pt *Product) GetTotal() (float64, error) {
	if pt.Offer == nil {
		return pt.Price, nil
	}
	return pt.Offer.Price, nil
}
