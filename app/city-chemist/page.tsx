import type { Metadata } from "next";
import CityChemistClient from "./CityChemistClient";

export const metadata: Metadata = {
  title: "City Chemist | Farm Doctor",
  description:
    "Order pesticides, fertilizers, and agricultural supplies for your farm. Browse our catalogue and place an order in minutes.",
};

export default function CityChemistPage() {
  return <CityChemistClient />;
}
