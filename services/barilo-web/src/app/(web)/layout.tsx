"use client";

import { Header } from "@/components/layouts/header";
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
        <Header />
        {children}
      </PreferencesContextProvider>
    </div>
  );
}
