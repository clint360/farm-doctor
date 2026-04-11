import type { Metadata } from "next";
import { InsightsClient } from "./InsightsClient";

export const metadata: Metadata = {
  title: "Crop Insights — Farm Doctor",
  description:
    "Search any crop and get AI-powered planting guidance, maintenance steps, risk alerts, and real farmer community signals. Powered by Farm Doctor agricultural intelligence.",
  keywords:
    "crop insights, farming guide, plant diseases, agricultural advice, Cameroon farming, cassava guide, maize farming, crop calendar",
  openGraph: {
    type: "website",
    title: "Crop Insights — Farm Doctor Agricultural Intelligence",
    description:
      "Search any crop. Get structured planting guides, risk alerts, and community signals from real farmers.",
    url: "https://farm-doctor.vercel.app/insights",
    siteName: "Farm Doctor",
    images: [{ url: "https://farm-doctor.vercel.app/fdlogo.png" }],
  },
};

export default function InsightsPage() {
  return <InsightsClient />;
}
