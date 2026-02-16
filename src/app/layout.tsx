import type { Metadata, Viewport } from "next";
import { Inter, MedievalSharp } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const medievalSharp = MedievalSharp({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gamebook Companion",
  description:
    "Compagnon pour les Livres dont vous \u00eates le h\u00e9ros \u2014 G\u00e9rez vos fiches de personnage",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gamebook",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${inter.variable} ${medievalSharp.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
