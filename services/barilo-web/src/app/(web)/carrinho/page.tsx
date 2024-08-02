"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StarsIcon } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CartItem, useCart } from "@/contexts/cart-context";
import { usePreferences } from "@/contexts/preferences-context";
import {
  comparisonSchema,
  ComparisonSearchSchema,
} from "@/entities/comparison";
import { FC, useEffect, useState } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { set } from "date-fns";

interface APIError {
  message: string;
}

type RelatedProducts = {
  [key: string]: z.infer<typeof comparisonSchema>;
};

function getProductFullName(
  productName: string,
  productWeight: string,
  productBrand: string | null
) {
  return `${productBrand ? productBrand : ""} ${productName} ${productWeight}`.trim();
}

export default function ShoppingCart() {
  const { items, addItem, removeItem, updateItem, isLoading } = useCart();

  const productsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const productsTotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (productsCount === 0) {
    return (
      <div className="flex h-[100vh] justify-center flex-col items-center pb-40">
        <h4 className="font-black text-2xl tracking-tight">Carrinho vazio</h4>
        <p className="text-gray-500">
          Pesquise alguns produtos e adicione ao carrinho
        </p>
      </div>
    );
  }
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pb-40">
      <div className="container space-y-10 mt-10">
        <h1 className="text-3xl font-black">Carrinho</h1>
        <section className="bg-white flex-1 hidden">
          <div className="relative">
            <div className="flex max-w-full items-start w-fit mx-auto 8xl:min-w-2xl">
              {/* products */}
              <div className="sticky left-0 bg-white z-50 flex-[2_2_0] min-w-[240px]">
                {/* filter */}
                <div className="sticky h-32 bg-white z-50 border-b border-gray-100 flex items-center"></div>
                {/* /.market */}

                <div className="flex flex-col justify-center items-center w-full h-[100px] px-4 border-b border-gray-100 last:border-b-0">
                  {/* market */}
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-[56px] h-[56px] rounded-sm bg-gray-200"></div>
                    <div className="flex flex-col space-y-0.5 tracking-normal flex-1">
                      <p className="tracking-normal font-bold text-xs text-primary-600 leading-none | mb-0">
                        Ouro preto
                      </p>
                      <Link href={"/"}>
                        <p className="tracking-normal font-bold text-sm text-neutral-900 leading-tight line-clamp-2">
                          Feijão preto boa qualidade 500g
                        </p>
                      </Link>
                      <p className="text-neutral-500 text-xs mb-0 ">500g</p>
                    </div>
                  </div>
                  {/* /.market */}
                </div>
              </div>

              {/* prices */}
              <div className="flex-1">
                <div className="sticky z-50 flex overflow-x-auto h-32 max-w-[calc(100vw_-_16rem)] scrollbar-hide">
                  {/* market */}
                  <div className="flex-1 min-w-[140px] z-20">
                    <div className="flex flex-col justify-center items-center w-full text-center h-32 px-2 border-b border-l border-gray-100 bg-white">
                      <div className="font-sans relative flex items-center w-full transition">
                        Royal
                      </div>
                      <div className="flex flex-col mt-1 w-full">
                        <div className="tracking-normal text-xs text-neutral-400 truncate font-medium">
                          Rua Dailton fernandes de carvalho
                        </div>
                      </div>
                      <div className="tracking-normal text-right flex flex-col items-center gap-2 p-2">
                        <p className="text-neutral-300 text-xs whitespace-nowrap">
                          Total
                        </p>
                        <div className="font-bold text-neutral-900 text-xl whitespace-nowrap">
                          18,98
                          <span className="text-base">R$</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* market */}
                  <div className="flex-1 min-w-[140px] z-20">
                    <div className="flex flex-col justify-center items-center w-full text-center h-32 px-2 border-b border-l border-gray-100 bg-white">
                      <div className="font-sans relative flex items-center w-full transition">
                        Royal
                      </div>
                      <div className="flex flex-col mt-1 w-full">
                        <div className="tracking-normal text-xs text-neutral-400 truncate font-medium">
                          Rua Dailton fernandes de carvalho
                        </div>
                      </div>
                      <div className="tracking-normal text-right flex flex-col items-center gap-2 p-2">
                        <p className="text-neutral-300 text-xs whitespace-nowrap">
                          Total
                        </p>
                        <div className="font-bold text-neutral-900 text-xl whitespace-nowrap">
                          18,98
                          <span className="text-base">R$</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* market */}
                  <div className="flex-1 min-w-[140px] z-20">
                    <div className="flex flex-col justify-center items-center w-full text-center h-32 px-2 border-b border-l border-gray-100 bg-white">
                      <div className="font-sans relative flex items-center w-full transition">
                        Royal
                      </div>
                      <div className="flex flex-col mt-1 w-full">
                        <div className="tracking-normal text-xs text-neutral-400 truncate font-medium">
                          Rua Dailton fernandes de carvalho
                        </div>
                      </div>
                      <div className="tracking-normal text-right flex flex-col items-center gap-2 p-2">
                        <p className="text-neutral-300 text-xs whitespace-nowrap">
                          Total
                        </p>
                        <div className="font-bold text-neutral-900 text-xl whitespace-nowrap">
                          18,98
                          <span className="text-base">R$</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex overflow-x-auto max-w-[calc(100vw_-_16rem)] scrollbar-hide">
                  <div className="flex-1 min-w-[140px] overflow-x-auto max-w-[calc(100vw-192px)] z-20">
                    {/* product price */}
                    <div className="w-full relative max-w-[calc(100vw_-_16rem)] h-[100px] flex flex-col items-center justify-center overflow-auto border-b border-l border-gray-100 last:border-b-0 bg-positive-50 !border-positive-100">
                      <p className="tracking-normal font-bold text-base text-neutral-900">
                        2,32 $
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px] overflow-x-auto max-w-[calc(100vw-192px)] z-20">
                    {/* product price */}
                    <div className="w-full relative max-w-[calc(100vw_-_16rem)] h-[100px] flex flex-col items-center justify-center overflow-auto border-b border-l border-gray-100 last:border-b-0 bg-positive-50 !border-positive-100">
                      <p className="tracking-normal font-bold text-base text-neutral-900">
                        2,32 $
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px] overflow-x-auto max-w-[calc(100vw-192px)] z-20">
                    {/* product price */}
                    <div className="w-full relative max-w-[calc(100vw_-_16rem)] h-[100px] flex flex-col items-center justify-center overflow-auto border-b border-l border-gray-100 last:border-b-0 bg-positive-50 !border-positive-100">
                      <p className="tracking-normal font-bold text-base text-neutral-900">
                        2,32 $
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* ./prices */}
            </div>
          </div>
        </section>

        {/* <section className="flex justify-between">
          <div className="ml-auto">
            <GenerateRecipesButton />
          </div>
        </section> */}

        <section className="flex flex-col space-y-10">
          <div className="bg-white">
            <div className="p-4 border-b border-gray-100 flex justify-between">
              <div>
                <p className="font-bold">Resumo das compras</p>
                <p className="text-sm text-gray-500 font-medium">
                  Aqui estão os items mais baratos que encontramos próximo a
                  você
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-xs text-gray-400 font-medium">
                  Total {productsCount} produtos
                </p>
                <div className="flex space-x-2 items-center">
                  <p className="text-xl font-black">
                    {productsTotal.toFixed(2)}{" "}
                    <span className="text-sm">$</span>
                  </p>
                  {/* <p className="text-sm font-black text-red-600 line-through">
                    43,98 <span className="text-sm">$</span>
                  </p> */}
                </div>
                {/* <div>
                  <p className="text-xs text-green-500 font-medium">
                    Economia de +25,00
                  </p>
                </div> */}
              </div>
            </div>
            {/* item */}
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="w-full h-20 border-b border-gray-100" />
                </>
              ) : (
                items.map((item) => (
                  <CartProductItem
                    key={item.product.id}
                    addItem={addItem}
                    removeItem={removeItem}
                    updateItem={updateItem}
                    item={item}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type CartProductItemProps = {
  item: CartItem;
  relatedProducts?: z.infer<typeof ComparisonSearchSchema>;
  addItem: (productId: string) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
};

function CartProductItem({
  item,
  relatedProducts,
  addItem,
  removeItem,
  updateItem,
}: CartProductItemProps) {
  let [isExpand, setIsExpand] = useState(false);

  return (
    <div className="bg-white">
      <div className="grid grid-cols-6 border-b border-gray-100 items-center">
        <div className="col-span-2">
          <div className="flex items-start gap-4 w-full p-4 px-6">
            <div className="w-[56px] h-[56px] rounded-sm bg-gray-200"></div>
            <div className="flex flex-col space-y-0.5 tracking-normal flex-1">
              <p className="tracking-normal font-bold text-xs text-gray-500 leading-none | mb-0">
                {item.product.brand}
              </p>
              <Link href={"/"}>
                <p className="tracking-normal font-bold text-sm text-neutral-900 leading-tight line-clamp-2">
                  {item.product.name}
                </p>
              </Link>
              <p className="text-neutral-500 text-xs mb-0 ">
                {item.product.weight}
              </p>
              <div
                onClick={() => setIsExpand(!isExpand)}
                className="text-xs text-blue-500 underline cursor-pointer"
              >
                Ver outros produtos
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-bold">{item.product.market.name}</p>
          <p className="text-xs font-medium text-gray-500 text-wrap">
            {item.product.location.address}
          </p>
        </div>
        <div className="col-span-2">
          <div className="flex justify-end items-center">
            <div className="flex items-center space-x-1 pr-8">
              <div className="px-4">{item.quantity}</div>
              <Button
                onClick={() => addItem(item.product.id)}
                className="h-8"
                size={"sm"}
              >
                +
              </Button>
              <Button
                onClick={() => updateItem(item.product.id, item.quantity - 1)}
                className="h-8"
                size={"sm"}
              >
                -
              </Button>
              <Button
                onClick={() => removeItem(item.product.id)}
                className="h-8"
                size={"sm"}
              >
                remove
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="flex flex-col items-end space-x-2">
                <p className="font-black">
                  {item.product.price} <span className="text-xs">R$</span>
                </p>
                {/* <p className="text-xs text-green-500 font-medium">
                  Economize 3,00
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={cn("px-20 bg-gray-50", !!relatedProducts && "hidden")}>
        <AnimatePresence initial={false}>
          {isExpand && (
            <motion.div
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <RelatedProducts item={item} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RelatedProducts({ item }: { item: CartItem }) {
  const [relatedProducts, setRelatedProducts] = useState<
    z.infer<typeof ComparisonSearchSchema>
  >([]);

  const { geolocation, radius } = usePreferences();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/comparison/search/?name=${getProductFullName(item.product.name, item.product.weight, item.product.brand)}&lat=${geolocation.lat}&lng=${geolocation.lng}&radius=${radius}`,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = (await resp.json()) as z.infer<
          typeof ComparisonSearchSchema
        >;

        setRelatedProducts(data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    }

    fetchRelatedProducts();
  }, [item, geolocation, radius]);

  console.log(relatedProducts?.length);

  return (
    <div className="">
      <div className="flex flex-col gap-1">
        {relatedProducts.length > 0 &&
          relatedProducts[0].products
            .filter((product) => product.id !== item.product.id)
            .map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center last:border-none border-b border-gray-100 p-4"
              >
                <div>
                  <p className="text-xs font-medium">
                    <strong>{product.market.name}</strong> -{" "}
                    {product.location.address}
                  </p>
                  <p className="font-bold text-sm">{product.name}</p>
                  <p className="text-xs">{product.weight}</p>
                </div>
                <div>
                  <p className="font-black text-sm">
                    {product.price} <span className="text-xs">R$</span>
                  </p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

// Dialog
function GenerateRecipesButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <span className="font-light mr-1">AI</span>
          <StarsIcon className="w-4 h-4 mr-2" />
          Gerar Receitas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
