"use client";

import { Footer } from "@/components/layouts/footer";
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
    <SessionProvider>
      <PreferencesContextProvider>
        <CartContextProvider>
          <Header />
          {children}
          <Footer />
        </CartContextProvider>
      </PreferencesContextProvider>
    </SessionProvider>
  );
}
