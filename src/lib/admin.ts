import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/** Current session and whether it belongs to a dashboard admin. */
export async function getAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return { supabase, user, isAdmin: isAdmin === true };
}

/** Use at the top of every admin page and server action. Returns a client acting as the admin. */
export async function requireAdmin() {
  const { supabase, user, isAdmin } = await getAdminSession();
  if (!user) redirect("/admin/login");
  if (!isAdmin) throw new Error("This account does not have admin access.");
  return supabase;
}
