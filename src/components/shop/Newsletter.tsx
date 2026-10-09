"use client";

import { useState } from "react";

export default function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="newsletter">
      <div>
        <span className="nl-eyebrow">Inner Circle</span>
        <h2 className="nl-h2">
          Rare things,
          <br />
          first to <em>you</em>
        </h2>
      </div>
      <div>
        <p className="nl-desc">
          Private previews of new collections, invitations to trunk shows, and stories from our Jaipur atelier —
          delivered quietly to your inbox.
        </p>
        <form
          className="nl-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.currentTarget.reset();
            setDone(true);
            setTimeout(() => setDone(false), 3000);
          }}
        >
          <input type="email" placeholder="Your email address" required aria-label="Email" />
          <button type="submit">{done ? "Subscribed ✓" : "Subscribe"}</button>
        </form>
      </div>
    </section>
  );
}
