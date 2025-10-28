import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/styles/globals.css";

import { Toaster } from "@/components/core/Toaster";
import { AuthHydrator } from "@/components/core/auth-hydrator";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://calameno.local"),
  title: {
    template: "%s | Calameno Inventario",
    default: "Calameno Inventario",
  },
  description: "Frontend Next.js para inventarios integrados con Laravel Sanctum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthHydrator />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
