package agolia

type ProductIndex struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price uint64  `json:"price"`
	Brand *string `json:"brand"`
}
