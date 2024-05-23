package agolia

type ProductIndex struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Brand *string `json:"brand"`
}
