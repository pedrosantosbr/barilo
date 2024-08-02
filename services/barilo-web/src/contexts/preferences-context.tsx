"use client";

import { createContext, useContext, useEffect, useState } from "react";
import z from "zod";

// import cookies
import { parseCookies } from "nookies";

export const preferenceCookieSchema = z.object({
  cep: z.string().optional(),
  radius: z.number().optional(),
  location: z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
});

type AddressContext = {
  address?: string;
  geolocation: {
    lat: number;
    lng: number;
  };
  cep?: string;
  radius: number;
  setAddress: (address: string) => void;
  setCep: (cep: string) => void;
  setRadius: (radius: number) => void;
};

const initialState: AddressContext = {
  address: undefined,
  geolocation: {
    lat: 0,
    lng: 0,
  },
  cep: undefined,
  radius: 20,
  setAddress: () => {},
  setCep: () => {},
  setRadius: () => {},
};

export const PreferencesContext = createContext(initialState);

export const PreferencesContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [address, setAddress] = useState<string | undefined>(
    initialState.address
  );
  const [cep, setCep] = useState<string | undefined>(initialState.cep);
  const [radius, setRadius] = useState<number>(initialState.radius);
  const [geolocation, setGeolocation] = useState<AddressContext["geolocation"]>(
    initialState.geolocation
  );

  useEffect(() => {
    const cookies = parseCookies(null);
    if (cookies["barilo.preferences"]) {
      try {
        const v = preferenceCookieSchema.parse(
          JSON.parse(cookies["barilo.preferences"])
        );
        setAddress(v.location.address);
        setCep(v.cep);
        setRadius(v.radius || 20);

        setGeolocation({
          lat: v.location.lat,
          lng: v.location.lng,
        });
      } catch (e) {
        return;
      }
    }
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        geolocation,
        address,
        cep,
        radius,
        setAddress,
        setCep,
        setRadius,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error(
      "usePreferences must be used within a PreferencesContextProvider"
    );
  }
  return context;
};
