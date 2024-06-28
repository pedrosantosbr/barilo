"use client";

import { Header } from "@/components/layouts/header";
import { PreferencesContextProvider } from "@/contexts/address-context";
import { SessionProvider } from "next-auth/react";

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SessionProvider>
        <PreferencesContextProvider>
          <Header />
          {children}
        </PreferencesContextProvider>
      </SessionProvider>
    </div>
  );
}
