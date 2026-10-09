"use client";

import { useEffect, useState } from "react";

const TESTS = [
  { q: "The Diamond Solitaire Ring was everything I imagined and more. The craftsmanship is impeccable — my fiancée cried when she saw it. Dina made our moment perfect.", name: "Arjun Mehta", loc: "Mumbai · Diamond Solitaire Ring" },
  { q: "I've owned fine jewellery from several brands, but Dina's baroque pearl studs are in a category of their own. The quality is extraordinary. I wear them every single day.", name: "Meera Krishnan", loc: "Bangalore · Baroque Pearl Studs" },
  { q: "Ordered a bespoke bangle for our 25th anniversary. The team guided me through every detail. The finished piece brought my wife to tears. Worth every rupee — and more.", name: "Rajiv Singhania", loc: "Delhi · Emerald Kangan Bangle" },
];

export default function Testimonials() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTS.length), 5000);
    return () => clearInterval(t);
  }, [idx]);

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
