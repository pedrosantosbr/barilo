"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
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
import z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PhoneNumberInput } from "./ui/phone-number-input";

const formSchema = z.object({
  phone_number: z.string().min(11, {
    message: "Número de telefone inválido.",
  }),
});

// const fetcher = (url: string) =>
//   fetch(url, { credentials: "include" }).then((res) => res.json());

export const ConnectWhatsAppNumber = () => {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState("");

  // const { data } = useSWR(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/v1/whatsapp/phone-numbers`,
  //   fetcher
  // );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: "",
    },
  });

  const { setError } = form;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // remove mask from phone number
    const phoneNumber = data.phone_number.replace(/\D/g, "");
    try {
      setIsLoading(true);
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/whatsapp/phone-numbers/`,
        {
          method: "POST",
          credentials: "include",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone_number: phoneNumber }),
        }
      );

      if (!resp.ok) {
        // Unauthorized
        if (resp.status === 401) {
          window.location.reload();
          return;
        }

        try {
          const err = (await resp.json()) as { message: string };
          setError("phone_number", { type: "400", message: err.message });
          return;
        } catch (e) {
          console.log(e);
        }
      }

      try {
        await resp.json();
        window.location.reload();
        return;
      } catch (e) {
        console.error(e);
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border bg-white shadow-lg space-y-4 p-5 rounded-lg">
      <h1 className="text-xl font-bold">Receber Ofertas pelo Whatsapp</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de telefone</FormLabel>
                <FormControl>
                  <PhoneNumberInput {...field} placeholder="(99) 9999-99999" />
                </FormControl>
                <FormMessage />

                <FormDescription>
                  Insira seu número de telefone para receber ofertas diárias
                </FormDescription>
              </FormItem>
            )}
          />
          {status === "authenticated" ? (
            <Button className="font-bold" type="submit">
              {isLoading ? "Enviando..." : "Receber Ofertas"}
            </Button>
          ) : (
            <CreateAccountModal />
          )}
        </form>
      </Form>
    </div>
  );
};

export function CreateAccountModal() {
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
