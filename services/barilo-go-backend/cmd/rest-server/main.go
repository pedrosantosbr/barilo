package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	libopenai "github.com/pedrosantosbr/barilo/lib/openai"
	"github.com/pedrosantosbr/barilo/lib/tracing"
	"github.com/pedrosantosbr/barilo/lib/vault"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"

	domain "github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/internal/envvar"
	"github.com/pedrosantosbr/barilo/internal/openai"
	"github.com/pedrosantosbr/barilo/internal/rest"
	"github.com/pedrosantosbr/barilo/internal/service"

	"github.com/didip/tollbooth/v6"
	"github.com/didip/tollbooth/v6/limiter"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

const otelName = "github.com/pedrosantosbr/barilo/internal/service"

func main() {
	var env, address string

	flag.StringVar(&env, "env", "", "Environment Variables filename")
	flag.StringVar(&address, "address", ":9234", "HTTP Server Address")
	flag.Parse()

	errC, err := run(env, address)
	if err != nil {
		log.Fatalf("Couldn't run: %s", err)
	}

	if err := <-errC; err != nil {
		log.Fatalf("Error while running: %s", err)
	}
}

func run(env, address string) (<-chan error, error) {
	logger, err := zap.NewProduction()
	if err != nil {
		return nil, errors.New("zap logger failed to instanciate")
	}

	if err := envvar.Load(env); err != nil {
		return nil, domain.WrapErrorf(err, domain.ErrorCodeUnknown, "envvar.Load")
	}

	vault, err := vault.NewVaultProvider()
	if err != nil {
		return nil, domain.WrapErrorf(err, domain.ErrorCodeUnknown, "internal.NewVaultProvider")
	}

	conf := envvar.New(vault)

	// -

	logging := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			logger.Info(r.Method,
				zap.Time("time", time.Now()),
				zap.String("url", r.URL.String()),
			)

			h.ServeHTTP(w, r)
		})
	}

	// -

	errC := make(chan error, 1)

	ctx, stop := signal.NotifyContext(context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
		syscall.SIGQUIT)

	// Setup OpenTelemetry SDK.
	otelShutdown, err := tracing.NewOTExporter(ctx, conf)
	if err != nil {
		return nil, domain.WrapErrorf(err, domain.ErrorCodeUnknown, "tracing.NewOTExporter")
	}

	srv, err := newServer(&serverConfig{
		Address:     address,
		Middlewares: []func(next http.Handler) http.Handler{logging},
		Logger:      logger,
		ctx:         ctx,
	})
	if err != nil {
		return nil, errors.New("newServer failed to start")
	}

	// Handle shutdown properly so nothing leaks.
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	go func() {
		<-ctx.Done()

		logger.Info("Shutdown signal received")

		ctxTimeout, cancel := context.WithTimeout(context.Background(), 5*time.Second)

		defer func() {
			_ = logger.Sync()

			stop()
			cancel()
			close(errC)
		}()

		srv.SetKeepAlivesEnabled(false)

		if err := srv.Shutdown(ctxTimeout); err != nil { //nolint: contextcheck
			errC <- err
		}

		logger.Info("Shutdown completed")
	}()

	go func() {
		logger.Info("Listening and serving", zap.String("address", address))

		// "ListenAndServe always returns a non-nil error. After Shutdown or Close, the returned error is
		// ErrServerClosed."
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errC <- err
		}
	}()

	return errC, nil
}

type serverConfig struct {
	Address     string
	Middlewares []func(next http.Handler) http.Handler
	Logger      *zap.Logger
	ctx         context.Context
}

func newServer(conf *serverConfig) (*http.Server, error) {
	router := chi.NewRouter()
	// handle cors
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			next.ServeHTTP(w, r)
		})
	}

	router.Use(corsMiddleware)

	for _, mw := range conf.Middlewares {
		router.Use(mw)
	}

	// -

	openaiCli := libopenai.NewOpenAIClient(os.Getenv("OPENAI_API_KEY"))
	tg := openai.NewOpenAITextGenerator(openaiCli)
	rcpSvc := service.NewRecipe(tg, nil)

	// -

	rest.NewRecipeHandler(rcpSvc).Register(router)
	rest.NewGroceryHandler().Register(router)

	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		tracer := otel.Tracer(otelName)

		commonAttrs := []attribute.KeyValue{
			attribute.String("attrA", "chocolate"),
			attribute.String("attrB", "raspberry"),
			attribute.String("attrC", "vanilla"),
		}

		ctx, span := tracer.Start(
			r.Context(),
			"work",
			trace.WithAttributes(commonAttrs...))
		defer span.End()

		for i := 0; i < 10; i++ {
			_, iSpan := tracer.Start(ctx, fmt.Sprintf("worker-%d", i))
			log.Printf("Doing really hard work (%d / 10)\n", i+1)

			<-time.After(time.Second)
			iSpan.End()
		}

		render.Status(r, http.StatusOK)
		render.JSON(w, r, map[string]string{"status": "ok"})
	})

	lmt := tollbooth.NewLimiter(3, &limiter.ExpirableOptions{DefaultExpirationTTL: time.Second})

	lmtmw := tollbooth.LimitHandler(lmt, router)

	return &http.Server{
		Handler:           lmtmw,
		Addr:              conf.Address,
		ReadHeaderTimeout: 1 * time.Second,
	}, nil
}
