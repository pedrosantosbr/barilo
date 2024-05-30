"use client";

import { HomeIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAddress } from "@/contexts/address-context";

export const Header = () => {
  const { address } = useAddress();
  return (
    <header className="bg-amber-400 dark:bg-black">
      <div className="h-14 flex items-center container">
        <div className="">
          <div className="font-bold text-2xl">Barilo</div>
        </div>
        <div className="flex items-center self-center"></div>
        <div className="ml-auto">
          <nav>
            <ul className="flex space-x-4 items-center font-medium">
              <li>
                <Link href="/" className="flex items-center">
                  <HomeIcon className="mr-2 w-4" /> Menu inicial
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="flex items-center">
                  <Megaphone className="mr-2 w-4" /> Encartes
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/*  */}
      <div className="container h-10 flex">
        <AddressModal />

        <div className="ml-auto h-10 flex items-center">
          <nav>
            <ul className="flex space-x-4 items-center text-sm font-medium">
              <li>
                <Link href="/" className="">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/" className="">
                  Publique seu encarte
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export function AddressModal() {
  const { address } = useAddress();
  const [cep, setCep] = useState<string>("");

  function onCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    // if value is not a number, return
    setCep(e.target.value);
  }

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    // if cep is not a valid cep, return
    e.preventDefault();

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/lo/preferences/`, {
        mode: "cors",
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          cep: cep.replace(/[^0-9]/g, ""),
          distance: 1,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      window.location.reload();
    } catch (error) {
      console.log("error", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center font-medium text-sm cursor-pointer">
          <MapPinIcon className="w-4 mr-2" />
          {!!address ? `${address.slice(0, 20)}...` : "Selecionar endereço"}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            Selecione onde você quer pesquisar suas compras
          </DialogTitle>
          <DialogDescription>
            Você poderá ver ofertas e produtos disponíveis para entrega em sua
            região.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <form action="" onSubmit={submitHandler}>
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="cep"
                onChange={onCepChange}
                // format value to cep regex
                value={(cep || "").replace(/(\d{5})(\d{3})/, "$1-$2")}
                placeholder="00000-000"
                className="col-span-3 tracking-widest"
              />
              <Button type="submit">Usar</Button>
            </div>
            <Button variant={"link"}>Não sei meu CEP</Button>
          </form>
        </div>
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
