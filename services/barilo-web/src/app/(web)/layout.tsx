"use client";

import { Header } from "@/components/layouts/header";
import { CartContextProvider } from "@/contexts/cart-context";
import { PreferencesContextProvider } from "@/contexts/preferences-context";
import { SessionProvider } from "next-auth/react";

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <PreferencesContextProvider>
        <CartContextProvider>
          <Header />
          {children}
        </CartContextProvider>
      </PreferencesContextProvider>
    </div>
  );
}
