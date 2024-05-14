GO_VERSION=1.22.0

tools:
	go install -C internal/tools \
		github.com/maxbrunsfeld/counterfeiter/v6 \
		github.com/jackc/tern/v2 \
		github.com/sqlc-dev/sqlc/cmd/sqlc


install:
	go install golang.org/dl/go${GO_VERSION}@latest
	go${GO_VERSION} download
	mkdir -p bin
	ln -sf `go env GOPATH`/bin/go${GO_VERSION} bin/go
	
generate:
	go generate ./...