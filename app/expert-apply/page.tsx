import type { Metadata } from "next";
import { ExpertApplyClient } from "./ExpertApplyClient";

export const metadata: Metadata = {
  title: "Become an Expert — Farm Doctor",
  description: "Apply to become a Farm Doctor expert. Help farmers in your region with your agricultural expertise.",
};

export default function ExpertApplyPage() {
  return <ExpertApplyClient />;
}
