package logging

import (
	"context"

	"go.uber.org/zap"
)

type zapKey struct{}
type zapContext struct {
	logger *zap.Logger
}

func FromContext(ctx context.Context) *zap.Logger {
	c, ok := ctx.Value(zapKey{}).(*zapContext)
	if ok && c != nil {
		return c.logger
	}

	log, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}

	return log
}

func WithLogger(ctx context.Context, logger *zap.Logger) context.Context {
	return context.WithValue(ctx, zapKey{}, logger)
}
