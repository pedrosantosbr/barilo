"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

import { FC, useState } from "react";
import {
  offerRankDataSet,
  offersSamples,
  ProductOfferIndex,
  StoreOffersIndex,
} from "@/data/offers-samples";
import { OfferRank } from "./offer-rank";
import { MapPinIcon, ShoppingBasket } from "lucide-react";
import Image from "next/image";

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

export function OffersTemplate() {
  const [filters, setFilters] = useState<Filters>({
    lowerPrice: false,
  });

  const handleFilterChange = (key: keyof Filters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: !prevFilters[key],
    }));
  };

  // const filteredOffers = useMemo(() => {
  //   if (filters.lowerPrice) {
  //     return data.filter((storeWithOffers) => {
  //       return storeWithOffers.offers.some((offer) => {
  //         return offer.lowerPrice === true;
  //       });
  //     });
  //   }
  //   return data;
  // }, [filters.lowerPrice]);

  return (
    <div className="space-y-12">
      {/* <OffersFilter filters={filters} handleFilterChange={handleFilterChange} /> */}
      {/* Rank of Offers grouped by product name and weight */}
      <div className="text-left text-5xl font-extrabold">Melhores preços</div>
      <OfferRank offers={offerRankDataSet} />

      <hr />
      <div className="text-left text-5xl font-extrabold">Encartes</div>
      <div className="grid sm:grid-cols-4 md:grid-cols-3 gap-4">
        {/* {filteredOffers.map((storeWithOffers) => (
          <OffersList
            key={storeWithOffers.store}
            offers={storeWithOffers}
            filters={filters}
          />
        ))} */}
        {offersSamples.map((storeWithOffers, idx) => (
          <Store key={idx} offers={storeWithOffers} filters={filters} />
        ))}
        {offersSamples.map((storeWithOffers, idx) => (
          <Store key={idx} offers={storeWithOffers} filters={filters} />
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

type StoreProps = {
  offers: StoreOffersIndex;
  filters: Filters;
};
const Store: FC<StoreProps> = ({
  offers: { name, address, offers },
  filters,
}) => {
  // const applyFilters = (offer: Offer) => {
  //   if (filters.lowerPrice) {
  //     return offer.lowerPrice === true;
  //   }
  //   return true;
  // };

  return (
    <div className="p-4 flex flex-col bg-background self-start rounded border shadow-md space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{name}</h3>
          <ShoppingBasket className="text-amber-500 !fill-amber-400 w-10" />
        </div>
        <div className="flex items-center">
          <MapPinIcon className="w-3 mr-2" />
          <p className="text-sm font-medium">{address}</p>
        </div>
      </div>
      <ul className="mt-4 text-sm">
        {/* {offers.filter(applyFilters).map((offer) => (
          <OfferItem key={offer.product} offer={offer} />
        ))} */}
        {offers.map((offer, idx) => (
          <OfferItem key={idx} offer={offer} />
        ))}
      </ul>
      <div className="flex space-x-2">
        <div className="border rounded-md w-10 h-10">
          <Image
            src="/img/encarte-example.jpg"
            alt="offer"
            className="rounded-md w-10 h-10"
            width={50}
            height={50}
          />
        </div>
      </div>
    </div>
  );
};

type OfferItemProps = {
  key: number;
  offer: ProductOfferIndex;
};

const OfferItem: FC<OfferItemProps> = ({ offer }) => (
  <li className="flex justify-between items-end">
    <span className="text-sm font-medium">{offer.name}</span>
    <div className="flex-1 border-b"></div>
    <kbd className="price-promo">R$ {offer.price.toFixed(2)}</kbd>
  </li>
);
