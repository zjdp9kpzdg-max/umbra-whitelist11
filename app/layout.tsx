import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "UMBRA · Petition",
  description:
    "Umbra — the darkest part of a shadow. 1,111 nocturnal wardens minting on Robinhood Chain. Relics worn in shadow. Petition the Order.",
  icons: {
    icon: [{ url: "/brand/icon-180.png", type: "image/png" }],
    apple: [{ url: "/brand/icon-180.png" }],
  },
  openGraph: {
    title: "UMBRA",
    description:
      "Umbra — the darkest part of a shadow. 1,111 wardens minting on Robinhood Chain. Relics worn in shadow.",
    images: [{ url: "/brand/x_banner.jpg", width: 1500, height: 500 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UMBRA",
    description:
      "Umbra — the darkest part of a shadow. 1,111 wardens minting on Robinhood Chain. Relics worn in shadow.",
    images: ["/brand/x_banner.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
