import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  SIGNAL_OG_IMAGE,
  SIGNAL_SITE_URL,
  SIGNAL_SUPPLY,
  UMBRA_X_HANDLE,
} from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description = `they don’t sleep. ${SIGNAL_SUPPLY} pixel radio-head pfps.`;

export const metadata: Metadata = {
  metadataBase: new URL(SIGNAL_SITE_URL),
  title: "signal",
  description,
  icons: {
    icon: [{ url: SIGNAL_OG_IMAGE, type: "image/png" }],
    apple: [{ url: SIGNAL_OG_IMAGE }],
  },
  openGraph: {
    title: "signal",
    description,
    images: [{ url: SIGNAL_OG_IMAGE, width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "signal",
    description,
    images: [SIGNAL_OG_IMAGE],
    creator: `@${UMBRA_X_HANDLE}`,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
