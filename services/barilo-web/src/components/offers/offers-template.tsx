"use client";

import { FC } from "react";

import { CircularListResponse, Circular } from "@/entities/store";
import { MapPinned } from "lucide-react";

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
  return (
    <div className="space-y-12">
      <div className="flex flex-col space-y-4">
        {circulars.length == 0 && (
          <div className="border rounded-lg p-4 shadow-sm bg-background text-center">
            <h4>Por favor, selecione um endereço para buscar encartes</h4>
          </div>
        )}
        {circulars.length > 0 &&
          circulars.map((circular, idx) => (
            <CircularCard key={idx} circular={circular} />
          ))}
      </div>
    </div>
  );
};

const CircularCard: FC<{ circular: Circular }> = ({ circular }) => {
  return (
    <div className="bg-background border rounded-lg p-4 shadow-md">
      <div className="flex space-x-4 items-center">
        <div className="w-10 h-10 border rounded-lg bg-slate-200"></div>
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center">
            <h4 className="font-bold">Saldão de ofertas</h4>
            <div className="text-xs italic text-muted-foreground font-medium">
              Válido até 4 de Jul, 2024
            </div>
          </div>
          <div className="flex space-x-2 text-sm text-muted-foreground">
            <div className="">{circular.market.name}</div>
          </div>
        </div>
      </div>
      <ul className="text-sm mt-4">
        {circular.items.map((item, idx) => (
          <li key={idx} className="border-b border-dashed p-1">
            {/* <div className="w-5 h-5 flex items-center">🛒</div> */}
            <div className="flex space-x-2 items-center">
              <div className="font-medium tracking-wide capitalize">
                {item.product.name}
              </div>
              <div className="font-bold text-foreground">
                ${item.discount_price}
              </div>
            </div>
            <div className="text-xs font-bold text-gray-500">
              {item.product.brand ? `${item.product.brand} - ` : ""}{" "}
              {item.product.weight}
            </div>
          </li>
        ))}
      </ul>
      <div className="pt-10 text-sm">
        <div className="flex items-center">
          <MapPinned size={12} className="mr-2" />
          Address: Rua 1, 123
        </div>
      </div>
    </div>
  );
};
