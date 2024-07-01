import { ShoppingSimulatorForm } from "@/components/shopping/ShoppingSimulatorForm";
import { ShoppingSimulatorResult } from "@/components/shopping/ShoppingSimulatorResult";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { ComponentPlaceholderIcon } from "@radix-ui/react-icons";
import { SearchCheckIcon } from "lucide-react";
import Image from "next/image";

export default function Shopping() {
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pb-40">
      {/* <div className="h-28 border-b w-full bg-[url('/img/banner-2023102713131165106.jpg')] bg-cover">
        <div className="container flex items-center h-28">
          <div className="flex font-bold bg-white shadow-md items-center rounded-lg p-4 space-x-2">
            <SearchCheckIcon className="w-5 h-5" />
            <div className="text-lg tracking-tight">Promoções de encartes</div>
          </div>
        </div>
      </div> */}
      <div className="container space-y-10 mt-10">
        {/* <div className="w-full">
            <ShoppingSimulatorForm />
          </div> */}
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
