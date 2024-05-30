import { createContext, useContext, useEffect, useState } from "react";
import z from "zod";

// import cookies
import { parseCookies } from "nookies";

const preferenceCookieSchema = z.object({
  cep: z.string().optional(),
  address: z.string().optional(),
  distance: z.number().optional(),
});

type AddressContext = {
  address?: string;
  cep?: string;
  distance?: number;
  setAddress: (address: string) => void;
  setCep: (cep: string) => void;
  setDistance: (distance: number) => void;
};

const initialState: AddressContext = {
  address: undefined,
  cep: undefined,
  distance: undefined,
  setAddress: () => {},
  setCep: () => {},
  setDistance: () => {},
};

export const AddressContext = createContext(initialState);

export const AddressContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [address, setAddress] = useState<string | undefined>(
    initialState.address
  );
  const [cep, setCep] = useState<string | undefined>(initialState.cep);
  const [distance, setDistance] = useState<number | undefined>(
    initialState.distance
  );

  useEffect(() => {
    const cookies = parseCookies(null);
    if (cookies["barilo.preferences"]) {
      try {
        const v = preferenceCookieSchema.parse(
          JSON.parse(cookies["barilo.preferences"])
        );
        setAddress(v.address);
        setCep(v.cep);
        setDistance(v.distance);
      } catch (e) {
        return;
      }
    }
  }, []);

  return (
    <AddressContext.Provider
      value={{ address, cep, distance, setAddress, setCep, setDistance }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error("useAddress must be used within a AddressContextProvider");
  }
  return context;
};
