"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type HeroSlide = {
  image: string;
  position?: string;
  title: string;
  subtitle?: string;
  cta: string;
  href: string;
};

const AUTOPLAY_MS = 6000;

/** Full-width photo banner. Swipe or use the arrows/dots; advances on its own unless hovered. */
export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const n = (i + slides.length) % slides.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  // Autoplay, unless hovered/focused, the tab is hidden, or the visitor prefers reduced motion.
  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      const el = track.current;
      if (!el) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      const next = (current + 1) % slides.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (!slides.length) return null;

  return (
    <section
      className="hero-slider"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="hero-slider-track"
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {slides.map((s, i) => (
          <div
            className="hero-slide"
            key={s.href + i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.image}
              alt=""
              style={{ objectPosition: s.position ?? "center" }}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
            <div className="hero-slide-content">
              {i === 0 ? <h1 className="hero-slide-title">{s.title}</h1> : <h2 className="hero-slide-title">{s.title}</h2>}
              {s.subtitle && <p className="hero-slide-text">{s.subtitle}</p>}
              <Link href={s.href} className="hero-slide-btn" tabIndex={i === active ? 0 : -1}>
                {s.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button className="hero-slider-arrow prev" onClick={() => goTo(active - 1)} aria-label="Previous slide">
            <i className="fas fa-chevron-left" />
          </button>
          <button className="hero-slider-arrow next" onClick={() => goTo(active + 1)} aria-label="Next slide">
            <i className="fas fa-chevron-right" />
          </button>
          <div className="hero-slider-dots">
            {slides.map((s, i) => (
              <button
                key={i}
                className={i === active ? "active" : undefined}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}: ${s.title}`}
                aria-current={i === active}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
