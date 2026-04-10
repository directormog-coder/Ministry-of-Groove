import type { Metadata } from "next";
import { Cormorant_Garamond, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/lib/toast";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Origin 54 — The Asili Collective",
  description: "African luxury fashion rooted in heritage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${bebas.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[var(--cream)]">
        <ToastProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
