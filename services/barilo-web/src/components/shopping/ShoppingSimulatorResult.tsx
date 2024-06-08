import { cn } from "@/lib/utils";
import { ShoppingCartIcon } from "lucide-react";

export function ShoppingSimulatorResult({
  total,
  storeName,
  bestOffer,
}: {
  total: number;
  storeName: string;
  bestOffer?: boolean;
}) {
  return (
    <div className="shadow-sm bg-background rounded-md border flex flex-col w-full">
      <div className="flex items-center p-4">
        <div className="mr-4 w-[5%]">
          <ShoppingCartIcon className="w-8 mr-2" />
        </div>
        <div className="flex flex-col mr-4 w-[30%]">
          <h4 className="font-bold">{storeName}</h4>
          <p className="text-gray-500 text-sm">Rua 1, n2</p>
        </div>
        {/* <div className="flex text-sm flex-col mr-4">
          <span className="">Distância</span>
          <p className="font-bold">1,2 km</p>
        </div> */}
        {/* <div className="flex flex-col mr-4">
          <span className="text-sm">Refeições</span>
          <p className="font-bold">128</p>
        </div> */}
        <div className={cn("mx-auto hidden", bestOffer && "block")}>
          <span className="text-white text-sm font-semibold p-1 bg-green-500">
            Melhor compra
          </span>
        </div>
        <div className="ml-auto">
          <div className="total">
            <span>R$ {total}</span>
          </div>
        </div>
      </div>
      <div className="border-t p-4 bg-gray-50 hidden">
        <table className="text-xs table-fixed w-full">
          <thead>
            <tr>
              <th className="min-w-[40%] text-left">Produto</th>
              <th className="text-left">Preço</th>
              <th>Qtd</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Arroz</td>
              <td>R$ 10,00</td>
              <td className="text-center">2</td>
              <td className="text-right">R$ 20,00</td>
            </tr>
            <tr>
              <td>Feijão</td>
              <td>R$ 8,00</td>
              <td className="text-center">2</td>
              <td className="text-right">R$ 16,00</td>
            </tr>
            <tr>
              <td>Carne</td>
              <td>R$ 20,00</td>
              <td className="text-center">2</td>
              <td className="text-right">R$ 16,00</td>
            </tr>
            <tr>
              <td>Macarrão</td>
              <td>R$ 5,00</td>
              <td className="text-center">2</td>
              <td className="text-right">R$ 16,00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
