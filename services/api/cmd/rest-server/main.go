package main

import (
	internalopenai "api/internal/openai"
	"api/internal/rest"
	"api/internal/service"
	"api/lib/logger"
	"api/lib/openai"
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

	"github.com/didip/tollbooth/v6"
	"github.com/didip/tollbooth/v6/limiter"
	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {
	var env, address string
	flag.StringVar(&env, "env", "", "Environment Variables filename")
	flag.StringVar(&address, "address", ":9234", "HTTP Server Address")
	flag.Parse()

	envpath := fmt.Sprintf("../../env/%s", env)

	errC, err := run(envpath, address)
	if err != nil {
		log.Fatalf("Error starting server: %v", err)
	}

	if err := <-errC; err != nil {
		log.Fatalf("Error while running: %v", err)
	}
}

func run(env, address string) (<-chan error, error) {
	logger, err := logger.NewLogger()
	if err != nil {
		return nil, err
	}

	if err := godotenv.Load(env); err != nil {
		return nil, err
	}

	logging := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			logger.Info(r.Method,
				zap.Time("time", time.Now()),
				zap.String("url", r.URL.String()),
			)

			h.ServeHTTP(w, r)
		})
	}

	srv, err := newServer(serverConfig{
		Address:     address,
		Middlewares: []func(next http.Handler) http.Handler{logging},
		Logger:      logger,
	})
	if err != nil {
		return nil, err
	}

	errC := make(chan error, 1)

	ctx, stop := signal.NotifyContext(context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
		syscall.SIGQUIT)

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
}

func newServer(conf serverConfig) (*http.Server, error) {
	router := chi.NewRouter()

	for _, middleware := range conf.Middlewares {
		router.Use(middleware)
	}

	// Adding logger to context
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := logger.WithLogger(r.Context(), conf.Logger)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	})
	// -

	openAiClient := openai.NewClient(os.Getenv("OPEN_AI_API_KEY"))
	chatbot := internalopenai.NewOpenAIChatBotImpl(openAiClient)

	svc := service.NewReceipt(chatbot)
	rest.NewRecipeHandler(svc).Register(router)

	// -

	lmt := tollbooth.NewLimiter(3, &limiter.ExpirableOptions{DefaultExpirationTTL: time.Second})

	lmtmw := tollbooth.LimitHandler(lmt, router)

	// -

	return &http.Server{
		Handler: lmtmw,
		Addr:    conf.Address,
		// ReadTimeout:       1 * time.Second,
		// WriteTimeout:      1 * time.Second,
		// ReadHeaderTimeout: 1 * time.Second,
		// IdleTimeout:       1 * time.Second,
	}, nil
}
