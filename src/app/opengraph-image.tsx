import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

// Default image shown when the site is shared on WhatsApp, Facebook, X, etc.
export const alt = `${BRAND.legalName} — handmade jewellery from Nagpur`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Playfair Display (the logo font) from Google Fonts; falls back to the default font if unreachable. */
async function loadLogoFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600", {
        cache: "force-cache",
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url, { cache: "force-cache" })).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const logoFont = await loadLogoFont();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FBEDE6 0%, #F7E6DC 55%, #EFD3C6 100%)",
          border: "28px solid #5A1228",
          color: "#5A1228",
          fontFamily: logoFont ? "Playfair" : "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ fontSize: 160, fontWeight: 600, lineHeight: 1 }}>
            Lavni
          </div>
          {/* Jhumka mark, as in the logo */}
          <svg width="52" height="96" viewBox="0 0 24 44" fill="#C49A48" style={{ marginLeft: 6, marginTop: 4 }}>
            <path d="M12 0v7" stroke="#C49A48" strokeWidth="1.3" fill="none" />
            <path d="M12 7l2.6 2.6L12 12.2 9.4 9.6z" />
            <path d="M12 13.5c-5.2 0-9.4 4.6-9.4 11.2h18.8c0-6.6-4.2-11.2-9.4-11.2z" />
            <rect x="1.4" y="24.6" width="21.2" height="2.2" rx="1.1" />
            <path d="M3.5 26.8v4M7.75 26.8v6M12 26.8v8M16.25 26.8v6M20.5 26.8v4" stroke="#C49A48" strokeWidth="0.9" fill="none" />
            <circle cx="3.5" cy="32" r="1.5" />
            <circle cx="7.75" cy="34" r="1.6" />
            <circle cx="12" cy="36.6" r="1.8" />
            <circle cx="16.25" cy="34" r="1.6" />
            <circle cx="20.5" cy="32" r="1.5" />
          </svg>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 28, fontSize: 30, letterSpacing: 10, color: "#5A1228" }}>
          <div style={{ width: 70, height: 2, background: "#C49A48" }} />
          HANDMADE JEWELLERY
          <div style={{ width: 70, height: 2, background: "#C49A48" }} />
        </div>
        <div style={{ marginTop: 44, fontSize: 30, color: "#9A7333", letterSpacing: 2 }}>
          Nath · Thushi · Kolhapuri Saaj · Jhumkas — Nagpur, Maharashtra
        </div>
      </div>
    ),
    { ...size, fonts: logoFont ? [{ name: "Playfair", data: logoFont, weight: 600, style: "normal" }] : [] },
  );
}
