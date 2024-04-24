package main

import (
	"barilo/internals/prompt"
	logging "barilo/lib/logger"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"time"
)

var addr = flag.String("addr", ":8080", "http service address")

func serveHome(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// return 200
	res := struct {
		Message string `json:"message"`
	}{
		Message: "Welcome to Barilo!",
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func main() {
	logger, err := logging.NewLogger()
	if err != nil {
		log.Fatal("Failed to create logger: ", err)
	}

	defer logger.Sync() // flushes buffer, if any

	flag.Parse()

	// DI
	recipe := prompt.NewRecipePrompt(nil)

	http.HandleFunc("/", serveHome)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		recipe.ListenAndConsume(w, r)
	})

	server := &http.Server{
		Addr:              *addr,
		ReadHeaderTimeout: 3 * time.Second,
	}

	logger.Info(fmt.Sprintf("Server started at %s", *addr))
	err = server.ListenAndServe()
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
