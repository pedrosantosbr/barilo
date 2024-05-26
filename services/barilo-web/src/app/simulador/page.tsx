import { ShoppingSimulatorForm } from "@/components/shopping/ShoppingSimulatorForm";
import { ShoppingSimulatorResult } from "@/components/shopping/ShoppingSimulatorResult";

export default function Shopping() {
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pt-10  pb-40">
      <div className="container space-y-10">
        <div className="text-center text-5xl font-bold">
          Simulador de compras
        </div>
        <div className="flex justify-center">
          <div className="w-2/3">
            <ShoppingSimulatorForm />
            <div className="shopping-list mt-12 space-y-4">
              <ShoppingSimulatorResult
                storeName="Supermercado Pérola"
                bestOffer
                total={122.23}
              />
              <ShoppingSimulatorResult
                storeName="Supermercado Royal"
                total={140.05}
              />
              <ShoppingSimulatorResult
                storeName="Supermercado Bramil"
                total={152.78}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
