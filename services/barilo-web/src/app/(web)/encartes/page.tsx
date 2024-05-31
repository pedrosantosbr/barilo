"use server";

import { MapPinnedIcon, ShoppingCart } from "lucide-react";
import { CircularListResponseSchema } from "@/entities/store";
import { OffersTemplate } from "@/components/offers/offers-template";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConnectWhatsAppNumber } from "@/components/connect-whatsapp-number";
import { getNextCookie } from "@/app/_utils";

async function fetchCirculars() {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/v1/circulars/search/`
    );
    const parsedData = CircularListResponseSchema.parse(await response.json());

    return parsedData;
  } catch (error) {
    console.error("Failed to fetch data", error);
    throw error;
  }
}

async function fetchWhatsAppPhoneNumbers() {
  try {
    const resp = await fetch(
      `${process.env.API_URL}/api/v1/whatsapp/phone-numbers/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getNextCookie("barilo.access-token")}`,
        },
      }
    );
    if (!resp.ok) {
      console.error("Failed to fetch phone numbers", resp.status);
      return [];
    }

    const parsedData = (await resp.json()) as string[];
    console.log(`🎃 parsedData:`, parsedData);
    return parsedData;
  } catch (error) {
    // console.error("Failed to fetch data", error);
    return [];
  }
}

export default async function Circulars() {
  const circulars = await fetchCirculars();
  const phoneNumbers = await fetchWhatsAppPhoneNumbers();

  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pb-40">
      <div className="h-28 border-b w-full bg-[url('/img/banner-2023102713131165106.jpg')] bg-cover">
        <div className="container flex items-center h-28">
          <div className="flex bg-white shadow-md items-center rounded-lg p-4 space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <div className="tracking-tight font-bold">
              Promoções de encartes
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 shadow-md w-full bg-background">
        <div className="container flex items-center space-x-2">
          <MapPinnedIcon className="w-4 h-4 text-muted-foreground" />
          <div className="text-sm">Distância</div>
          <Select>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="0km" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Entre 0 e 10km</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="container space-y-10 pt-14">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <OffersTemplate circulars={circulars} />
          </div>
          <div className="col-span-4">
            <div className="text-xl font-extrabold">Melhores Ofertas</div>
            <ul className="flex text-sm pt-6 flex-wrap">
              <li className="flex items-center justify-between bg-background border rounded-md px-2 py-1 shadow-md font-medium whitespace-nowrap mr-2 mb-2">
                <div className="mr-4">Banana</div>
                <div className="font-medium">2.99</div>
              </li>
              <li className="flex items-center justify-between bg-background border rounded-md px-2 py-1 shadow-md font-medium whitespace-nowrap mr-2 mb-2">
                <div className="mr-4">Arroz Palmares 5kg tipo 1</div>
                <div className="font-medium">4.99</div>
              </li>
              <li className="flex items-center justify-between bg-background border rounded-md px-2 py-1 shadow-md font-medium whitespace-nowrap mr-2 mb-2">
                <div className="mr-4">Carne bovina p/ churrasco</div>
                <div className="font-medium">4.99</div>
              </li>
            </ul>

            {/*  */}
            {phoneNumbers.length > 0 && <ConnectWhatsAppNumber />}
          </div>
        </div>
      </div>
    </main>
  );
}
