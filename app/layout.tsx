import type { Metadata } from "next";
import { Outfit, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Farm Doctor — AI Crop Diagnosis via WhatsApp, Calls & Telegram",
  description:
    "Farm Doctor uses AI to diagnose crop diseases instantly. Send a photo on WhatsApp, Telegram or call — get expert advice in English, French & Pidgin. Serving Cameroon's farmers.",
  keywords:
    "crop diagnosis,farm AI,agriculture Cameroon,plant disease detection,WhatsApp farming,smart agriculture Africa",
  authors: [{ name: "Farm Doctor" }],
  openGraph: {
    type: "website",
    title: "Farm Doctor — AI Crop Diagnosis for African Farmers",
    description:
      "Snap a photo of your crops on WhatsApp. Get instant AI diagnosis and treatment advice in your language.",
    url: "https://farm-doctor.vercel.app",
    siteName: "Farm Doctor",
    images: [{ url: "https://farm-doctor.vercel.app/fdlogo.png" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
