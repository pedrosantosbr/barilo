"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePreferences } from "@/contexts/preferences-context";
import { ComparisonSearchSchema } from "@/entities/comparison";
import { useSearchParams } from "next/navigation";
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
  const { geolocation, radius } = usePreferences();
  const {
    data,
    error,
    isLoading,
  }: SWRResponse<z.infer<typeof ComparisonSearchSchema>, APIError> = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/comparison/search/name=${query}&lat=${geolocation.lat}&lng=${geolocation.lng}&radius=${radius}`,
    fetcher
  );

  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pb-40">
      <div className="container space-y-10 mt-10">
        <div className="grid grid-cols-12 gap-8">
          {/* siderbar */}
          <div className="col-span-3">
            {/* distance */}
            <div className="text-sm font-semibold py-4">
              Alcança da pesquisa
            </div>
            <hr />
            {/* <Slider className="w-full" /> */}
          </div>
          {/* results */}
          <div className="col-span-9">
            {/* product */}
            <div className="mb-4 text-xs">
              <span className="font-bold">230</span> resultados encontrados
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-6 bg-background shadow-md rounded-sm space-y-4">
                {/* imagem */}
                <div className="w-full h-[200px]">
                  <Skeleton className="w-full h-full" />
                </div>
                {/* metadata */}
                <div className="">
                  <div className="text-sm font-bold text-amber-500">Marca</div>
                  <div className="font-bold">
                    Café Faraó moído 250g para máquina
                  </div>
                  <div className="text-xs text-muted-foreground">250g</div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Disponível em 4 supermercados
                </div>

                {/* price */}
                <div className="flex justify-between items-end">
                  <div>
                    <small className="text-xs text-muted-foreground">
                      Desde
                    </small>
                    <p className="font-bold">2,40 R$</p>
                  </div>
                  <Button size={"sm"} className="text-xs">
                    Adicionar
                  </Button>
                </div>
              </div>
              <div className="p-6 bg-background shadow-md rounded-sm space-y-4">
                {/* imagem */}
                <div className="w-full h-[200px]">
                  <Skeleton className="w-full h-full" />
                </div>
                {/* metadata */}
                <div className="">
                  <div className="text-sm font-bold text-amber-500">Marca</div>
                  <div className="font-bold">
                    Café Faraó moído 250g para máquina
                  </div>
                  <div className="text-xs text-muted-foreground">250g</div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Disponível em 4 supermercados
                </div>

                {/* price */}
                <div className="flex justify-between items-end">
                  <div>
                    <small className="text-xs text-muted-foreground">
                      Desde
                    </small>
                    <p className="font-extrabold">2,40 R$</p>
                  </div>
                  <Button size={"sm"} className="text-xs">
                    Adicionar
                  </Button>
                </div>
              </div>
              <div className="p-6 bg-background shadow-md rounded-sm space-y-4">
                {/* imagem */}
                <div className="w-full h-[200px]">
                  <Skeleton className="w-full h-full" />
                </div>
                {/* metadata */}
                <div className="">
                  <div className="text-sm font-bold text-amber-500">Marca</div>
                  <div className="font-bold">
                    Café Faraó moído 250g para máquina
                  </div>
                  <div className="text-xs text-muted-foreground">250g</div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Disponível em 4 supermercados
                </div>

                {/* price */}
                <div className="flex justify-between items-end">
                  <div>
                    <small className="text-xs text-muted-foreground">
                      Desde
                    </small>
                    <p className="font-bold">2,40 R$</p>
                  </div>
                  <Button size={"sm"} className="text-xs">
                    Adicionar
                  </Button>
                </div>
              </div>
              <div className="p-6 bg-background shadow-md rounded-sm space-y-4">
                {/* imagem */}
                <div className="w-full h-[200px]">
                  <Skeleton className="w-full h-full" />
                </div>
                {/* metadata */}
                <div className="">
                  <div className="text-sm font-bold text-amber-500">Marca</div>
                  <div className="font-bold">
                    Café Faraó moído 250g para máquina
                  </div>
                  <div className="text-xs text-muted-foreground">250g</div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Disponível em 4 supermercados
                </div>

                {/* price */}
                <div className="flex justify-between items-end">
                  <div>
                    <small className="text-xs text-muted-foreground">
                      Desde
                    </small>
                    <p className="font-bold">2,40 R$</p>
                  </div>
                  <Button size={"sm"} className="text-xs">
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
