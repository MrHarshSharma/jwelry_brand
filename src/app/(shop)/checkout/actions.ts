"use server";

import { getSettings } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_METHODS } from "@/lib/types";
import { sendTemplate } from "@/lib/whatsapp";

export type CheckoutInput = {
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    notes: string;
    payment_method: string;
  };
  items: { product_id: string; quantity: number; size?: string; color?: string }[];
  promoCode?: string;
};

export type CheckoutResult = { ok: true; orderId: string } | { ok: false; error: string; field?: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const c = input.customer;
  const required: [keyof typeof c, string][] = [
    ["name", "Please enter your name"],
    ["phone", "Please enter your WhatsApp number"],
    ["address", "Please enter your address"],
    ["city", "Please enter your city"],
    ["state", "Please select your state"],
    ["pincode", "Please enter your pincode"],
  ];
  for (const [field, error] of required) {
    if (!c[field]?.trim()) return { ok: false, error, field };
  }
  const phoneDigits = c.phone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 13) {
    return { ok: false, error: "Please enter a valid WhatsApp number", field: "phone" };
  }
  if (!/^\d{6}$/.test(c.pincode.trim())) {
    return { ok: false, error: "Pincode must be 6 digits", field: "pincode" };
  }
  if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) {
    return { ok: false, error: "Please enter a valid email", field: "email" };
  }
  if (!(c.payment_method in PAYMENT_METHODS)) {
    return { ok: false, error: "Please choose a payment method" };
  }
  if (!input.items.length) return { ok: false, error: "Your cart is empty" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("place_order", { p_customer: c, p_items: input.items, p_promo_code: input.promoCode || null })
    .single<{ order_id: string; order_no: string; order_total: number }>();

  if (error || !data) {
    // Errors raised inside place_order are written for customers; anything else is not.
    const friendly = error?.code === "P0001" ? error.message : "We couldn't place your order. Please try again.";
    if (error && error.code !== "P0001") console.error("place_order failed", error);
    return { ok: false, error: friendly };
  }

  // Optional Cloud API alert to the store owner. Never blocks the order.
  const settings = await getSettings();
  if (settings.whatsapp_number) {
    await sendTemplate(settings.whatsapp_number, process.env.WHATSAPP_TEMPLATE_NEW_ORDER ?? "", [
      data.order_no,
      c.name.trim(),
      formatINR(data.order_total),
      c.phone.trim(),
    ]);
  }

  return { ok: true, orderId: data.order_id };
}

export async function checkPromo(code: string): Promise<number | null> {
  if (!code.trim()) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("check_promo", { p_code: code });
  return typeof data === "number" ? data : null;
}
