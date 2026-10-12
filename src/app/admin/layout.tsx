import type { Metadata } from "next";
import "@/styles/admin.css";

export const metadata: Metadata = { title: { absolute: "Lavni Admin" }, robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
