"use client";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import cn from "classnames";

import { ThemeProvider } from "@/layouts/theme-provider";
import { SessionProvider } from "next-auth/react";

const dm = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={cn(
          "min-h-screen bg-muted text-foreground font-sans antialiased",
          dm.variable
        )}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
