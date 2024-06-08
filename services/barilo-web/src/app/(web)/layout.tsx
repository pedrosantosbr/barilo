"use client";

import { Header } from "@/components/layouts/header";
import { AddressContextProvider } from "@/contexts/address-context";
import { SessionProvider } from "next-auth/react";

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SessionProvider>
        <AddressContextProvider>
          <Header />
          {children}
        </AddressContextProvider>
      </SessionProvider>
    </div>
  );
}
