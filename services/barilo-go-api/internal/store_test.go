package internal_test

import (
	"context"
	"testing"

	"github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/lib/logging"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func SetUp() context.Context {
	// Set logger
	logger, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	ctx := context.Background()
	ctx = logging.WithLogger(ctx, logger)
	return ctx
}

func TestProduct_FromCSV(t *testing.T) {
	t.Parallel()

	ctx := SetUp()

	t.Run("valid csv row", func(t *testing.T) {
		t.Parallel()

		row := []string{"7891000055123", "test-name", "test-brand", "test-category", "test-weight", "test-ingredientes", "2024-12-25", "23.99"}

		p := internal.Product{}
		err := p.FromCSV(ctx, row)
		assert.NoError(t, err)

		// GTIN
		assert.NotNil(t, p.GTIN)
		assert.Equal(t, "7891000055123", *p.GTIN)

		// Name
		assert.Equal(t, "test-name", p.Name)

		// Brand
		assert.NotNil(t, p.Brand)
		assert.Equal(t, "test-brand", *p.Brand)

		// Category
		if p.Category != "test-category" {
			t.Fatalf("expected Category to be test-category, got %s", p.Category)
		}

		// Weight
		assert.Equal(t, "test-weight", p.Weight)

		// Ingredients
		assert.Equal(t, "test-ingredientes", p.Ingredients)

		// Expiration date
		if p.ExpirationDate.IsZero() {
			t.Fatalf("expected ExpirationDate to be set, got zero")
		}
		assert.Equal(t, "2024-12-25", p.ExpirationDate.Format("2006-01-02"))

		// Price
		assert.Equal(t, 23.99, p.Price)

		// -

		// TODO: make a new test called: valid csv row with nil GTIN
		row = []string{"", "test-name", "test-brand", "test-category", "test-weight", "test-ingredientes", "2024-12-25", "23.99"}
		p = internal.Product{}
		err = p.FromCSV(ctx, row)
		assert.NoError(t, err)
	})

	// -

	t.Run("invalid csv row len", func(t *testing.T) {
		t.Parallel()

		row := []string{}

		p := internal.Product{}
		err := p.FromCSV(ctx, row)
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
		assert.Equal(t, "invalid csv row length", err.Error())
	})

	t.Run("invalid gtin", func(t *testing.T) {
		t.Parallel()

		row := []string{"invalid-gtin", "test-name", "test-brand", "test-category", "test-weight", "test-ingredientes", "2024-12-25", "23.99"}

		p := internal.Product{}
		err := p.FromCSV(ctx, row)
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

	})

	t.Run("invalid name", func(t *testing.T) {
		t.Parallel()

		row := []string{"invalid-gtin", "", "test-brand", "test-category", "test-weight", "test-ingredientes", "2024-12-25", "23.99"}

		p := internal.Product{}
		err := p.FromCSV(ctx, row)
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}
