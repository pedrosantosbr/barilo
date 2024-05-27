"use client";

import { FC, useState } from "react";

import { CircularListResponse, Circular } from "@/entities/store";

type Offer = {
  product: string;
  price: number;
  lowerPrice?: boolean;
};

type StoreWithOffers = {
  store: string;
  address: string;
  offers: Offer[];
};

type Filters = {
  lowerPrice: boolean;
};

const data: StoreWithOffers[] = [
  {
    store: "Supermercado Pérola",
    address: "Rua 1, 123, Ano bom",
    offers: [
      {
        product: "File de peito de frango congelado, o quilo",
        price: 1.78,
        lowerPrice: true,
      },
      {
        product: "Refrigerante Pepsi ou Guaraná Antarctica, 2 litros",
        price: 4.98,
      },
      {
        product: "Papel higiênico comfort, pacote com 4 unidades",
        price: 2.99,
        lowerPrice: true,
      },
      {
        product: "Arroz parboilizado tipo 1 Palmares, 5kg",
        price: 3.49,
      },
    ],
  },
  {
    store: "Supermercado Pérola",
    address: "Rua 1, 123 - Santa Clara",
    offers: [
      {
        product: "Papel higiênico Comfort, pacote com 4 unidades",
        price: 2.99,
      },
      {
        product: "Arroz Palmares parboilizado tipo 1, 5kg",
        price: 3.49,
        lowerPrice: true,
      },
      {
        product: "Farinha de trigo Triave, 1kg",
        price: 1.12,
      },
    ],
  },
  {
    store: "Supermercado Royal",
    address: "Rua 1, 123",
    offers: [
      { product: "Product 3", price: 30.0 },
      { product: "Product 4", price: 40.0, lowerPrice: true },
    ],
  },
  {
    store: "Hipermercado Royal",
    address: "Rua 1, 123",
    offers: [
      { product: "Product 3", price: 30.0 },
      { product: "Product 4", price: 50.0 },
    ],
  },
];

export const OffersTemplate: FC<{ circulars: CircularListResponse }> = ({
  circulars,
}) => {
  const [filters, setFilters] = useState<Filters>({
    lowerPrice: false,
  });

  return (
    <div className="space-y-12">
      <div className="text-left text-3xl font-extrabold">Encartes</div>
      <div className="flex flex-col space-y-4">
        {circulars.map((circular, idx) => (
          <CircularCard key={idx} circular={circular} />
        ))}
      </div>
    </div>
  );
};

const CircularCard: FC<{ circular: Circular }> = ({ circular }) => {
  return (
    <div className="bg-background rounded-lg p-4 border shadow-sm">
      <div className="font-bold">{circular.title}</div>
      <div className="flex space-x-2 text-sm text-muted-foreground">
        <div className="">{circular.store.name}</div>
        <div className="">{circular.store.address}</div>
      </div>
      <ul className="text-sm mt-4">
        {circular.items.map((item, idx) => (
          <li key={idx} className="flex space-x-2">
            <div>{item.product.name}</div>
            <div className="font-bold text-foreground">
              ${item.discount_price}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
