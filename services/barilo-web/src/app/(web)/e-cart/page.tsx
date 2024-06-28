import { ShoppingSimulatorForm } from "@/components/shopping/ShoppingSimulatorForm";
import { ShoppingSimulatorResult } from "@/components/shopping/ShoppingSimulatorResult";
import { SearchCheckIcon } from "lucide-react";

export default function Shopping() {
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pb-40">
      <div className="h-28 border-b w-full bg-[url('/img/banner-2023102713131165106.jpg')] bg-cover">
        <div className="container flex items-center h-28">
          <div className="flex font-bold bg-white shadow-md items-center rounded-lg p-4 space-x-2">
            <SearchCheckIcon className="w-5 h-5" />
            <div className="text-lg tracking-tight">Promoções de encartes</div>
          </div>
        </div>
      </div>
      <div className="container space-y-10 mt-10">
        <div className="flex justify-center">
          <div className="w-full">
            <ShoppingSimulatorForm />
          </div>
        </div>
      </div>
    </main>
  );
}