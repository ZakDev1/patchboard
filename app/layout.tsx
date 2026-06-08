import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "fumadocs-ui/style.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { RootProvider } from "fumadocs-ui/provider/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Patchboard",
  description: "Dependency updates, reviewed not ignored",
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-zinc-50 text-zinc-900 antialiased`}
      >
        <RootProvider>
          {children} <Toaster />
        </RootProvider>
      </body>
    </html>
  );
}
