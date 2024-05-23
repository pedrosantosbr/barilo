package internal

import (
	"context"
	"regexp"
	"strconv"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

const gtinRegEx = `^\d{13}$`

type Store struct {
	ID      string
	Name    string
	Address string // TODO: turn it into a value object
	Phone   *string
	// Brandng // TODO: turn it into a value object
}

func (t Store) Validate() error {
	if err := validation.ValidateStruct(&t,
		validation.Field(&t.Name, validation.Required),
		validation.Field(&t.Address, validation.Required),
	); err != nil {
		return WrapErrorf(err, ErrorCodeInvalidArgument, "invalid values")
	}

	return nil
}

type Category struct {
	ID       string
	Name     string
	Slug     string
	ImageURL *string
}

type Product struct {
	ID             string
	StoreID        string
	Name           string
	Price          float64
	Weight         string
	ExpirationDate *time.Time // TODO: consider to create a new type for dates
	Category       *string
	ImageURL       *string
	Brand          *string
	GTIN           *string
	Store          *Store
}

func (p *Product) Validate() {
	if err := validation.ValidateStruct(p,
		validation.Field(&p.Name, validation.Required),
		validation.Field(&p.Price, validation.Required),
		validation.Field(&p.Weight, validation.Required),
	); err != nil {
		panic(err)
	}
}

func (p *Product) FromCSV(ctx context.Context, csv []string) error {
	// logger := logging.FromContext(ctx)
	if len(csv) != 7 {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid csv row length: [%d]", len(csv))
	}

	// GTIN
	gtin := csv[0]
	if gtin != "" {
		if ok := regexp.MustCompile(gtinRegEx).MatchString(gtin); !ok {
			return NewErrorf(ErrorCodeInvalidArgument, "invalid GTIN")
		}
	}
	p.GTIN = &gtin

	// Name
	p.Name = csv[1]

	// Brand
	brand := csv[2]
	if brand == "n/a" {
		p.Brand = nil
	}
	p.Brand = &brand

	// Category
	category := csv[3]
	cat := &category
	p.Category = cat

	// Weight
	weight := csv[4]
	if weight == "" {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid weight")
	}
	p.Weight = weight

	// Expiration date
	date := csv[5]
	if date == "" {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid expiration date")
	}
	expirationDate, err := time.Parse(time.DateOnly, csv[5])
	if err != nil {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid expiration date")
	}
	p.ExpirationDate = &expirationDate

	// Price
	price, err := strconv.ParseFloat(csv[6], 64)
	if err != nil {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid price %s", csv[7])
	}
	p.Price = price

	return nil
}

type Circular struct {
	ID             string
	Name           string
	StoreID        string
	ExpirationDate time.Time
	Images         []*CircularImage
}

type CircularImage struct {
	ID         string
	CircularID string
	URL        string
}

type Discount struct {
	ID         string
	ProductID  string
	CircularID string
	Price      float64
}

func (d *Discount) Validate() error {
	if err := validation.ValidateStruct(d,
		validation.Field(&d.ProductID, validation.Required),
		validation.Field(&d.CircularID, validation.Required),
		validation.Field(&d.Price, validation.Required),
	); err != nil {
		return WrapErrorf(err, ErrorCodeInvalidArgument, "invalid values")
	}

	return nil
}
