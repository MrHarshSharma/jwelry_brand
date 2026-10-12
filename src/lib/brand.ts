// Everything about the business in one place: used by the header/footer, SEO metadata and structured data.
// Empty values are simply hidden on the site. Fill them in as they become available.

export const BRAND = {
  name: "Lavni",
  legalName: "Lavni Handmade Jewellery",
  tagline: "Handmade Jewellery",
  description:
    "Handmade Maharashtrian jewellery from Nagpur — nath, thushi, kolhapuri saaj, jhumkas and bridal sets, crafted by hand and made to order. Order on WhatsApp with delivery across India.",
  keywords: [
    "handmade jewellery Nagpur",
    "jewellery shop in Nagpur",
    "Maharashtrian jewellery",
    "traditional Maharashtrian jewellery online",
    "nath nose ring",
    "thushi necklace",
    "kolhapuri saaj",
    "jhumka earrings",
    "bridal jewellery Nagpur",
    "Lavni jewellery",
  ],

  address: {
    street: "", // e.g. "Shop 4, Sitabuldi Main Road"
    city: "Nagpur",
    region: "Maharashtra",
    regionCode: "IN-MH",
    postalCode: "", // e.g. "440012"
    country: "IN",
  },
  phone: "", // e.g. "+91 98XXXXXXXX" — shown in the footer and used in Google business data
  email: "", // e.g. "hello@lavni.in"
  hours: "", // e.g. "Mon – Sat · 11am to 8pm"

  social: {
    instagram: "", // full URLs, e.g. "https://instagram.com/lavni.jewellery"
    facebook: "",
    pinterest: "",
    youtube: "",
  },

  themeColor: "#5A1228",

  // Scrolling strip at the very top of every page — use it for offers and key promises.
  announcements: ["Handmade in Nagpur", "Delivery Across India", "Order on WhatsApp", "Made to Order"],
};

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Absolute URL for a path or an already-absolute URL (images, canonical links, structured data). */
export const absoluteUrl = (pathOrUrl: string) => new URL(pathOrUrl, SITE_URL + "/").toString();

export const fullAddress = () =>
  [BRAND.address.street, BRAND.address.city, BRAND.address.region, BRAND.address.postalCode].filter(Boolean).join(", ");
