import { englishLabel } from "@/lib/english";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { FaUser } from "react-icons/fa6";
import { useStore } from "@/lib/store";
import { useAccountName } from "@/lib/account";
import { money } from "@/lib/pricing";
import type { CatalogProduct } from "@/lib/catalog.functions";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  FaBars,
  FaBorderAll,
  FaBox,
  FaCamera,
  FaCartShopping,
  FaChevronRight,
  FaFacebook,
  FaGamepad,
  FaGlobe,
  FaHeadphones,
  FaHeadset,
  FaHouse,
  FaInstagram,
  FaLaptop,
  FaLinkedin,
  FaLocationArrow,
  FaMobileScreen,
  FaTv,
  FaXmark,
} from "react-icons/fa6";
import { FaCarSide, FaCheckCircle, FaWallet, FaHeadphonesAlt } from "react-icons/fa";
import { bannerRow, images, lowerPromo, promos } from "./data";

type TrendTag = "best" | "sale" | "featured" | "new";
const menu = [
  { name: "Home", to: "/" as const },
  { name: "Shop", to: "/shop" as const },
  { name: "My Orders", to: "/orders" as const },
  { name: "Cart", to: "/cart" as const },
];

/* ---------------- Header: three rows ---------------- */

function UtilityBar() {
  return (
    <div className="hidden border-b border-border md:block">
      <div className="container-shop flex items-center justify-between py-1.5 text-[11px] text-muted-foreground">
        <nav className="flex items-center gap-4">
          <a href="#footer" className="hover:text-primary">Start Selling</a>
          <a href="#deals" className="hover:text-primary">Promotions</a>
          <a href="#footer" className="flex items-center gap-1.5 hover:text-primary">
            Follow us on <FaInstagram className="text-xs" />
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 hover:text-primary" aria-label="Select language">
            <FaGlobe className="text-xs" /> English
          </button>
          <p>Free Shipping On All Orders</p>
        </div>
      </div>
    </div>
  );
}

function MainNav() {
  const [open, setOpen] = useState(false);
  const { count, user } = useStore();
  const accountName = useAccountName(user);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="border-b border-border">
      <div className="container-shop flex items-center justify-between gap-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button className="grid h-11 w-11 shrink-0 place-items-center lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <FaBars className="text-lg" />
          </button>
          <Link to="/" className="text-2xl font-bold uppercase tracking-wide text-primary">Keyshop</Link>
        </div>
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {menu.map((m) => (
              <li key={m.name}>
                <Link to={m.to} className="text-sm font-medium text-foreground duration-200 hover:text-primary">{m.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-4 sm:gap-5">
          <Link to={user ? "/account" : "/auth"} className="flex items-center gap-2 text-xs font-medium hover:text-primary" aria-label="Account">
            <FaUser className="text-lg" />
            <span className="hidden max-w-28 truncate min-[420px]:inline sm:max-w-40">{accountName}</span>
          </Link>
          <Link to="/cart" className="hidden items-center gap-2 text-xs font-medium hover:text-primary lg:flex" aria-label="Cart">
            <span className="relative">
              <FaCartShopping className="text-xl text-foreground" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{count}</span>
              )}
            </span>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="absolute inset-0 bg-brand-dark/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <nav className="absolute left-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto bg-background shadow-lg">
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="text-lg font-bold uppercase tracking-wide text-primary">Keyshop</span>
              <button autoFocus className="grid h-11 w-11 place-items-center" aria-label="Close menu" onClick={() => setOpen(false)}>
                <FaXmark className="text-lg" />
              </button>
            </div>
            <ul className="p-2">
              {menu.map((m) => (
                <li key={m.name}>
                  <Link to={m.to} onClick={() => setOpen(false)} className="block rounded-sm px-3 py-3 text-sm font-medium hover:bg-muted hover:text-primary">{m.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

function SearchStrip() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <div className="bg-primary">
      <div className="container-shop flex flex-col gap-2 py-2.5 md:flex-row md:items-center md:gap-3">
        <button className="hidden items-center gap-2 rounded-sm bg-brand-light/10 px-3 py-2 text-xs font-semibold text-primary-foreground md:flex">
          <FaBars /> Categories
        </button>
        <form
          className="flex flex-1 items-center overflow-hidden rounded-sm bg-brand-light"
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/shop", search: { q, cat: undefined } }); }}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full px-3 py-2.5 text-base text-foreground focus:outline-none md:py-2 md:text-xs"
            aria-label="Search products"
          />
          <button type="submit" className="self-stretch bg-brand-dark px-4 text-xs font-semibold text-brand-light">
            Search
          </button>
        </form>
        <nav className="hidden items-center gap-4 text-[11px] font-medium text-primary-foreground lg:flex">
          <a href="#deals" className="hover:underline">Recently Viewed</a>
          <a href="#footer" className="hover:underline">Order Tracking</a>
        </nav>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <header className="relative z-40 bg-background">
      <UtilityBar />
      <MainNav />
      <SearchStrip />
    </header>
  );
}

/* ---------------- Hero ---------------- */

function HeroText() {
  return (
    <div className="hero-text max-w-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-light/70">Playstation 5</p>
      <h1 className="mt-3 text-[28px] font-bold leading-tight text-brand-light sm:text-5xl lg:text-[56px]">
        Bring Gaming
        <span className="block font-light">Worlds To Life</span>
      </h1>
      <p className="mt-3 text-sm text-brand-light/80">Experience a new generation of play.</p>
      <div className="mt-5 sm:mt-6">
        <a href="#deals" className="inline-block rounded-sm bg-brand-light px-6 py-2.5 text-xs font-semibold text-primary duration-200 hover:opacity-90">
          Shop Now
        </a>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="home" aria-label="PlayStation 5 promotion">
      {/* Mobile: one shared navy canvas — text overlaid left, full PS5 artwork anchored right/bottom */}
      <div className="px-4 pt-4 sm:hidden">
        <div className="relative h-[200px] overflow-hidden rounded-xl bg-brand-navy">
          <img
            src={images.heroPs5}
            alt="PlayStation 5 console with DualSense controller"
            className="absolute bottom-0 right-0 h-full w-auto max-w-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/20 to-transparent" aria-hidden="true" />
          <div className="relative z-10 max-w-[62%] p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-light/70">Playstation 5</p>
            <h1 className="mt-1.5 text-[19px] font-bold leading-tight text-brand-light min-[360px]:text-[22px]">
              Bring Gaming
              <span className="block font-light">Worlds To Life</span>
            </h1>
            <p className="mt-1.5 text-[11px] leading-snug text-brand-light/80">Experience a new generation of play.</p>
            <a href="#deals" className="mt-3 inline-block rounded-sm bg-brand-light px-4 py-2 text-[11px] font-semibold text-primary duration-200 hover:opacity-90">
              Shop Now
            </a>
          </div>
        </div>
      </div>
      {/* Desktop: full-width cover banner, image anchored right */}
      <div
        className="ps5-hero-desktop relative hidden overflow-hidden sm:block"
        style={{ backgroundImage: `url(${images.heroPs5})` }}
        role="img"
        aria-label="PlayStation 5 console with DualSense controller"
      >
        <img src={images.heroPs5} alt="" aria-hidden="true" className="ps5-hero-image" />
        <div className="container-shop relative z-10 w-full">
          <HeroText />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Category navigation (overlaps hero) ---------------- */

const categoryItems = [
  { name: "Computer & Laptop", cat: 10, icon: FaLaptop },
  { name: "Camera & Video", cat: 1, icon: FaCamera },
  { name: "Television", cat: 1, icon: FaTv },
  { name: "Smart Home", cat: 1, icon: FaHouse },
  { name: "Gaming", cat: 7, icon: FaGamepad },
  { name: "Mobile & Tablet", cat: 12, icon: FaMobileScreen },
  { name: "Headphones", cat: 3, icon: FaHeadphones },
  { name: "Accessories", cat: 13, icon: FaHeadset },
];

function CategoryNav() {
  const [active, setActive] = useState("Gaming");
  const [page, setPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const renderItem = (c: (typeof categoryItems)[number]) => (
    <Link
      key={englishLabel(c.name)}
      to="/shop"
      search={{ cat: c.cat, q: undefined }}
      onClick={() => setActive(c.name)}
      className="flex min-w-0 flex-col items-center gap-1.5 rounded-sm px-1 py-2.5 duration-200 hover:bg-muted sm:gap-2 sm:px-2 sm:py-3"
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full text-base sm:h-12 sm:w-12 sm:text-lg ${
          active === c.name ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
        }`}
      >
        <c.icon />
      </span>
      <span className="min-h-6 text-center text-[10px] font-medium leading-tight sm:text-[11px]">{englishLabel(c.name)}</span>
    </Link>
  );

  return (
    <div className="container-shop relative z-10 mt-4 sm:-mt-20">
      {/* Mobile: one row of four, swipe to the other four, blue scroll indicator */}
      <div className="rounded-sm border border-border bg-background p-2 shadow-sm sm:hidden">
        <div
          ref={scrollRef}
          tabIndex={0}
          role="region"
          aria-label="Categories, swipe to see more"
          onScroll={(e) => {
            const el = e.currentTarget;
            setPage(Math.round(el.scrollLeft / el.clientWidth));
          }}
          onKeyDown={(e) => {
            const el = scrollRef.current;
            if (!el) return;
            if (e.key === "ArrowRight") el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
            if (e.key === "ArrowLeft") el.scrollBy({ left: -el.clientWidth, behavior: "smooth" });
          }}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[categoryItems.slice(0, 4), categoryItems.slice(4)].map((group, i) => (
            <div key={i} className="grid min-w-0 shrink-0 grow-0 basis-full snap-start grid-cols-4">
              {group.map(renderItem)}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-primary/20" aria-hidden="true">
          <div className={`h-full w-1/2 rounded-full bg-primary duration-200 ${page === 1 ? "ml-auto" : ""}`} />
        </div>
      </div>
      {/* Desktop: unchanged full grid */}
      <div className="hidden rounded-sm border border-border bg-background p-2 shadow-sm sm:grid sm:grid-cols-4 sm:gap-0 lg:grid-cols-8">
        {categoryItems.map(renderItem)}
      </div>
    </div>
  );
}

/* ---------------- Promo banners ---------------- */

function PromoBanners() {
  return (
    <section className="container-shop mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto sm:mt-8 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible" aria-label="Promotions">
      {promos.map((p) => (
        <div key={p.title} className="relative flex h-[170px] w-[85%] shrink-0 snap-center flex-col justify-center overflow-hidden rounded-sm bg-muted p-5 sm:w-[60%] lg:w-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">{p.eyebrow}</p>
          <h3 className="mt-1 max-w-[55%] text-base font-bold leading-snug">{p.title}</h3>
          <a href="#deals" className="mt-3 inline-flex w-fit items-center gap-1 rounded-sm bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
            {p.cta} <FaChevronRight className="text-[9px]" />
          </a>
          <img src={p.img} alt={p.title} className="absolute right-2 top-1/2 h-[130px] w-[45%] -translate-y-1/2 object-contain" />
        </div>
      ))}
    </section>
  );
}

/* ---------------- Product card ---------------- */

export function ProductCard({ p }: { p: CatalogProduct }) {
  return (
    <Link to="/product/$id" params={{ id: String(p.id) }} className="relative flex flex-col bg-background p-3 duration-200 hover:shadow-md">
      {p.discount > 0 && (
        <span className="absolute right-2 top-2 rounded-sm bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">-{p.discount}%</span>
      )}
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{englishLabel(p.category)}</p>
      <h3 className="mt-0.5 line-clamp-2 min-h-8 text-[13px] font-medium leading-snug">{p.name}</h3>
      <img src={p.image_url} alt={p.name} className="mx-auto my-2 h-28 w-full object-contain" />
      <p className="text-sm font-bold text-primary">
        {money(p.final_price)}
        {p.discount > 0 && <span className="ml-1.5 text-xs font-normal text-muted-foreground line-through">{money(p.price)}</span>}
      </p>
      {p.in_stock === 0 && <p className="text-[10px] font-semibold text-destructive">Out of stock</p>}
    </Link>
  );
}

/* ---------------- Today's Featured Deals ---------------- */

function FeaturedDeals({ deals }: { deals: CatalogProduct[] }) {
  return (
    <section id="deals" className="container-shop mt-10">
      <Carousel opts={{ align: "start", slidesToScroll: 1 }} aria-label="Today's Featured Deals">
        <div className="flex items-center justify-between gap-4">
          <h2 className="min-w-0 text-xl font-bold">Today's Featured Deals</h2>
          <div className="flex shrink-0 items-center gap-2">
            <CarouselPrevious className="static translate-y-0 rounded-sm" aria-label="Previous product" title="Previous product" />
            <CarouselNext className="static translate-y-0 rounded-sm" aria-label="Next product" title="Next product" />
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-sm border border-border">
          <CarouselContent className="ml-0 items-stretch">
            {deals.map((p) => (
              <CarouselItem key={p.id} className="basis-1/2 border-r border-border pl-0 sm:basis-1/3 lg:basis-1/5 [&>a]:h-full">
                <ProductCard p={p} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  );
}

/* ---------------- Second banner row (2:1:1) ---------------- */

function BannerRow() {
  const [progress, setProgress] = useState(0);
  return (
    <section className="container-shop mt-6" aria-label="More promotions">
      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible"
        onScroll={(e) => {
          const el = e.currentTarget;
          const max = el.scrollWidth - el.clientWidth;
          setProgress(max > 0 ? el.scrollLeft / max : 0);
        }}
      >
      <div className="relative flex h-[190px] w-[85%] shrink-0 snap-center items-center overflow-hidden rounded-sm bg-muted p-6 sm:w-[70%] lg:col-span-2 lg:w-auto">
        <div className="max-w-[50%]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">{bannerRow.wide.eyebrow}</p>
          <h3 className="mt-1 text-xl font-bold">{bannerRow.wide.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{bannerRow.wide.subtitle}</p>
          <a href="#deals" className="mt-3 inline-flex items-center gap-1 rounded-sm bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
            {bannerRow.wide.cta} <FaChevronRight className="text-[9px]" />
          </a>
        </div>
        <img src={bannerRow.wide.img} alt={bannerRow.wide.title} className="absolute right-4 top-1/2 h-[150px] w-[45%] -translate-y-1/2 object-contain" />
      </div>
      {[bannerRow.mid, bannerRow.right].map((b) => (
        <div key={b.title} className="relative flex h-[190px] w-[85%] shrink-0 snap-center flex-col justify-center overflow-hidden rounded-sm bg-muted p-5 sm:w-[70%] lg:w-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">{b.eyebrow}</p>
          <h3 className="mt-1 max-w-[55%] text-sm font-bold leading-snug">{b.title}</h3>
          <img src={b.img} alt={b.title} className="absolute bottom-2 right-2 h-[110px] w-[45%] object-contain" />
        </div>
      ))}
      </div>
      <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-primary/20 lg:hidden" aria-hidden="true">
        <div className="h-full w-1/2 rounded-full bg-primary" style={{ marginLeft: `${Math.round(progress * 50)}%` }} />
      </div>
    </section>
  );
}

/* ---------------- Trending This Week ---------------- */

const trendTabs: { key: TrendTag | "all"; label: string }[] = [
  { key: "best", label: "Best Seller" },
  { key: "sale", label: "Sale" },
  { key: "featured", label: "Featured" },
  { key: "new", label: "New Products" },
  { key: "all", label: "View All" },
];

function trendingFor(trending: CatalogProduct[], tab: TrendTag | "all") {
  const matched = tab === "all" ? trending : trending.filter((p) => p.tag === tab);
  const padded = [...matched, ...trending.filter((p) => !matched.includes(p))];
  return padded.slice(0, 8);
}

function Trending({ trending }: { trending: CatalogProduct[] }) {
  const [tab, setTab] = useState<TrendTag | "all">("best");
  const items = trendingFor(trending, tab);
  const trendingFeatured = trending.find((p) => p.id === 15) ?? trending[0];
  const left = items.slice(0, 4);
  const right = items.slice(4, 8);
  return (
    <section id="trending" className="container-shop mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Trending This Week</h2>
        <div className="flex flex-nowrap gap-1 overflow-x-auto sm:flex-wrap sm:overflow-visible">
          {trendTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-sm px-3 py-1.5 text-[11px] font-semibold duration-200 ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border lg:col-span-2">
          {left.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        {trendingFeatured && (
          <Link to="/product/$id" params={{ id: String(trendingFeatured.id) }} className="-order-1 flex flex-col items-center justify-center rounded-sm border border-border bg-background p-4 text-center lg:order-none lg:col-span-2 lg:p-6">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{englishLabel(trendingFeatured.category)}</p>
            <img src={trendingFeatured.image_url} alt={trendingFeatured.name} className="my-3 h-40 w-full object-contain lg:my-4 lg:h-56" />
            <h3 className="text-sm font-medium leading-snug">{trendingFeatured.name}</h3>
            <p className="mt-1 text-base font-bold text-primary">{money(trendingFeatured.final_price)}</p>
          </Link>
        )}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border lg:col-span-2">
          {right.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Lower full-width promotion ---------------- */

function LowerPromo() {
  return (
    <section className="mt-12 bg-muted">
      <div className="container-shop grid items-center gap-6 py-10 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{lowerPromo.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold leading-tight">{lowerPromo.title}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{lowerPromo.subtitle}</p>
          <div className="mt-5">
            <a href="#deals" className="inline-block rounded-sm bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground duration-200 hover:opacity-90">
              {lowerPromo.cta}
            </a>
          </div>
        </div>
        <img src={lowerPromo.img} alt={lowerPromo.title} className="mx-auto max-h-[240px] w-full object-contain" />
      </div>
    </section>
  );
}

/* ---------------- Services ---------------- */

const services = [
  { icon: FaCarSide, title: "Free Shipping", desc: "Free Shipping On All Order" },
  { icon: FaCheckCircle, title: "Safe Money", desc: "30 Days Money Back" },
  { icon: FaWallet, title: "Secure Payment", desc: "All Payment Secure" },
  { icon: FaHeadphonesAlt, title: "Online Support 24/7", desc: "Technical Support 24/7" },
];

function Services() {
  return (
    <section id="about" className="container-shop mt-10">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {services.map((s) => (
          <div key={s.title} className="flex items-start gap-3">
            <s.icon className="text-3xl text-primary" />
            <div>
              <h3 className="text-sm font-bold">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

export function Footer() {
  const links = ["Home", "About", "Contact", "Blog"];
  return (
    <footer id="footer" className="mt-12 border-t border-border">
      <div className="container-shop grid gap-2 py-8 md:grid-cols-4 md:gap-8 md:py-10">
        <div className="space-y-3 max-md:mb-4">
          <span className="text-2xl font-bold uppercase tracking-wide text-primary">Keyshop</span>
          <p className="text-sm text-muted-foreground">Your one-stop shop for the latest electronics and gadgets.</p>
        </div>
        {["Important Links", "Quick Links"].map((h) => (
          <div key={h}>
            <details className="group border-b border-border md:hidden">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-bold [&::-webkit-details-marker]:hidden">
                {h}
                <FaChevronRight className="text-xs text-muted-foreground duration-200 group-open:rotate-90" />
              </summary>
              <ul className="space-y-2 pb-4">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#home" className="text-sm text-muted-foreground duration-200 hover:text-primary">{l}</a>
                  </li>
                ))}
              </ul>
            </details>
            <div className="hidden md:block">
              <h3 className="mb-3 text-sm font-bold">{h}</h3>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#home" className="text-sm text-muted-foreground duration-200 hover:text-primary">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        <div className="max-md:mt-4">
          <h3 className="mb-3 text-sm font-bold">Address</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><FaLocationArrow className="text-primary" /> Yogyakarta, Indonesia</p>
            <p className="flex items-center gap-2"><FaMobileScreen className="text-primary" /> +62 851-5190-2820</p>
            <div className="flex items-center gap-3 pt-1 text-xl">
              <a href="#" aria-label="Instagram" className="duration-200 hover:text-primary"><FaInstagram /></a>
              <a href="#" aria-label="Facebook" className="duration-200 hover:text-primary"><FaFacebook /></a>
              <a href="#" aria-label="LinkedIn" className="duration-200 hover:text-primary"><FaLinkedin /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="container-shop py-4 text-center text-xs text-muted-foreground">© 2026 Keyshop. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ---------------- Mobile bottom navigation ---------------- */

function BottomNav() {
  const { count, user } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setKeyboardOpen(vv.height < window.innerHeight * 0.75);
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  if (keyboardOpen) return null;

  const items = [
    { label: "Home", to: "/" as const, icon: FaHouse },
    { label: "Categories", to: "/shop" as const, icon: FaBorderAll },
    { label: "Order", to: "/orders" as const, icon: FaBox },
    { label: "Cart", to: "/cart" as const, icon: FaCartShopping, badge: count },
    { label: "Account", to: (user ? "/account" : "/auth") as "/account" | "/auth", icon: FaUser },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Bottom navigation">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
          return (
            <li key={it.label}>
              <Link
                to={it.to}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative">
                  <it.icon className="text-lg" />
                  {it.badge ? (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">{it.badge}</span>
                  ) : null}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ---------------- Page ---------------- */

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true" />
      <BottomNav />
    </div>
  );
}

export function Shop({ products }: { products: CatalogProduct[] }) {
  const deals = products.filter((p) => p.is_deal);
  const trending = products.filter((p) => !p.is_deal || p.tag);
  return (
    <PageShell>
      <Hero />
      <CategoryNav />
      <PromoBanners />
      <FeaturedDeals deals={deals} />
      <BannerRow />
      <Trending trending={trending} />
      <LowerPromo />
      <Services />
    </PageShell>
  );
}
