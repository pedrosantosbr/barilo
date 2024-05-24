package internal

import (
	"context"
	"regexp"
	"strconv"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/pedrosantosbr/barilo/lib/logging"
	"go.uber.org/zap"
)

const gtinRegEx = `^\d{13}$`
const priceRegEx = `^\d{1,6}(\.\d{2})?$`

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
	Price          uint64
	Weight         string
	ExpirationDate *time.Time // TODO: consider to create a new type for dates
	Category       *string
	ImageURL       *string
	Brand          *string
	GTIN           *string
	Store          *Store
}

func (p *Product) Validate() error {
	if err := validation.ValidateStruct(p,
		validation.Field(&p.Name, validation.Required),
		validation.Field(&p.Price, validation.Required),
		validation.Field(&p.Weight, validation.Required),
	); err != nil {
		return WrapErrorf(err, ErrorCodeInvalidArgument, "invalid values")
	}
	return nil
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
	price, err := strconv.ParseUint(csv[6], 10, 2)
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

func (c *Circular) Validate() error {
	if err := validation.ValidateStruct(c,
		validation.Field(&c.Name, validation.Required),
		validation.Field(&c.StoreID, validation.Required),
		validation.Field(&c.ExpirationDate, validation.Required),
	); err != nil {
		return WrapErrorf(err, ErrorCodeInvalidArgument, "invalid values")
	}

	return nil
}

func (c *Circular) ProductFromCSV(ctx context.Context, p *Product, csv []string) error {
	logger := logging.FromContext(ctx)

	if len(csv) != 4 {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid csv row length: [%d]", len(csv))
	}

	// Product Name
	name := csv[0]
	if name == "" {
		return NewErrorf(ErrorCodeInvalidArgument, "name field is required")
	}
	p.Name = csv[0]

	// Brand
	brand := csv[1]
	if brand == "" {
		p.Brand = nil
	} else {
		p.Brand = &brand
	}

	// Weight
	weight := csv[2]
	if weight == "" {
		return NewErrorf(ErrorCodeInvalidArgument, "weight field is required")
	}
	p.Weight = weight

	// Price
	price := csv[3]
	if price == "" {
		return NewErrorf(ErrorCodeInvalidArgument, "price field is required")
	}
	match, err := regexp.MatchString(priceRegEx, price)
	if err != nil {
		logger.Error("regex.MatchString", zap.Error(err))
		return NewErrorf(ErrorCodeInvalidArgument, "invalid price value: %s", price)
	}
	if !match {
		logger.Error("error matching price regex", zap.Error(err))
		return NewErrorf(ErrorCodeInvalidArgument, "invalid price value: %s", price)
	}
	floatValue, err := strconv.ParseFloat(price, 64)
	if err != nil {
		logger.Error("error parsing string to floatValue", zap.Error(err))
		return NewErrorf(ErrorCodeInvalidArgument, "invalid price value: %s", csv[3])
	}
	uintValue := uint64(floatValue * 100)
	p.Price = uintValue

	return nil
}

// -
type CircularImage struct {
	ID         string
	CircularID string
	URL        string
}

type Discount struct {
	ID         string
	ProductID  string
	CircularID string
	Price      uint64
	Product    *Product
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