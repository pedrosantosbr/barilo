"use client";

import { FC } from "react";
import useSWR from "swr";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  ArrowBigRight,
  ArrowRightToLine,
  MapIcon,
  MapPinIcon,
} from "lucide-react";

async function fetcher(url: string) {
  return fetch(url).then((res) => res.json());
}

type ProductItem = {
  id: string;
  name: string;
  price: number;
  unit: string;
};

export const EDLPList: FC<{ className?: string }> = ({ className }) => {
  const { data, error } = useSWR<{ product_items: ProductItem[] }>(
    "http://localhost:9234/api/v1/groceries/edlps",
    fetcher
  );

  return (
    <div className={cn("space-y-10", className)}>
      <div className="grid grid-cols-12 gap-6">
        <div className="p-4 col-span-3 border shadow-md rounded-md">
          <h2 className="font-bold text-gray-700 text-lg">Pérola</h2>
          <div className="text-xs font-bold text-gray-500 flex items-center">
            <MapPinIcon className="w-3 mr-2" /> Rua Roberto Nogueira de
            Carvalho, 402
          </div>
          <div className="text-xs text-gray-400 flex items-center">
            <MapIcon className="w-3 mr-2" /> 8km de distância
          </div>
          <ul className="space-y-2 mt-4 rounded-md bg-gray-100 p-4">
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">🛒 Carrinhos:</div>{" "}
              <div>
                <kbd className="price">3</kbd>
              </div>
            </li>
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">🍽️ Max refeições:</div>{" "}
              <div>
                <kbd className="price">18</kbd>
              </div>
            </li>
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">👨🏻 Adultos:</div>{" "}
              <div>
                <kbd className="price">2</kbd>
              </div>
            </li>
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">👶 Crianças:</div>{" "}
              <div>
                <kbd className="price">2</kbd>
              </div>
            </li>
            <br />
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">💰 Min:</div>{" "}
              <div>
                <kbd className="price-promo">R$ 540.00</kbd>
              </div>
            </li>
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">💰 Max:</div>{" "}
              <div>
                <kbd className="price-promo">R$ 565.00</kbd>
              </div>
            </li>
          </ul>
          <div className="pt-8">
            <div className="flex justify-between">
              <div className="font-bold"></div>
              <div>
                <div className="font-medium text-gray-500 text-sm flex items-center">
                  Mais detalhes <ArrowRightToLine className="w-4 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 col-span-3 border shadow-md rounded-md relative">
          <kbd className="absolute -top-2 right-2 price-promo !text-black !bg-amber-400">
            Melhor custo benefício
          </kbd>
          <h2 className="font-bold text-gray-700 text-lg">Royal</h2>
          <div className="text-sm font-bold text-gray-500 flex items-center">
            <MapPinIcon className="w-3 mr-2" /> Av Linares, 32
          </div>
          <div className="text-xs text-gray-400 flex items-center">
            <MapIcon className="w-3 mr-2" /> 2km de distância
          </div>
          <ul className="space-y-2 mt-4 bg-gray-100 p-4 rounded-md">
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">🛒 Carrinhos:</div>{" "}
              <div>
                <kbd className="price">4</kbd>
              </div>
            </li>
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">🍽️ Max refeições:</div>{" "}
              <div>
                <kbd className="price">24</kbd>
              </div>
            </li>
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">👨🏻 Adultos:</div>{" "}
              <div>
                <kbd className="price">2</kbd>
              </div>
            </li>
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">👶 Crianças:</div>{" "}
              <div>
                <kbd className="price">2</kbd>
              </div>
            </li>
            <br />
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">💰 Min:</div>{" "}
              <div>
                <kbd className="price-promo">R$ 520.00</kbd>
              </div>
            </li>
            <li className="flex justify-between text-sm font-medium">
              <div className="text-gray-500">💰 Max:</div>{" "}
              <div>
                <kbd className="price-promo">R$ 583.00</kbd>
              </div>
            </li>
          </ul>
          <div className="pt-8">
            <div className="flex justify-between">
              <div className="font-bold"></div>
              <div>
                <div className="font-medium text-gray-500 text-sm flex items-center">
                  Mais detalhes <ArrowRightToLine className="w-4 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="grid grid-cols-12 gap-4">
        {data?.product_items.map((item) => (
          <ProductItemFragment key={item.id} {...item} />
        ))}
      </div> */}
    </div>
  );
};

const ProductItemFragment: FC<ProductItem> = ({ name, price, unit }) => {
  return (
    <div className="lg:col-span-2 md:col-span-3 sm:col-span-4">
      <div className="p-4 border rounded-md shadow-md relative cursor-pointer">
        <Checkbox id="items" className="border-gray-300" />
        <kbd className="price-promo absolute -top-2 right-2">$ {price}</kbd>
        <h4 className="font-semibold">{name}, 1kg</h4>
      </div>
    </div>
  );
};
