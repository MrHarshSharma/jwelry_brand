export const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

export const stars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
