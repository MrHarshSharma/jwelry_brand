"use client";

import { useState } from "react";

/** Newsletter sign-up form (shown in the footer). Not connected to an email service yet. */
export default function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <form
      className="footer-newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        e.currentTarget.reset();
        setDone(true);
        setTimeout(() => setDone(false), 3000);
      }}
    >
      <input type="email" placeholder="Enter your email" required aria-label="Email" />
      <button type="submit">{done ? "Subscribed ✓" : "Subscribe"}</button>
    </form>
  );
}
