"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

import { ChangeEvent, FC, FormEventHandler, useMemo, useState } from "react";

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

export function OffersList() {
  const [filters, setFilters] = useState<Filters>({
    lowerPrice: false,
  });

  const handleFilterChange = (key: keyof Filters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: !prevFilters[key],
    }));
  };

  const filteredOffers = useMemo(() => {
    if (filters.lowerPrice) {
      return data.filter((storeWithOffers) => {
        return storeWithOffers.offers.some((offer) => {
          return offer.lowerPrice === true;
        });
      });
    }
    return data;
  }, [filters.lowerPrice]);

  return (
    <div className="space-y-12">
      <OffersFilter filters={filters} handleFilterChange={handleFilterChange} />
      <div className="grid grid-cols-3 gap-8">
        {filteredOffers.map((storeWithOffers) => (
          <Offers
            key={storeWithOffers.store}
            offers={storeWithOffers}
            filters={filters}
          />
        ))}
      </div>
    </div>
  );
}

type OffersFilterProps = {
  handleFilterChange: (key: keyof Filters) => void;
  filters: Filters;
};

const OffersFilter: FC<OffersFilterProps> = ({
  filters,
  handleFilterChange,
}) => {
  const onLowerPriceChange = (_: CheckedState) => {
    handleFilterChange("lowerPrice");
  };

  return (
    <div className="border rounded-md shadow-sm p-4">
      <div className="flex items-center space-x-2">
        <LowerPriceFilterCheckbox
          checked={filters.lowerPrice}
          onCheckedChange={onLowerPriceChange}
        />
      </div>
    </div>
  );
};

export function LowerPriceFilterCheckbox({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange?: (checked: CheckedState) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        id="lowerPrice"
      />
      <label
        htmlFor="lowerPrice"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Mostrar melhores preços
      </label>
    </div>
  );
}

type OffersProps = {
  offers: StoreWithOffers;
  filters: Filters;
};
const Offers: FC<OffersProps> = ({
  offers: { store, address, offers },
  filters,
}) => {
  const applyFilters = (offer: Offer) => {
    if (filters.lowerPrice) {
      return offer.lowerPrice === true;
    }
    return true;
  };

  return (
    <div className="p-2 flex flex-col">
      <h4 className="text-lg font-bold">{store}</h4>
      <p className="text-sm text-gray-500">{address}</p>
      <ul className="mt-4 text-sm space-y-2">
        {offers.filter(applyFilters).map((offer) => (
          <li key={offer.product} className="flex justify-between">
            <span>{offer.product}</span>
            <kbd className="font-bold bg-gray-200 px-2">
              R$ {offer.price.toFixed(2)}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
};