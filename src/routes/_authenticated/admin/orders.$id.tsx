import { englishLabel } from "@/lib/english";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { adminOrdersQuery, adminProfilesQuery } from "@/lib/admin-queries";
import { orderAmounts, orderStatusLabel, orderStatusOptions, paymentLabels, type PaymentStatus } from "@/lib/admin-orders";
import { money } from "@/lib/pricing";
import { PaymentBadge, StatusBadge, fmtDate, shortId } from "@/components/shop/AdminBits";
import { PageTitle } from "../admin";

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(adminOrdersQuery), context.queryClient.ensureQueryData(adminProfilesQuery)]); },
  head: () => ({ meta: [{ title: "Order Details — Admin KEYSHOP" }, { name: "description", content: "Order, payment, and shipping details." }, { property: "og:title", content: "Order Details — Admin KEYSHOP" }, { property: "og:description", content: "Order, payment, and shipping details." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  notFoundComponent: () => <p className="p-8">Order not found.</p>,
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: orders } = useSuspenseQuery(adminOrdersQuery);
  const { data: profiles } = useSuspenseQuery(adminProfilesQuery);
  const o = orders.find((x) => x.id === id);
  const history = useQuery({ queryKey: ["admin-order-history", id], queryFn: async () => { const { data, error } = await supabase.from("order_status_history").select("id, status_id, payment_status, note, created_at, order_statuses(name)").eq("order_id", id).order("created_at"); if (error) throw error; return data; } });
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");
  const [busy, setBusy] = useState(false);
  if (!o) throw notFound();
  const buyer = profiles.find((p) => p.id === o.user_id);
  const a = orderAmounts(o);
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["admin-orders"] }), qc.invalidateQueries({ queryKey: ["admin-order-history", id] })]);
  async function run(fn: () => PromiseLike<{ error: { message: string } | null }>, ok: string) {
    setBusy(true); const { error } = await fn(); setBusy(false);
    if (error) return void toast.error(englishLabel(error.message));
    toast.success(ok); await refresh();
  }
  async function ship(e: React.FormEvent) {
    e.preventDefault();
    if (!courier.trim() || !tracking.trim()) return void toast.error("Courier and tracking number are required");
    await run(() => supabase.rpc("ship_order", { _order: id, _courier: courier, _tracking: tracking }), "Order marked as shipped");
  }
  const canShip = o.payment_status === "paid" && o.status_id === 1;
  const box = "rounded-md border bg-background p-5";
  return <>
    <Button asChild variant="ghost" size="sm" className="-ml-2"><Link to="/admin/orders"><ArrowLeft />Orders</Link></Button>
    <PageTitle title={`Order ${shortId(o.id)}`}><div className="flex gap-2"><PaymentBadge status={o.payment_status} /><StatusBadge id={o.status_id} name={o.order_statuses?.name} /></div></PageTitle>
    <div className="grid gap-4 lg:grid-cols-3">
      <section className={box}><h2 className="mb-3 font-semibold">Buyer</h2><p>{buyer?.full_name || "—"}</p><p className="text-sm text-muted-foreground">{buyer?.email}</p><p className="text-sm text-muted-foreground">{buyer?.phone}</p>{buyer && <Link to="/admin/users/$id" params={{ id: buyer.id }} className="mt-2 inline-block text-sm text-primary">View customer</Link>}<h3 className="mb-1 mt-4 text-sm font-semibold">Shipping Address</h3><p className="text-sm text-muted-foreground">{o.shipping_address}</p></section>
      <section className={box}><h2 className="mb-3 font-semibold">Payment</h2><dl className="space-y-1 text-sm"><Row k="Method" v={o.payment_label} /><Row k="Payment ID" v={o.payment_id ?? "—"} /><Row k="Paid at" v={fmtDate(o.paid_at)} /><Row k="Currency" v={o.currency} /></dl>
        <label className="mt-4 block text-xs text-muted-foreground">Change payment status<select className="mt-1 block w-full rounded-md border bg-background p-2 text-sm" disabled={busy} value={o.payment_status} onChange={(e) => run(() => supabase.rpc("set_payment_status", { _order: id, _status: e.target.value }), "Payment status updated")}>{Object.entries(paymentLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <p className="mt-2 text-xs text-muted-foreground">Payments are simulated; no payment provider is connected yet.</p></section>
      <section className={box}><h2 className="mb-3 font-semibold">Shipping</h2><dl className="space-y-1 text-sm"><Row k="Service" v={englishLabel(o.shipping_methods?.name) || "—"} /><Row k="Courier" v={o.courier ?? "—"} /><Row k="Tracking No." v={o.tracking_number ?? "—"} /><Row k="Shipped" v={fmtDate(o.shipped_at)} /></dl>
        {canShip ? <form onSubmit={ship} className="mt-4 space-y-2"><Input aria-label="Courier" placeholder="Courier (e.g. JNE)" value={courier} onChange={(e) => setCourier(e.target.value)} required /><Input aria-label="Tracking number" placeholder="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} required /><Button type="submit" className="w-full" disabled={busy}><Truck />Save Tracking & Mark Shipped</Button></form>
          : <label className="mt-4 block text-xs text-muted-foreground">Change order status<select className="mt-1 block w-full rounded-md border bg-background p-2 text-sm" disabled={busy} value={o.status_id} onChange={(e) => run(() => supabase.rpc("set_order_status", { _order: id, _status: Number(e.target.value) }), "Order status updated")}>{orderStatusOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>}</section>
    </div>
    <section className={box}><h2 className="mb-3 font-semibold">Product Details</h2><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Product</th><th>Variant</th><th className="text-right">Quantity</th><th className="text-right">Purchase price</th><th className="text-right">Subtotal</th></tr></thead><tbody>{o.order_lines.map((l) => <tr key={l.id} className="border-t"><td className="py-3"><div className="flex items-center gap-3"><img src={l.product_items?.products?.image_url} alt="" className="size-10 rounded-sm border object-contain p-1" />{l.product_items?.products?.name}</div></td><td className="text-muted-foreground">{l.product_items?.product_configurations.map((c) => englishLabel(c.variation_options?.value)).filter(Boolean).join(" / ") || l.product_items?.sku}</td><td className="text-right">{l.qty}</td><td className="text-right">{money(Number(l.price))}</td><td className="text-right">{money(Number(l.price) * l.qty)}</td></tr>)}</tbody></table></div>
      <dl className="ml-auto mt-4 max-w-xs space-y-1 text-sm"><Row k="Subtotal" v={money(a.subtotal)} /><Row k="Discount" v={a.discount ? `−${money(a.discount)}` : money(0)} /><Row k="Shipping" v={money(a.shipping)} /><div className="flex justify-between border-t pt-2 font-semibold"><dt>Grand Total</dt><dd>{money(a.total)}</dd></div></dl></section>
    <section className={box}><h2 className="mb-3 font-semibold">Status History</h2>{history.isPending ? <p className="text-sm">Loading…</p> : <ol className="space-y-3 border-l pl-4">{(history.data ?? []).map((h) => <li key={h.id} className="text-sm"><p className="font-medium">{h.status_id ? orderStatusLabel(h.status_id, h.order_statuses?.name) : "—"} · {paymentLabels[h.payment_status as PaymentStatus] ?? h.payment_status}</p><p className="text-xs text-muted-foreground">{fmtDate(h.created_at)}{h.note ? ` · ${h.note}` : ""}</p></li>)}</ol>}</section>
  </>;
}
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>; }
