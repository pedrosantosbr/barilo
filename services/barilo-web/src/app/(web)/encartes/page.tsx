"use client";

import { MapPinnedIcon, ShoppingCart } from "lucide-react";
import { CircularListResponseSchema } from "@/entities/store";
import { OffersTemplate } from "@/components/offers/offers-template";

import { ConnectWhatsAppNumber } from "@/components/connect-whatsapp-number";
import { SelectRadiusPreference } from "@/components/preferences/select-radius-preference";

import z from "zod";
import useSWR, { SWRResponse } from "swr";
import { useEffect, useState } from "react";
import { usePreferences } from "@/contexts/preferences-context";
import { useSession } from "next-auth/react";

interface APIError {
  message: string;
}

const fetcher = (
  url: string
): Promise<z.infer<typeof CircularListResponseSchema>> =>
  fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

export default function CircularsPage() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [phoneNumbers, setPhoneNumbers] = useState<{ phone_number: string }[]>(
    []
  );
  const { geolocation, radius } = usePreferences();
  const { lat, lng } = geolocation;

  const {
    data: circulars,
    error,
    isLoading,
    mutate,
  }: SWRResponse<z.infer<typeof CircularListResponseSchema>, APIError> = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/circulars/search/?rad=${radius}&lat=${lat}&lng=${lng}`,
    fetcher
  );

  useEffect(() => {
    mutate();
  }, [geolocation, radius, mutate]);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/whatsapp/phone-numbers/`,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = (await resp.json()) as { phone_number: string }[];
        setPhoneNumbers(data);
      } catch (error) {
        console.log(error);
      }
    }
    if (isAuthenticated) {
      fetchRelatedProducts();
    }
  }, [isAuthenticated]);

  return (
    <>
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
              {isLoading && <div>Loading...</div>}
              {error && <div>Error: {error.message}</div>}
              {circulars && <OffersTemplate circulars={circulars} />}
            </div>
            <div className="col-span-4">
              {phoneNumbers.length === 0 && <ConnectWhatsAppNumber />}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
