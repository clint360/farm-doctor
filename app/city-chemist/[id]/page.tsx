import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

export const metadata: Metadata = {
  title: "Product Details | City Chemist — Farm Doctor",
  description: "View product details and place an order.",
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
