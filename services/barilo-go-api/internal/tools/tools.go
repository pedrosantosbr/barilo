package tools

import (
	_ "github.com/jackc/tern/v2"                 // Database Migration
	_ "github.com/maxbrunsfeld/counterfeiter/v6" // Mock/Spies/Stubs
	_ "github.com/sqlc-dev/sqlc/cmd/sqlc"        // Type-Safe SQL generator
)
