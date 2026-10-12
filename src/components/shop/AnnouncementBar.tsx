import { BRAND } from "@/lib/brand";

/** Maroon strip of scrolling messages above the header. */
export default function AnnouncementBar() {
  if (!BRAND.announcements.length) return null;
  // Repeat enough copies to fill wide screens; the track scrolls by exactly half for a seamless loop.
  const group = Array.from({ length: 3 }, () => BRAND.announcements).flat();
  return (
    <div className="announce" role="region" aria-label="Announcements">
      <div className="announce-track">
        {[0, 1].map((copy) => (
          <div className="announce-group" key={copy} aria-hidden={copy === 1}>
            {group.map((text, i) => (
              <span className="announce-item" key={i}>
                <i className="fas fa-gem" aria-hidden="true" /> {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
