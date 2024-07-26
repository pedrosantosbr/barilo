import { cartItemSchema, cartSchema } from "@/entities/cart";
import { createContext, useContext, useEffect, useState } from "react";
import useSWR, { SWRResponse } from "swr";
import { z } from "zod";

type CartItem = {
  product: {
    id: string;
    name: string;
    price: number;
    weight: string;
    brand: string | null;
    market: string;
    location: string;
  };
  quantity: number;
  totalPrice: number;
};

interface APIError {
  message: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
}

const intialState: CartContextType = {
  items: [],
  addItem: (productId: string) => {},
  removeItem: (productId: string) => {},
};

const fetcher = (url: string): Promise<z.infer<typeof cartSchema>> =>
  fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

export const CartContext = createContext(intialState);

export const CartContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [items, setItems] = useState<CartItem[]>(intialState.items);

  const {
    data,
    error,
    isLoading,
    mutate,
  }: SWRResponse<z.infer<typeof cartSchema>, APIError> = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/`,
    fetcher
  );

  useEffect(() => {
    if (data && !error && !isLoading) {
      const cartItems: CartItem[] = data.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        totalPrice: item.total_price,
      }));
      setItems(cartItems);
    }
  }, [data, error, isLoading]);

  const addItem = async (productId: string) => {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/add/${productId}/`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: 1 }),
      }
    );

    if (resp.ok) {
      const item = (await resp.json()) as z.infer<typeof cartItemSchema>;
      mutate();
    } else {
      console.error(resp.statusText);
    }
  };

  const removeItem = async (productId: string) => {
    // XXX: Adding the credenetials: "include" header to the request
    // will cause a CORS error. WHY?????????
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/remove/${productId}/`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (resp.ok) {
      setItems(items.filter((item) => item.product.id !== productId));
    } else {
      console.error(resp.statusText);
    }
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
