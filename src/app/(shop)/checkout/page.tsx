import type { Metadata } from "next";
import CheckoutForm from "@/components/shop/CheckoutForm";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout — Dina" };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <CheckoutForm shippingFee={settings.shipping_fee} freeShippingThreshold={settings.free_shipping_threshold} />
  );
}
