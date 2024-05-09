import PromptChatInput from "@/components/PromptChatInput";
import { EDLPList } from "@/components/grocery/EDLPList";
import { PurchaseBuilderForm } from "@/components/grocery/PurchaseBuilder";

export default function GroceryPage() {
  return (
    <div className="container pt-10">
      <h1 className="text-2xl font-bold">Criar comparativo de preço</h1>
      <p className="text-gray-500">
        Basta especificar quanto você quer gastar que nós criaremos possíveis
        lista de compras nos supermercados próximo a você.
      </p>
      <PurchaseBuilderForm />
      <EDLPList className="mt-10" />
    </div>
  );
}
