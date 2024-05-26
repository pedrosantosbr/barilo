package vault

import (
	"os"

	"github.com/pedrosantosbr/barilo/lib/envvar/vault"
	"github.com/pedrosantosbr/barilo/lib/errors"
)

// NewVaultProvider instantiates the Vault client using configuration defined in environment variables.
func NewVaultProvider() (*vault.Provider, error) {
	// XXX: We will revisit this code in future episodes replacing it with another solution
	vaultPath := os.Getenv("VAULT_PATH")
	vaultToken := os.Getenv("VAULT_TOKEN")
	vaultAddress := os.Getenv("VAULT_ADDRESS")
	// XXX: -

	provider, err := vault.New(vaultToken, vaultAddress, vaultPath)
	if err != nil {
		return nil, errors.WrapErrorf(err, errors.ErrorCodeUnknown, "vault.New ")
	}

	return provider, nil
}
