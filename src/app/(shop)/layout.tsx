import "@/styles/shop.css";
import AnnouncementBar from "@/components/shop/AnnouncementBar";
import CartDrawer from "@/components/shop/CartDrawer";
import Footer from "@/components/shop/Footer";
import Header from "@/components/shop/Header";
import WhatsAppFloat from "@/components/shop/WhatsAppFloat";
import { CartProvider } from "@/components/shop/cart";
import { getCategories, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer categories={categories} />
      <CartDrawer />
      <WhatsAppFloat number={settings.whatsapp_number} />
    </CartProvider>
  );
}
