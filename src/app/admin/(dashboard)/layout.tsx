import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { getAdminSession } from "@/lib/admin";
import { signOut } from "../actions";
import SubmitButton from "@/components/admin/SubmitButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, isAdmin } = await getAdminSession();
  if (!user) redirect("/admin/login");

  if (!isAdmin) {
    return (
      <div className="adm-login">
        <div className="adm-login-card">
          <div className="adm-logo">Dina<em>.</em> <span>Admin</span></div>
          <p>
            <strong>{user.email}</strong> is signed in but is not an admin. Add this user to the <code>admins</code>{" "}
            table in Supabase (see README), then reload.
          </p>
          <form action={signOut}>
            <SubmitButton pendingText="Signing out…">Sign out</SubmitButton>
          </form>
        </div>
      </div>
    );
  }

  const { count: pending } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-logo">Dina<em>.</em> <span>Admin</span></div>
        <AdminNav pendingOrders={pending ?? 0} />
        <div className="adm-side-foot">
          <a href="/" target="_blank" className="adm-side-link"><i className="fas fa-external-link-alt" /> View store</a>
          <div className="adm-user">{user.email}</div>
          <form action={signOut}>
            <SubmitButton className="adm-side-link" pendingText="Signing out…">
              <i className="fas fa-sign-out-alt" /> Sign out
            </SubmitButton>
          </form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
