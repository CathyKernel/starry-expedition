import type { Metadata, Viewport } from "next";
import { playfair, cormorant } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Starry Expedition — A Cat's Voyage Through Van Gogh's Night",
  description:
    "An interactive HCI design study: sail a wooden boat crewed by a real cat across Vincent van Gogh's The Starry Night (1889), to a live solo-piano arrangement of Pachelbel's Canon in D that begins the moment you arrive. Discover the moon, Venus, the great swirl, the cypress, the sleeping village and its eleven stars — gather twenty-six motes of stray starlight, call a golden dawn over the same canvas — and read the companion design paper.",
  keywords: [
    "Van Gogh",
    "The Starry Night",
    "interactive art",
    "HCI",
    "interaction design",
    "HCI design study",
    "Canon in D",
    "Pachelbel",
    "cat",
    "sailing",
    "museum",
    "slow technology",
  ],
  authors: [{ name: "The Starry Expedition" }],
  openGraph: {
    title: "The Starry Expedition",
    description:
      "Sail a wooden boat crewed by a real cat across Van Gogh's The Starry Night.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${playfair.variable} ${cormorant.variable} antialiased bg-[#070a16] text-[#f0e8d2] overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
