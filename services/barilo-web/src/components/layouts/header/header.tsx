"use client";

import Link from "next/link";
import { Loader2Icon, LogOut, Megaphone, ShoppingCart } from "lucide-react";
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
import {
  preferenceCookieSchema,
  usePreferences,
} from "@/contexts/preferences-context";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "../../ui/avatar";
import { setCookie } from "nookies";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Session } from "next-auth";

// Agolia search
import { createQuerySuggestionsPlugin } from "@algolia/autocomplete-plugin-query-suggestions";
import { createLocalStorageRecentSearchesPlugin } from "@algolia/autocomplete-plugin-recent-searches";

import "@algolia/autocomplete-theme-classic";
import { Autocomplete } from "./agolia-autocomplete";
import { useLazyRef } from "@/hooks/use-lazy-ref";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { Badge } from "@/components/ui/badge";
import { agoliaSearchClient } from "@/lib/agolia";

const searchClient = agoliaSearchClient();

const AGOLIA_SEARCH_INDEX =
  process.env.NODE_ENV === "production" ? "product_index" : "dev_product_index";

export const Header = () => {
  const { status, data } = useSession();
  const user: Session["user"] = { address: "", ...data?.user };
  const router = useRouter();
  const isAuthenticated = status === "authenticated";

  const getRecentSearchesPlugin = useLazyRef(() =>
    createLocalStorageRecentSearchesPlugin({
      key: "RECENT_SEARCH",
      limit: 5,
      transformSource({ source, onTapAhead, onRemove }) {
        return {
          ...source,
          // templates: {
          //   item({ item, components }) {
          //     return (
          //       <AutocompleteItem
          //         router={router}
          //         href={`/search/?query=${item.label}`}
          //         icon={ClockIcon}
          //         actions={
          //           <>
          //             <AutocompleteItemAction
          //               icon={TrashIcon}
          //               title="Remove this search"
          //               onClick={(event) => {
          //                 event.preventDefault();
          //                 event.stopPropagation();

          //                 onRemove(item.label);
          //               }}
          //             />
          //             <AutocompleteItemAction
          //               icon={ArrowUpLeftIcon}
          //               title={`Fill query with "${item.label}"`}
          //               onClick={(event) => {
          //                 event.preventDefault();
          //                 event.stopPropagation();

          //                 onTapAhead(item);
          //               }}
          //             />
          //           </>
          //         }
          //       >
          //         <components.ReverseHighlight hit={item} attribute="label" />
          //       </AutocompleteItem>
          //     );
          //   },
          // },
        };
      },
    })
  );

  const getQuerySuggestionsPlugin = useLazyRef(() =>
    createQuerySuggestionsPlugin({
      searchClient,
      indexName: AGOLIA_SEARCH_INDEX,
      transformSource({ source, onTapAhead }) {
        return {
          ...source,
          getItemUrl({ item }) {
            return `/search/?query=${item.query}`;
          },
          templates: {
            ...source.templates,
            item({ item, components }) {
              return (
                <Link href={`/search/?query=${item.name}`}>
                  <components.ReverseHighlight hit={item} attribute="name" />
                </Link>
              );
            },
          },
          // templates: {
          //   ...source.templates,
          //   item({ item, components }) {
          //     return (
          //       <AutocompleteItem
          //         router={router}
          //         href={`/search/?query=${item.query}`}
          //         icon={MagnifyingGlassIcon}
          //         actions={
          //           <AutocompleteItemAction
          //             icon={ArrowUpLeftIcon}
          //             title={`Fill query with "${item.query}"`}
          //             onClick={(event) => {
          //               event.preventDefault();
          //               event.stopPropagation();

          //               onTapAhead(item);
          //             }}
          //           />
          //         }
          //       >
          //         <components.ReverseHighlight hit={item} attribute="query" />
          //       </AutocompleteItem>
          //     );
          //   },
          // },
        };
      },
    })
  );

  const { items } = useCart();
  const productsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-amber-400 dark:bg-black">
      <div className="h-14 pt-4 grid items-center grid-cols-12 container gap-4">
        <div className="col-span-1">
          <Link href={"/"}>
            <div className="font-black text-2xl">Barilo</div>
          </Link>
        </div>
        <div className="col-span-5">
          <Autocomplete
            classNames={{
              form: "relative shadow-md !border-none !rounded-lg flex-1",
              inputWrapper: "rounded-lg",
            }}
            onSubmit={(e) => router.push(`/search/?query=${e.state.query}`)}
            plugins={[getRecentSearchesPlugin(), getQuerySuggestionsPlugin()]}
          />
        </div>
        <div className="col-span-6 justify-self-end">
          <nav className="">
            <ul className="flex space-x-4 items-center font-medium text-md">
              {/* <li>
                <Link href="/" className="flex items-center">
                  <HomeIcon className="mr-2 w-4" /> Menu inicial
                </Link>
              </li> */}
              <li>
                <Link href="/carrinho" className="flex items-center">
                  {items.length > 0 && (
                    <Badge variant={"destructive"}>{productsCount}</Badge>
                  )}
                  <ShoppingCart className="mr-2 w-4 " /> Carrinho
                </Link>
              </li>
              <li>
                <Link href="/encartes" className="flex items-center">
                  <Megaphone className="mr-2 w-4" /> Promoções & Encartes
                </Link>
              </li>
              {isAuthenticated && user && (
                <li>
                  <ProfileDropdownMenu user={user} />
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
      {/*  */}
      <div className="container h-12 flex">
        <AddressModal />

        <div className="ml-auto h-10 flex items-center">
          <nav>
            <ul className="flex space-x-4 items-center text-sm font-medium">
              <li className={cn(isAuthenticated && "hidden")}>
                <Link href="/" className="">
                  Crie sua conta
                </Link>
              </li>
              {!isAuthenticated && (
                <li>
                  <Link href="/login" className="">
                    Login
                  </Link>
                </li>
              )}
              <li>
                <Link href="/" className="">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/central-do-anunciante" className="font-bold">
                  Central do anunciante
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
  const { address } = usePreferences();
  const [cep, setCep] = useState<string>("");
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  function onCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    // if value is not a number, return
    setCep(e.target.value);
  }

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    // if cep is not a valid cep, return

    e.preventDefault();

    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/preferences/`,
        {
          method: "POST",
          body: JSON.stringify({
            cep: cep.replace(/[^0-9]/g, ""),
            radius: 10,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsLoading(true);
      if (!resp.ok) {
        console.log("Error setting address.", resp);
        setError("Endereço não encontrado.");
        return;
      }
      try {
        const payload = preferenceCookieSchema.parse(await resp.json());
        setCookie(null, "barilo.preferences", JSON.stringify(payload));
      } catch (e) {
        console.error("Error parsing preferences response", e);
      }
      window.location.reload();
    } catch (error) {
      console.log("error", error);
      setError("Erro nos servidor, tente novamente.");
    } finally {
      setIsLoading(false);
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
              <Button disabled={isLoading} type="submit">
                {isLoading ? <Loader2Icon className="animate-spin" /> : "Usar"}
              </Button>
            </div>
            {error && <small className="text-red-500">{error}</small>}
          </form>
          <Button variant={"link"}>Não sei meu CEP</Button>
        </div>
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}

export function ProfileDropdownMenu({ user }: { user: Session["user"] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="hover:bg-amber-300 bg-gradient-to-r from-amber-200/50 to-amber-200/20 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
          variant={"ghost"}
        >
          <div className="flex items-center space-x-2">
            <div className="font-medium">{user.name}</div>
            <Avatar className="bg-amber-600/20 h-6 w-6" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          Sair
          <DropdownMenuShortcut>
            <LogOut className="w-4 text-black" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
