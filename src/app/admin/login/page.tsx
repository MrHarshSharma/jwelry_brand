"use client";

import { useActionState } from "react";
import Logo from "@/components/Logo";
import { signIn } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(signIn, null);
  return (
    <div className="adm-login">
      <form action={action} className="adm-login-card">
        <div className="adm-logo">
          <Logo />
          <span>Admin</span>
        </div>
        <label className="adm-field">
          <span>Email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="adm-field">
          <span>Password</span>
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn-primary" disabled={pending}>
          {pending ? <><i className="fas fa-spinner fa-spin" /> Signing in…</> : "Sign in"}
        </button>
      </form>
    </div>
  );
}
