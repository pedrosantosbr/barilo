"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowDownAz } from "lucide-react";
import { LinkIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

export const WhatsappNumber = () => {
  const { status } = useSession();

  const [phoneNumber, setPhoneNumber] = useState("");
  return (
    <div className="border bg-white shadow-lg space-y-4  p-5 rounded-lg mt-10">
      <h1 className="text-xl font-bold">Receber Ofertas pelo Whatsapp</h1>
      <div>
        <Input
          onChange={(e) => setPhoneNumber(e.target.value)}
          value={(phoneNumber || "").replace(
            /(\d{2})(\d{4})(\d{5})/,
            "($1) $2-$3"
          )}
          placeholder="Seu número de telefone"
        />
      </div>
      {status === "authenticated" ? (
        <Button className="font-bold">Quero Receber</Button>
      ) : (
        <CreateAccountModal />
      )}
    </div>
  );
};

export function CreateAccountModal() {
  const { status } = useSession();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="font-bold">Quero Receber</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            Crie uma conta para receber promoções atualizadas
          </DialogTitle>
          <DialogDescription>
            Você poderá receber ofertas diárias de nossos parceiros
          </DialogDescription>
        </DialogHeader>
        <div>
          <Link href={"/registrar"} className="underline">
            Criar uma conta
          </Link>
        </div>
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
