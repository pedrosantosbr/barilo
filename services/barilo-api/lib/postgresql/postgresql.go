package postgresql

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/internal/envvar"
)

func NewPostgreSQL(conf *envvar.Configuration) (*pgxpool.Pool, error) {
	get := func(v string) string {
		res, err := conf.Get(v)
		if err != nil {
			log.Fatalf("Couldn't get %s: %s", v, err)
		}
		return res
	}

	connStr := "postgres://" + get("POSTGRES_USER") + ":" + get("POSTGRES_PASSWORD") + "@" + get("POSTGRES_HOST") + ":" + get("POSTGRES_PORT") + "/" + get("POSTGRES_DB") + "?sslmode=disable"

	pool, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "pgxpool.New")
	}

	if err := pool.Ping(context.Background()); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "pool.Ping")
	}

	return pool, nil
}