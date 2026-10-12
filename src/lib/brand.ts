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

  // Home page banner slides. Replace `image` with your own campaign photos (wide, ~1800×760px works best;
  // put files in /public/banners and use "/banners/your-file.jpg"). `position` picks which part of the
  // photo stays visible when it's cropped, e.g. "center", "left", "70% 40%".
  heroSlides: [
    {
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&h=760&q=80",
      position: "center",
      title: "The Pearl Edit",
      subtitle: "Keshi strands and baroque studs, finished by hand.",
      cta: "Shop pearls",
      href: "/shop?q=pearl",
    },
    {
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1800&h=760&q=80",
      position: "center",
      title: "Rings for Every Occasion",
      subtitle: "Solitaires, bands and cocktail rings, made to your size.",
      cta: "Shop rings",
      href: "/shop?category=rings",
    },
    {
      image: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=1800&h=760&q=80",
      position: "center",
      title: "New Arrivals",
      subtitle: "Fresh from our Nagpur workshop.",
      cta: "Shop new in",
      href: "/shop?sort=newest",
    },
  ],

  // Scrolling strip at the very top of every page — use it for offers and key promises.
  announcements: ["Handmade in Nagpur", "Delivery Across India", "Order on WhatsApp", "Made to Order"],
};

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Absolute URL for a path or an already-absolute URL (images, canonical links, structured data). */
export const absoluteUrl = (pathOrUrl: string) => new URL(pathOrUrl, SITE_URL + "/").toString();

export const fullAddress = () =>
  [BRAND.address.street, BRAND.address.city, BRAND.address.region, BRAND.address.postalCode].filter(Boolean).join(", ");
