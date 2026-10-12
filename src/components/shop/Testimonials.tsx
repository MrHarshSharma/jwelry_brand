"use client";

import { useEffect, useState } from "react";

// Add real customer reviews here (with their permission) and the section appears on the home page.
// Example: { q: "The thushi I ordered for my wedding was beautiful…", name: "Priya D.", loc: "Nagpur · Thushi Necklace" },
const TESTS: { q: string; name: string; loc: string }[] = [];

export default function Testimonials() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (TESTS.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTS.length), 5000);
    return () => clearInterval(t);
  }, [idx]);

  if (TESTS.length === 0) return null;
  const t = TESTS[idx];
  return (
    <section className="testimonial">
      <span className="test-mark" aria-hidden="true">&ldquo;</span>
      <p className="test-quote" key={idx}>{t.q}</p>
      <div className="test-rule" />
      <div className="test-name">{t.name}</div>
      <div className="test-loc">{t.loc}</div>
      <div className="test-dots">
        {TESTS.map((_, i) => (
          <div key={i} className={`test-dot${i === idx ? " active" : ""}`} onClick={() => setIdx(i)} />
        ))}
      </div>
    </section>
  );
}
