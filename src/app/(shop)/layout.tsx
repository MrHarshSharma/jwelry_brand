import "@/styles/shop.css";
import AnnouncementBar from "@/components/shop/AnnouncementBar";
import CartDrawer from "@/components/shop/CartDrawer";
import Footer from "@/components/shop/Footer";
import Header from "@/components/shop/Header";
import { CartProvider } from "@/components/shop/cart";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer categories={categories} />
      <CartDrawer />
    </CartProvider>
  );
}
