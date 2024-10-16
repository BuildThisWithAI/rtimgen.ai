import Providers from "@/components/providers";
import clsx from "clsx";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Image Generator",
  description: "Generate images using AI, model from black-forest-labs/FLUX.1-schnell",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx("antialiased font-sans min-h-screen", fontSans.variable, fontMono.variable)}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
