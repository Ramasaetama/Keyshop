import { englishLabel } from "@/lib/english";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FaStar } from "react-icons/fa6";
import { PageShell } from "@/components/shop/Shop";
import { getProduct } from "@/lib/catalog.functions";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";

const productQuery = (id: number) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const p = await getProduct({ data: { id } });
      if (!p) throw notFound();
      return p;
    },
  });

export const Route = createFileRoute("/product/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(Number(params.id))),
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — KEYSHOP` : "Product — KEYSHOP";
    const desc = englishLabel(loaderData?.description) || "Product details at KEYSHOP.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ProductPage,
  errorComponent: ({ error }) => <div className="p-10 text-center">Unable to load product: {englishLabel((error as Error).message)}</div>,
  notFoundComponent: () => (
    <div className="p-10 text-center">Product not found. <Link to="/shop" className="text-primary underline">Back to shopping</Link></div>
  ),
});

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex text-primary">
      {[1, 2, 3, 4, 5].map((i) => <FaStar key={i} className={i <= Math.round(n) ? "" : "opacity-20"} />)}
    </span>
  );
}

function ProductPage() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQuery(Number(id)));
  const { add, cart } = useStore();
  const [picked, setPicked] = useState<Record<number, number>>(() =>
    Object.fromEntries(p.variations.flatMap((v) => (v.options[0] ? [[v.id, v.options[0].id]] : []))),
  );
  const [qty, setQty] = useState(1);
  const item = useMemo(
    () => p.items.find((i) => Object.values(picked).every((o) => i.option_ids.includes(o))) ?? null,
    [p.items, picked],
  );
  const inCart = item ? cart.find((l) => l.itemId === item.id)?.qty ?? 0 : 0;
  const available = item ? item.qty_in_stock - inCart : 0;
  const avg = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0;

  return (
    <PageShell>
      <div className="container-shop grid gap-10 py-10 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-sm bg-muted p-8">
          <img src={p.image_url} alt={p.name} className="max-h-[420px] w-full object-contain" />
        </div>
        <div>
          <Link to="/shop" search={{ cat: p.category_id }} className="text-xs uppercase tracking-wide text-muted-foreground hover:text-primary">{englishLabel(p.category)}</Link>
          <h1 className="mt-1 text-3xl font-bold">{p.name}</h1>
          {p.reviews.length > 0 && (
            <p className="mt-1 flex items-center gap-2 text-sm"><Stars n={avg} /> {avg.toFixed(1)} ({p.reviews.length} reviews)</p>
          )}
          <p className="mt-4 text-2xl font-bold text-primary">
            {item ? money(item.final_price) : "-"}
            {p.discount > 0 && item && (
              <>
                <span className="ml-2 text-base font-normal text-muted-foreground line-through">{money(item.price)}</span>
                <span className="ml-2 rounded-sm bg-destructive px-1.5 py-0.5 text-xs font-bold text-destructive-foreground">-{p.discount}%</span>
              </>
            )}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{englishLabel(p.description)}</p>

          {p.variations.map((v) => (
            <div key={v.id} className="mt-6">
              <p className="text-sm font-semibold">{englishLabel(v.name)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {v.options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => { setPicked((s) => ({ ...s, [v.id]: o.id })); setQty(1); }}
                    className={`rounded-sm border px-4 py-1.5 text-sm ${picked[v.id] === o.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
                  >
                    {englishLabel(o.value)}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <p className={`mt-4 text-sm font-medium ${item && item.qty_in_stock > 0 ? "text-foreground" : "text-destructive"}`}>
            {item ? (item.qty_in_stock > 0 ? `Stock: ${item.qty_in_stock} unit` : "Out of stock") : "Variant unavailable"}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center rounded-sm border border-border">
              <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button className="px-3 py-2" onClick={() => setQty((q) => Math.min(Math.max(1, available), q + 1))} aria-label="Increase">+</button>
            </div>
            <button
              disabled={!item || available < qty}
              onClick={() => item && add(item.id, qty)}
              className="rounded-sm bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Add to Cart
            </button>
          </div>
          {item && inCart > 0 && <p className="mt-2 text-xs text-muted-foreground">{inCart} already in your cart.</p>}
        </div>
      </div>

      <section className="container-shop pb-12">
        <h2 className="text-xl font-bold">Reviews</h2>
        {p.reviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No reviews yet. Buyers can leave a review after receiving their order.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {p.reviews.map((r) => (
              <li key={r.id} className="rounded-sm border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{r.reviewer_name || "Buyer"}</span>
                  <Stars n={r.rating} />
                </div>
                <p className="mt-2 text-sm">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
