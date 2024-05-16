package internal

import (
	"context"
	"regexp"
	"strconv"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/pedrosantosbr/barilo/lib/logging"
	"go.uber.org/zap/zapcore"
)

const gtinRegEx = `^\d{13}$`

type Store struct {
	ID      string
	Name    string
	Address string // TODO: turn it into a value object
	Phone   string
	// Brandng // TODO: turn it into a value object
}

func (t Store) Validate() error {
	if err := validation.ValidateStruct(&t,
		validation.Field(&t.Name, validation.Required),
		validation.Field(&t.Address, validation.Required),
		validation.Field(&t.Phone), // TODO: add V.O validation
	); err != nil {
		return WrapErrorf(err, ErrorCodeInvalidArgument, "invalid values")
	}

	return nil
}

// -

type Product struct {
	ID             string
	StoreID        string
	Name           string
	Category       string
	Price          float64
	Weight         string
	ExpirationDate time.Time // TODO: consider to create a new type for dates
	Ingredients    string
	Brand          *string
	GTIN           *string
	Store          *Store
}

func (p *Product) FromCSV(ctx context.Context, csv []string) error {
	logger := logging.FromContext(ctx)
	if len(csv) != 8 {
		logger.Info("invalid csv row length", zapcore.Field{Key: "csv", Type: zapcore.ArrayMarshalerType, Interface: csv})

		return NewErrorf(ErrorCodeInvalidArgument, "invalid csv row length: [%s]", csv)
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
	if category == "" {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid category")
	}
	p.Category = category

	// Weight
	weight := csv[4]
	if weight == "" {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid weight")
	}
	p.Weight = weight

	// Ingredients
	ingredients := csv[5]
	if ingredients == "" {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid ingredients %s", ingredients)
	}
	p.Ingredients = ingredients

	// Expiration date
	expirationDate, err := time.Parse(time.DateOnly, csv[6])
	if err != nil {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid expiration date")
	}
	p.ExpirationDate = expirationDate

	// Price
	price, err := strconv.ParseFloat(csv[7], 64)
	if err != nil {
		return NewErrorf(ErrorCodeInvalidArgument, "invalid price %s", csv[7])
	}
	p.Price = price

	return nil
}

type Discount struct {
	ID            string
	StoreID       string
	DiscountPrice float64
}
