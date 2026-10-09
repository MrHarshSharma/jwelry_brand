import type { Metadata } from "next";
import "@/styles/admin.css";

export const metadata: Metadata = { title: "Dina Admin", robots: { index: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
