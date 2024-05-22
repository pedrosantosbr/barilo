export type ProductOfferIndex = {
  store: string // product owner
  name: string; // product name
  price: number; // product price
  weight: string; // product weight
  brand?: string; // product brand
  categories: number[] // product category
  rule?: string; // product rule
};

export type StoreOffersIndex = {
  name: string; // store name
  address: string; // store address
  offers: ProductOfferIndex[]; // store offers
};

export type CategoryIndex = {
  id: number
  name: string
  parentId?: number
}

const categories: CategoryIndex[] = [
  {
    id: 1,
    name: "legumes"
  },
  {
    id: 2,
    name: "enlatados ou conservados"
  },
  {
    id: 3,
    name: "açucares e adoçantes"
  },
  {
    id: 4,
    name: "bebidas alcoólicas"
  },
  {
    id: 5,
    name: "laticínios e derivados"
  },
  {
    id: 6,
    name: "biscoitos e snacks"
  },
  {
    id: 7,
    name: "carnes e aves"
  },
  {
    id: 8,
    name: "Carnes bovinas",
    parentId: 7
  },
  {
    id: 9,
    name: "grãos e cereais"
  }
]

export const offersSamples: StoreOffersIndex[] = [
  {
    name: "Supermercado Royal",
    address: "Rua 1, 123",
    offers: [
      { 
        store: "Supermercado Royal",
        name: "Ervilha Pramesa 2kg", 
        price: 24.90, 
        brand: "Pramesa 1", 
        weight: "2kg",
        categories: [
          1,
          2,
          9
        ]
      },
      {
        store: "Supermercado Royal",
        name: "Açúcar cristal Mirante 5kg",
        price: 18.99,
        brand: "Mirante",
        weight: "5kg",
        categories: [3]
      },
      {
        store: "Supermercado Royal",
        name: "Cerveja Skol lata 350ml",
        price: 3.99,
        brand: "Skol",
        weight: "350ml",
        categories: [4]
      }
    ],
  },
  {
    name: "Mercado Donana",
    address: "Rua 1, 123",
    offers: [
      { 
        store: "Mercado Donana",
        name: "Leite em pó Ninho integral instantâneo 800g", 
        price: 15.99, 
        brand: "Ninho", 
        weight: "800g",
        categories: [5]
      },
      {
        store: "Mercado Donana",
        name: "Biscoito Piraquê cream cracker 185g",
        price: 12.00,
        brand: "Piraquê",
        weight: "185g",
        rule: "Leve 3 pague 2",
        categories: [6]
      },
      {
        store: "Mercado Donana",
        name: "Cerveja Skol lata 350ml",
        price: 4.99,
        brand: "Skol",
        weight: "350ml",
        rule: "Leve 12 pague 10",
        categories: [4]
      },
    ],
  },
  {
    name: "Supermercado Pérola",
    address: "Rua 1, 123",
    offers: [
      {
        store: "Supermercado Pérola",
        name: "Café Fort 500g",
        price: 15.98,
        brand: "Fort",
        weight: "500g",
        categories: [9]
      },
      {
        store: "Supermercado Pérola",
        name: "Café Três Corações Gourmet 250g",
        price: 17.48,
        brand: "Três Corações",
        weight: "250g",
        categories: [9]
      },
      {
        store: "Supermercado Pérola",
        name: "Cerveja Skol lata 350ml",
        price: 2.99,
        brand: "Skol",
        weight: "350ml",
        categories: [4]
      },
      {
        store: "Supermercado Pérola",
        name: "Costela para cozinhar kg",
        price: 16.99,
        weight: "1kg",
        categories: [7]
      },
      {
        store: "Mercado Pérola",
        name: "Biscoito Richester cream cracker 185g",
        price: 12.00,
        brand: "Richester",
        weight: "185g",
        rule: "Leve 3 pague 2",
        categories: [6]
      },
    ],
  },
]


// It compares all the exact products by name,brand, and weight
export type OffersGroupedByProductNameAndWeight = {
  title: string // category name
  offers: ProductOfferIndex[]
}

export const offersRank: OffersGroupedByProductNameAndWeight[] = [
  {
    title: "Ervilha Pramesa 2kg",
    offers: [
      { 
        store: "Supermercado Royal",
        name: "Ervilha Pramesa 2kg", 
        price: 24.90, 
        brand: "Pramesa 1", 
        weight: "2kg",
        categories: [
          1,
          2,
          9
        ]
      },
    ]
  },
  {
    title: "Açúcar cristal Mirante 5kg",
    offers: [
      {
        store: "Supermercado Royal",
        name: "Açúcar cristal Mirante 5kg",
        price: 18.99,
        brand: "Mirante",
        weight: "5kg",
        categories: [3]
      },
    ]
  },
  {
    title: "Cerveja Skol lata 350ml",
    offers: [
      {
        store: "Supermercado Royal",
        name: "Cerveja Skol lata 350ml",
        price: 3.99,
        brand: "Skol",
        weight: "350ml",
        categories: [4]
      },
      {
        store: "Supermercado Pérola",
        name: "Cerveja Skol lata 350ml",
        price: 2.99,
        brand: "Skol",
        weight: "350ml",
        categories: [4]
      },
      {
        store: "Mercado Donana",
        name: "Cerveja Skol lata 350ml",
        price: 4.99,
        brand: "Skol",
        weight: "350ml",
        rule: "Leve 12 pague 10",
        categories: [4]
      },
    ]
  },
  {
    title: "Leite em pó Ninho integral instantâneo 800g",
    offers: [
      { 
        store: "Mercado Donana",
        name: "Leite em pó Ninho integral instantâneo 800g", 
        price: 15.99, 
        brand: "Ninho", 
        weight: "800g",
        categories: [5]
      },
    ]
  },
  {
    title: "Biscoito Piraquê cream cracker 185g",
    offers: [
      {
        store: "Mercado Donana",
        name: "Biscoito Piraquê cream cracker 185g",
        price: 12.00,
        brand: "Piraquê",
        weight: "185g",
        rule: "Leve 3 pague 2",
        categories: [6]
      },
    ]
  },
  {
    title: "Biscoito Richester cream cracker 185g",
    offers: [
      {
        store: "Mercado Pérola",
        name: "Biscoito Richester cream cracker 185g",
        price: 12.00,
        brand: "Richester",
        weight: "185g",
        categories: [6]
      },
    ]
  }
]