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
  cep?: string;
  radius?: number;
  setAddress: (address: string) => void;
  setCep: (cep: string) => void;
  setRadius: (radius: number) => void;
};

const initialState: AddressContext = {
  address: undefined,
  cep: undefined,
  radius: undefined,
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
  const [radius, setRadius] = useState<number | undefined>(initialState.radius);

  useEffect(() => {
    const cookies = parseCookies(null);
    if (cookies["barilo.preferences"]) {
      try {
        const v = preferenceCookieSchema.parse(
          JSON.parse(cookies["barilo.preferences"])
        );
        setAddress(v.location.address);
        setCep(v.cep);
        setRadius(v.radius);
      } catch (e) {
        return;
      }
    }
  }, []);

  return (
    <PreferencesContext.Provider
      value={{ address, cep, radius, setAddress, setCep, setRadius }}
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
