import type { Metadata } from "next";
import SubscribeClient from "./SubscribeClient";

export const metadata: Metadata = {
  title: "Subscribe — Farm Doctor",
  description: "Choose a plan to unlock more AI crop diagnosis, voice minutes, and expert access.",
};

export default function SubscribePage() {
  return <SubscribeClient />;
}
