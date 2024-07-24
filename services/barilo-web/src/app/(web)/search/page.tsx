"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { usePreferences } from "@/contexts/preferences-context";
import { ComparisonSearchSchema } from "@/entities/comparison";
import { cn } from "@/lib/utils";
import { ShoppingBasket } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import useSWR, { SWRResponse } from "swr";
import { z } from "zod";

interface APIError {
  message: string;
}

const fetcher = (
  url: string
): Promise<z.infer<typeof ComparisonSearchSchema>> =>
  fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("query");
  const { geolocation, radius, setRadius } = usePreferences();
  const {
    data: results,
    error,
    isLoading,
  }: SWRResponse<z.infer<typeof ComparisonSearchSchema>, APIError> = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/comparison/search/?name=${query}&lat=${geolocation.lat}&lng=${geolocation.lng}&radius=${radius}`,
    fetcher
  );

  const brands: string[] = useMemo(() => {
    if (!results) return [];
    const brandList = results.flatMap((comparison) =>
      comparison.products.map((product) => product.brand || "")
    );
    return Array.from(new Set(brandList));
  }, [results]);

  const markets: string[] = useMemo(() => {
    if (!results) return [];
    const marketList = results.flatMap((comparison) =>
      comparison.products.map((product) => product.market || "")
    );
    return Array.from(new Set(marketList));
  }, [results]);

  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pb-40">
      <div className="container space-y-10 mt-10">
        <div className="grid grid-cols-12 gap-4">
          {/* siderbar */}
          <div className="col-span-3 space-y-12 pr-6">
            {/* distance */}
            <div className="space-y-4">
              <div className="text-sm font-semibold">Alcançe da pesquisa</div>
              <hr />
              {/* TODO DistanceComponent */}
              <Slider
                value={[radius]}
                onValueChange={(e) => setRadius(e[0])}
                defaultValue={[20]}
                max={100}
                step={5}
                className={cn("mr-2")}
              />
              <div className="text-xs text-gray-500">
                {radius} km de distância
              </div>
            </div>
            {/* brands */}
            <div className="space-y-4">
              <div className="text-sm font-semibold">Marcas</div>
              <hr />
              <div className="space-y-2 flex flex-col">
                {/* TODO: OptionComponent */}
                {brands?.map((brand, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Checkbox id={brand} />
                    <label
                      htmlFor={brand}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TODO: ResultsComponent */}
          <div className="col-span-9">
            {/* product */}
            <div className="mb-4 text-xs">
              <span className="font-bold">{results?.length}</span> resultados
              encontrados em <span className="font-bold">{markets.length}</span>{" "}
              supermercados diferentes
            </div>
            <div className="grid grid-cols-3 gap-3">
              {isLoading ? (
                <Skeleton />
              ) : error ? (
                <div>{error.message}</div>
              ) : (
                // TODO: ProductComponent
                results?.map((comparison) => (
                  <div
                    key={comparison.id}
                    className="bg-white relative p-4 space-y-4 shadow-sm"
                  >
                    <div className="absolute top-0 right-0 p-2 bg-red-600 text-white text-xs rounded-tr-md font-bold">
                      Economize até 10%
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm font-bold text-gray-500">
                        {comparison.products[0].brand}
                      </div>
                      <div className="text-lg font-semibold">
                        {comparison.products[0].name}
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        {comparison.products[0].weight}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium">
                        Disponível em 2 supermercados
                      </p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-gray-500">Desde</p>
                        <p className="text-lg font-semibold">
                          {comparison.min_price}{" "}
                          <span className="text-xs">R$</span>
                        </p>
                      </div>
                      <div className="">
                        <Button className="w-full">
                          <ShoppingBasket className="w-4 mr-2" /> Add carrinho
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
