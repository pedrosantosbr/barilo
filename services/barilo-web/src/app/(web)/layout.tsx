"use client";

import { Header } from "@/components/header";
import { AddressContextProvider } from "@/contexts/address-context";

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AddressContextProvider>
        <Header />
        {children}
      </AddressContextProvider>
    </div>
  );
}
