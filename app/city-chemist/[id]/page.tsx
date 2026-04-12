import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

export const metadata: Metadata = {
  title: "Product Details | City Chemist — Farm Doctor",
  description: "View product details and place an order.",
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient id={params.id} />;
}
