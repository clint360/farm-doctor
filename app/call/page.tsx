import type { Metadata } from "next";
import { CallClient } from "./CallClient";

export const metadata: Metadata = {
  title: "AI Voice Call — Farm Doctor",
  description: "Talk to Farm Doctor AI live. Get instant crop diagnosis and farming advice by voice.",
};

export default function CallPage() {
  return <CallClient />;
}
