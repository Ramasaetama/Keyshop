import heroPs5 from "@/assets/shop/hero-ps5-slim.png.asset.json";
import catEarphone from "@/assets/shop/cat-earphone.png.asset.json";
import catWatch from "@/assets/shop/cat-watch.png.asset.json";
import catMacbook from "@/assets/shop/cat-macbook.png.asset.json";
import catGaming from "@/assets/shop/cat-gaming.png.asset.json";
import catVr from "@/assets/shop/cat-vr.png.asset.json";
import catSpeaker from "@/assets/shop/cat-speaker.png.asset.json";
import catSmartwatch from "@/assets/shop/cat-smartwatch2.png.asset.json";
import p1 from "@/assets/shop/p-1.jpg.asset.json";
import p2 from "@/assets/shop/p-2.jpg.asset.json";
import p3 from "@/assets/shop/p-3.jpg.asset.json";
import p4 from "@/assets/shop/p-4.jpg.asset.json";
import p5 from "@/assets/shop/p-5.jpg.asset.json";
import p7 from "@/assets/shop/p-7.jpg.asset.json";
import p9 from "@/assets/shop/p-9.jpg.asset.json";
import canonG7x from "@/assets/shop/canon-g7x-camera.png.asset.json";

export const images = { heroPs5: heroPs5.url };

export const menu = [
  { name: "Home", href: "#home" },
  { name: "Shop", href: "#deals" },
  { name: "Trending", href: "#trending" },
  { name: "Contact", href: "#footer" },
];

export type Product = { id: number; category: string; title: string; img: string; price: number };

export const deals: Product[] = [
  { id: 1, category: "Headphones", title: "Boat Wireless Headphones", img: p1.url, price: 120 },
  { id: 2, category: "Smartwatch", title: "Rocky Mountain Sport Watch", img: p2.url, price: 420 },
  { id: 3, category: "Gaming", title: "VR Gaming Goggles", img: p3.url, price: 320 },
  { id: 4, category: "Accessories", title: "Printed Hard Case", img: p4.url, price: 220 },
  { id: 5, category: "Headphones", title: "Studio Bass Headphones", img: p5.url, price: 120 },
  { id: 6, category: "Smartwatch", title: "Classic Fit Smartwatch", img: p7.url, price: 420 },
];

export type TrendTag = "best" | "sale" | "featured" | "new";

export const trendingFeatured: Product = {
  id: 100,
  category: "Headphones",
  title: "Wireless Over-Ear Headphones, Space Gray",
  img: catEarphone.url,
  price: 129.99,
};

export const trending: (Product & { tag: TrendTag })[] = [
  { id: 11, category: "Mobile & Tablet", title: "Smartphone Pro 128GB", img: p9.url, price: 799, tag: "best" },
  { id: 12, category: "Computer & Laptop", title: 'Creator Laptop 15.6"', img: catMacbook.url, price: 1099, tag: "best" },
  { id: 13, category: "Smartwatch", title: "Active Smartwatch 2", img: catSmartwatch.url, price: 249, tag: "best" },
  { id: 14, category: "Gaming", title: "Pro Game Controller", img: catGaming.url, price: 89, tag: "best" },
  { id: 15, category: "Audio", title: "Portable Speaker", img: catSpeaker.url, price: 149, tag: "sale" },
  { id: 16, category: "Gaming", title: "VR Headset One", img: catVr.url, price: 399, tag: "sale" },
  { id: 17, category: "Wearables", title: "Fit Watch Classic", img: catWatch.url, price: 199, tag: "sale" },
  { id: 18, category: "Headphones", title: "Everyday Headphones", img: p1.url, price: 120, tag: "featured" },
  { id: 19, category: "Accessories", title: "Travel Hard Case", img: p4.url, price: 220, tag: "featured" },
  { id: 20, category: "Smartwatch", title: "Runner Sport Watch", img: p2.url, price: 420, tag: "new" },
  { id: 21, category: "Gaming", title: "VR Goggles Air", img: p3.url, price: 320, tag: "new" },
  { id: 22, category: "Headphones", title: "Bass Headphones", img: p5.url, price: 120, tag: "new" },
];

export const promos = [
  { eyebrow: "New Arrivals", title: "Latest Laptop Collection", cta: "Shop Now", img: catMacbook.url },
  { eyebrow: "Best Sellers", title: "Wireless Earbuds & Audio", cta: "Shop Now", img: catEarphone.url },
  { eyebrow: "Top Rated", title: "Smartwatch Collection", cta: "Shop Now", img: catSmartwatch.url },
];

export const bannerRow = {
  wide: { eyebrow: "Get Rewarded", title: "Super Cheap Price", subtitle: "Speaker & audio collection", cta: "Shop Now", img: catSpeaker.url },
  mid: { eyebrow: "New Collection", title: "VR Headset Series", img: catVr.url },
  right: { eyebrow: "Camera", title: "Canon PowerShot G7 X Mark III", img: canonG7x.url },
};

export const lowerPromo = {
  eyebrow: "New Collection",
  title: "Latest Electronics Arrivals",
  subtitle: "Explore the newest laptops, wearables and gaming gear in one place.",
  cta: "Shop Now",
  img: catMacbook.url,
};
