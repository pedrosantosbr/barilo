import { Button } from "@/components/ui/button";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";

import Cooker3D from "@/assets/img/cooker-3d.png";
import MegaPhone3D from "@/assets/img/megaphone-3d.png";
import ShoppingCart3D from "@/assets/img/shopping-cart-3d.png";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center justify-center pb-40">
      <div className="container space-y-10">
        <div className="text-center text-5xl font-bold">
          Em que posso te ajudar hoje?
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <div className="border rounded-md shadow-sm p-6 space-y-2">
              <div className="justify-center flex w-[180px] h-[150px] mx-auto">
                <Image src={Cooker3D} alt="Cooker 3D" className="w-full" />
              </div>
              <h1 className="text-xl font-bold">Receitas</h1>
              <p className="text-gray-500">
                Crie receitas incríveis e evite o desperdício de alimentos
                utilizando apenas os ingredientes que você tem em casa.
              </p>
              <Link href={"/offers"} className="w-full flex items-center">
                Ver encartes <ArrowLongRightIcon className="ml-2 w-5" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="border rounded-md shadow-sm p-6 space-y-2">
              <div className="justify-center flex h-[150px] mx-auto">
                <Image
                  src={ShoppingCart3D}
                  alt="Shopping Cart 3D"
                  width={150}
                  height={80}
                />
              </div>
              <h1 className="text-xl font-bold">Compras</h1>
              <p className="text-gray-500">
                Compare o preço dos produtos em diferentes supermercados e
                escolha onde fazer a sua compra do mês.
              </p>
              <Link href={"/shopping"} className="w-full flex items-center">
                Ver encartes <ArrowLongRightIcon className="ml-2 w-5" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="border rounded-md shadow-sm p-6 space-y-2">
              <div className="justify-center flex h-[150px] mx-auto">
                <Image
                  src={MegaPhone3D}
                  alt="Megaphone 3D"
                  width={150}
                  height={80}
                />
              </div>
              <h1 className="text-xl font-bold">Encartes</h1>
              <p className="text-gray-500">
                Descubra as promoções da semana e crie um comparativo de preços
                entre os supermercados da sua região.
              </p>
              <Link href={"/offers"} className="w-full flex items-center">
                Ver encartes <ArrowLongRightIcon className="ml-2 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
