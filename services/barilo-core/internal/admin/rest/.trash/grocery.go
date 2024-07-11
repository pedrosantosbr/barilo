package rest

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// MaxInMemorySize sets the maximum size of the image allowed in memory (in bytes)

// GroceryService interface defines all methods a GroceryService should implement
type GroceryService interface {
	GetEDLP(ctx context.Context) (string, error)
}

// RecipeHandler
type GroceryHandler struct{}

func NewGroceryHandler() *GroceryHandler {
	return &GroceryHandler{}
}

func (gh *GroceryHandler) Register(r *chi.Mux) {
	r.Post("/api/v1/groceries/ingest-edlp", gh.ingestEDLP) // ingest daily promotions
	r.Get("/api/v1/groceries/edlps", gh.getEDLPs)          // daily promotions
}

type GeminiResponse struct {
	Content string `json:"content"`
}

func (gh *GroceryHandler) ingestEDLP(w http.ResponseWriter, r *http.Request) {
	// Validate request method (should be POST)
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintf(w, "Method not allowed: %s", r.Method)
		return
	}

	// Parse multipart form data
	err := r.ParseMultipartForm(MaxInMemorySize)
	if err != nil {
		handleError(w, r, http.StatusBadRequest, "Error parsing form data: %s", err)
		return
	}

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
	resp, err := model.GenerateContent(ctx, prompt...)
	if err != nil {
		handleError(w, r, http.StatusInternalServerError, "Error generating content: %v", err)
		return
	}

	fmt.Println(resp.Candidates[0].Content)

	// Write the response back to the client
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

// -

type ProductItem struct {
	Name     string `json:"name"`
	Price    string `json:"price"`
	Unit     string `json:"unit"`
	Quantity string `json:"quantity"`
}

type GetEDLPResponse struct {
	ProductItems []ProductItem `json:"product_items"`
}

func (gh *GroceryHandler) getEDLPs(w http.ResponseWriter, r *http.Request) {
	var items []ProductItem

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintf(w, "Method not allowed: %s", r.Method)
		return
	}

	// -
	csvFile, err := os.Open("/Users/psantos/src/barilo/services/barilo-go-backend/internal/rest/edlp.csv")

	if err != nil {
		fmt.Println(err)
		handleError(w, r, http.StatusInternalServerError, "Error reading file: %v", err)
		return
	}

	fileReader := csv.NewReader(csvFile)
	for {
		record, err := fileReader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			handleError(w, r, http.StatusInternalServerError, "Error reading file: %v", err)
			return
		}

		fmt.Println(record)

		item := ProductItem{
			Name:  record[0],
			Price: record[1],
			Unit:  record[2],
		}

		items = append(items, item)
	}

	res := &GetEDLPResponse{
		ProductItems: items,
	}

	render.Status(r, http.StatusOK)
	render.JSON(w, r, res)
}

// -

func handleError(w http.ResponseWriter, r *http.Request, status int, format string, args ...interface{}) {
	res := &ErrorResponse{
		Error: fmt.Sprintf(format, args...),
	}
	render.Status(r, status)
	render.JSON(w, r, res)
}
