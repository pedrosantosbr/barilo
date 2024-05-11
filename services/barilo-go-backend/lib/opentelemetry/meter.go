package opentelemetry

import (
	"time"

	"github.com/pedrosantosbr/barilo/internal"

	"github.com/pedrosantosbr/barilo/internal/envvar"

	"go.opentelemetry.io/contrib/instrumentation/runtime"
	"go.opentelemetry.io/otel/exporters/prometheus"
)

// NewOTExporter instantiates the OpenTelemetry exporters using configuration defined in environment variables.
func NewMeterExporter(conf *envvar.Configuration) (*prometheus.Exporter, error) {
	if err := runtime.Start(runtime.WithMinimumReadMemStatsInterval(time.Second)); err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "runtime.Start")
	}

	exporter, err := prometheus.New()
	if err != nil {
		return nil, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "prometheus.NewExportPipeline")
	}

	return exporter, nil
}
