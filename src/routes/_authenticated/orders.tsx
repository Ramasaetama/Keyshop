import { englishLabel } from "@/lib/english";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/shop/AccountLayout";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { orderTabs, parseOrderTab, matchesOrderTab, type OrderTab } from "@/lib/order-tabs";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/orders")({
  validateSearch: (s: Record<string, unknown>): { placed?: string | undefined; tab?: OrderTab } => ({ placed: typeof s["placed"] === "string" ? s["placed"] : undefined, tab: parseOrderTab(s["tab"]) }),
  loader: ({ context }) => context.queryClient.ensureQueryData(ordersQuery(context.user.id)),
  errorComponent: () => <p role="alert" className="p-8">Unable to load orders.</p>,
  notFoundComponent: () => <p className="p-8">Order not found.</p>,
  head: () => ({
    meta: [
      { title: "My Orders — KEYSHOP" },
      { name: "description", content: "Track your orders and review KEYSHOP products." },
      { property: "og:title", content: "My Orders — KEYSHOP" },
      { property: "og:description", content: "Track your orders and review KEYSHOP products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

export const ORDER_SELECT =
  "id, user_id, order_date, payment_label, payment_status, courier, tracking_number, shipped_at, shipping_address, shipping_price, order_total, status_id, order_statuses(name), shipping_methods(name), order_lines(id, qty, price, product_items(sku, product_id, products(name, image_url)), reviews(id))";

const ordersQuery = (userId: string) => queryOptions({
  queryKey: ["orders", userId],
  queryFn: async () => {
    const { data, error } = await supabase.from("shop_orders").select(ORDER_SELECT).eq("user_id", userId).order("order_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

const STEPS = ["Packing", "Shipped", "Completed"];

export function StatusSteps({ status }: { status: number }) {
  return (
    <ol className="flex items-center gap-2 text-[11px]">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 font-semibold ${i + 1 <= status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</span>
          {i < STEPS.length - 1 && <span className="h-px w-4 bg-border" />}
        </li>
      ))}
    </ol>
  );
}

function OrdersPage() {
  const { user } = Route.useRouteContext();
  const { placed, tab = "all" } = Route.useSearch();
  const { data, refetch } = useSuspenseQuery(ordersQuery(user.id));
  const filtered = data.filter((order) => matchesOrderTab(order, tab));
  return (
    <AccountLayout active="orders">
      <h1 className="sr-only">My Orders</h1>
      <nav aria-label="Order status" className="grid grid-cols-2 border-b border-border sm:grid-cols-4 xl:grid-cols-7">
        {orderTabs.map((item) => (
          <Button asChild variant="ghost" key={item.key} className={`h-auto min-h-14 rounded-none border-b-2 px-2 py-4 text-[12px] shadow-none hover:bg-muted ${tab === item.key ? "border-primary text-primary" : "border-transparent text-foreground"}`}>
            <Link to="/orders" search={(prev) => ({ ...prev, tab: item.key })} resetScroll={false} aria-current={tab === item.key ? "page" : undefined}><span className="whitespace-normal text-center">{item.label}</span></Link>
          </Button>
        ))}
      </nav>
      <div className="p-5 md:p-6" aria-live="polite">
        {filtered.length === 0 ? <div className="flex min-h-[360px] flex-col items-center justify-center gap-5"><span className="flex size-20 items-center justify-center rounded-full bg-muted"><ClipboardList className="size-10 text-primary" strokeWidth={1.3} /></span><p className="text-sm">No orders yet</p></div> : (
          <ul className="space-y-4">
            {filtered.map((o) => (
              <li key={o.id} className={`rounded-sm border p-5 ${o.id === placed ? "border-primary" : "border-border"}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} · {new Date(o.order_date).toLocaleString("en-US")}</p>
                    <p className="font-bold">{money(Number(o.order_total))}</p>
                  </div>
                  <StatusSteps status={o.status_id} />
                </div>
                <ul className="mt-4 space-y-3">
                  {o.order_lines.map((l) => (
                    <li key={l.id} className="flex flex-wrap items-center gap-3 text-sm">
                      <img src={l.product_items?.products?.image_url} alt="" className="h-12 w-12 rounded-sm bg-muted object-contain p-1" />
                      <span className="flex-1">{l.product_items?.products?.name} <span className="text-muted-foreground">({l.product_items?.sku}) ×{l.qty}</span></span>
                      <span>{money(Number(l.price) * l.qty)}</span>
                      {o.status_id === 3 && (l.reviews ? <span className="w-full text-xs text-primary">✓ Reviewed</span> : <ReviewForm lineId={l.id} productId={l.product_items?.product_id ?? 0} name={user.email ?? ""} onDone={refetch} />)}
                    </li>
                  ))}
                </ul>
                {o.tracking_number && <p className="mt-3 text-sm"><span className="font-semibold">Tracking {o.courier}:</span> {o.tracking_number}{o.shipped_at ? ` · shipped ${new Date(o.shipped_at).toLocaleString("en-US")}` : ""}</p>}
                <p className="mt-3 text-xs text-muted-foreground">
                  {englishLabel(o.shipping_methods?.name)} ({money(Number(o.shipping_price))}) · {o.shipping_address} · {o.payment_label}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AccountLayout>
  );
}

function ReviewForm({ lineId, productId, name, onDone }: { lineId: string; productId: number; name: string; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = comment.trim();
    if (!text || text.length > 1000) return void toast.error("A review is required (maximum 1,000 characters)");
    const { error } = await supabase.from("reviews").insert({
      order_line_id: lineId,
      product_id: productId,
      rating,
      comment: text,
      reviewer_name: name.split("@")[0] ?? "",
    });
    if (error) return void toast.error("Unable to save review");
    toast.success("Thank you for your review!");
    onDone();
  }
  return (
    <form onSubmit={submit} className="flex w-full flex-wrap items-center gap-2 rounded-sm bg-muted p-2">
      <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rounded-sm border border-input bg-background px-2 py-1 text-xs" aria-label="Rating">
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
      </select>
      <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a review…" className="flex-1 rounded-sm border border-input bg-background px-2 py-1 text-xs" />
      <Button type="submit" size="sm">Submit Review</Button>
    </form>
  );
}
