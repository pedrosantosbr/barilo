package rest

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"barilo/internal/domain"

	"github.com/go-chi/chi/v5"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type PromotionService interface {
	IngestPromotions(promotions string) error
	ListAllPromotions() ([]domain.Promotion, error)
}

// PromotionHandler...
type PromotionHandler struct {
}

// NewPromotionHandler...
func NewPromotionHandler() *PromotionHandler {
	return &PromotionHandler{}
}

func (ph *PromotionHandler) Register(r *chi.Mux) {
	r.Post("/api/v1/promotions/create", ph.create) // ingest daily
}

// -

type CreatePromotionRequest struct {
	StoreName    string  `json:"store_name"`
	StoreAddress string  `json:"store_address"`
	StorePhone   *string `json:"store_phone"`
	Image        string  `json:"image"`
}

type CreatePromotionResponse struct {
	PromotionID string `json:"promotion_id"`
}

// Creates product promotions for a given store
func (ph *PromotionHandler) create(w http.ResponseWriter, r *http.Request) {
	// Validate request method (should be POST)
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintf(w, "Method not allowed: %s", r.Method)
		return
	}

	// Checking body doesn't exceed memory size limit
	// Also parsing req body to multipart form to get the files
	err := r.ParseMultipartForm(MaxInMemorySize)
	if err != nil {
		handleError(w, r, http.StatusBadRequest, "Error parsing form data: %s", err)
		return
	}

	var req CreatePromotionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		handleError(w, r, http.StatusBadRequest, "Error decoding request: %s", err)
		return
	}
	defer r.Body.Close()

	// Get the uploaded image file
	file, _, err := r.FormFile("image")
	if err != nil {
		handleError(w, r, http.StatusBadRequest, "Error getting image file: %s", err)
		return
	}
	defer file.Close()

	// Read image data into memory buffer
	imgBuffer := bytes.NewBuffer(nil)
	_, err = io.Copy(imgBuffer, file)
	if err != nil {
		handleError(w, r, http.StatusInternalServerError, "Error reading image data: %v", err)
		return
	}

	// -

	ctx := context.Background()
	// Access your API key as an environment variable (see "Set up your API key" above)
	// client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("API_KEY")))
	client, err := genai.NewClient(ctx, option.WithAPIKey("AIzaSyBaVK4nqLKBD5yiABP1L0sp37Z_CwR5yNg"))
	if err != nil {
		handleError(w, r, http.StatusInternalServerError, "Error creating client: %v", err)
	}
	defer client.Close()

	// For text-and-image input (multimodal), use the gemini-pro-vision model
	model := client.GenerativeModel("gemini-pro-vision")

	prompt := []genai.Part{
		genai.ImageData("png", imgBuffer.Bytes()),
		genai.Text("Analise a imagem e me retorne todos os produtos listado em promoção. Os produtos retornados devem ser no formato csv separados por vírgula como nome, preço e unidade de medida. Se houver dois preços por produto leia o menor entre eles. Se houver mais de um produto com o mesmo nome, retorne apenas um dele. Geralmente os produtos diagramados em grid sendo assim cada square da imagem é um produto. A única saída que eu querp é o csv com os produtos em promoção. O formato do csv tem que ser: nome, preço, unidade de medida e quantidade, não podendo exceder mais de 3 colunas por linha. Exemplo: Peito de frango congelado, 13.99, kg, 1\n Leite integral Barra Mansa, 4.00, l \n Nescau,5.99,lata"),
	}
	_, err = model.GenerateContent(ctx, prompt...)
	if err != nil {
		handleError(w, r, http.StatusInternalServerError, "Error generating content: %v", err)
		return
	}

	// check if file is formatted correctly
	// save them in batch into the database
	// return successfully

	// Write the response back to the client
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}
