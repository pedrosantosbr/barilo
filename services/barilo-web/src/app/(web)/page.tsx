import Image from "next/image";

import GroceyShopImage from "@/assets/img/hand-drawn-world-vegan-day-illustration.png";

export default function IndexPage() {
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pb-40 space-y-20">
      <section className="container py-20 ">
        <div className="grid grid-cols-2 items-center">
          <div className="col-span-1">
            <h1 className="font-black text-6xl tracking-tighter">
              Economize em supermercados
            </h1>
            <p className="text-lg text-gray-500 pr-20 mt-4">
              Compare os preços de protudos entre os supermercados próximo ao
              seu endereço.
            </p>
          </div>
          <div className="col-span-1">
            <Image
              className="mx-auto"
              alt="Imagem de um supermercado"
              src={GroceyShopImage}
              width={500}
              height={500}
            />
          </div>
        </div>
      </section>
      <section className="container">
        <div className="bg-white rounded-sm shadow-sm p-8 py-12">
          <div className="grid-cols-3 grid gap-10">
            <div className="col-span-1">
              <div className="flex space-x-4 items-center">
                <div className="w-[56px] relative h-[56px] text-center rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shadow-lg">
                  <div className="font-black text-black">1</div>
                </div>
                <p className="text-sm text-black">
                  Busque o produto que você deseje comprar.
                </p>
              </div>
            </div>
            <div className="col-span-1">
              <div className="flex space-x-4 items-center">
                <div className="w-[56px] relative h-[56px] text-center rounded-full bg-gray-50 border border-gray-100  flex items-center justify-center shadow-lg">
                  <div className="font-black text-black">2</div>
                </div>
                <p className="text-sm text-black">
                  Adicione o produto ao carrinho
                </p>
              </div>
            </div>
            <div className="col-span-1">
              <div className="flex space-x-4 items-center">
                <div className="w-[56px] relative h-[56px] text-center rounded-full bg-gray-50 border border-gray-100  flex items-center justify-center shadow-lg">
                  <div className="font-black text-black">3</div>
                </div>
                <p className="text-sm text-black">
                  Acesse o carrinho e compare os preços
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container pt-20">
        <div className="text-center space-y-4 flex flex-col item-center">
          <h2 className="font-black text-5xl tracking-tighter">
            Chega de colecionar encartes
          </h2>
          <div className="h-2 w-10 bg-amber-400 mx-auto"></div>
          <p className="text-lg text-gray-500 w-1/2 mx-auto">
            Entendemos a sua dor, assim como você nós também estamos cansados de
            ficar esperando encartes de supermercados para economizar em nossas
            compras. Estamos aqui para te ajudar a economizar tempo e dinheiro.
          </p>
        </div>
      </section>
    </main>
  );
}
