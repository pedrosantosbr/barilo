"use client";

import { MapPinnedIcon, ShoppingCart } from "lucide-react";
import { CircularListResponseSchema } from "@/entities/store";
import { OffersTemplate } from "@/components/offers/offers-template";

import { ConnectWhatsAppNumber } from "@/components/connect-whatsapp-number";
import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts/footer";
import { SelectRadiusPreference } from "@/components/preferences/select-radius-preference";

import z from "zod";
import { useEffect, useState } from "react";

interface FetchCircularsParams {
  rad: number;
  lat: number;
  lng: number;
}

async function fetchCirculars({ rad, lat, lng }: FetchCircularsParams) {
  try {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/circulars/search/?rad=${rad}&lat=${lat}&lng=${lng}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!resp.ok) {
      console.error("Failed to fetch circulars.", resp.status);
      return [];
    }
    const parsedData = CircularListResponseSchema.parse(await resp.json());

    return parsedData;
  } catch (error) {
    console.error("Failed to fetch data", error);
    throw error;
  }
}

// async function fetchWhatsAppPhoneNumbers() {
//   try {
//     const resp = await fetch(
//       `${process.env.API_URL}/api/v1/whatsapp/phone-numbers/`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${getNextCookie("barilo.access-token")}`,
//         },
//       }
//     );
//     if (!resp.ok) {
//       console.error("Failed to fetch phone numbers", resp.status);
//       return [];
//     }

//     const parsedData = (await resp.json()) as string[];
//     console.log(`🎃 parsedData:`, parsedData);
//     return parsedData;
//   } catch (error) {
//     // console.error("Failed to fetch data", error);
//     return [];
//   }
// }

export default function CircularsPage() {
  const [circulars, setCirculars] = useState<
    z.infer<typeof CircularListResponseSchema>
  >([]);

  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const circulars = await fetchCirculars({
        rad: 5,
        lat: -23.5505,
        lng: -46.6333,
      });

      setCirculars(circulars);

      // const phoneNumbers = await fetchWhatsAppPhoneNumbers();
      // setCirculars(circulars);
      // setPhoneNumbers(phoneNumbers);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  return (
    <>
      <Header />
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
            <MapPinnedIcon className="w-4 h-4" />
            <SelectRadiusPreference />
          </div>
        </div>

        <div className="container space-y-10 pt-14">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8">
              <OffersTemplate circulars={circulars} />
            </div>
            <div className="col-span-4">
              {/* <div className="text-xl font-extrabold">Melhores Ofertas</div>
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
              </ul> */}

              {phoneNumbers.length === 0 && <ConnectWhatsAppNumber />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
