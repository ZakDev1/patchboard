import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "fumadocs-ui/style.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { RootProvider } from "fumadocs-ui/provider/next";
import { ThemeProvider } from "next-themes";

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
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        <RootProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children} <Toaster />
          </ThemeProvider>
        </RootProvider>
      </body>
    </html>
  );
}
