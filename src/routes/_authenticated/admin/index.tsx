import { englishLabel } from "@/lib/english";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, ShoppingBag, PackageCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminOrdersQuery } from "@/lib/admin-queries";
import { dailySales, dayRange, isoDay, needsProcessing, presetPeriod, salesStats } from "@/lib/admin-orders";
import { getAdminCatalog } from "@/lib/admin.functions";
import { stockState } from "@/lib/admin-product";
import { money } from "@/lib/pricing";
import { PaymentBadge, StatusBadge, fmtDate, shortId } from "@/components/shop/AdminBits";
import { PageTitle } from "../admin";

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminOrdersQuery),
  head: () => ({ meta: [{ title: "Dashboard — Admin KEYSHOP" }, { name: "description", content: "KEYSHOP sales and operations overview." }, { property: "og:title", content: "Dashboard — Admin KEYSHOP" }, { property: "og:description", content: "KEYSHOP sales and operations overview." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

type Preset = "today" | "7d" | "30d" | "custom";
function Dashboard() {
  const { data: orders } = useSuspenseQuery(adminOrdersQuery);
  const { user } = Route.useRouteContext();
  const catalog = useQuery({ queryKey: ["admin-catalog", user.id], queryFn: () => getAdminCatalog() });
  const [preset, setPreset] = useState<Preset>("7d");
  const [from, setFrom] = useState(isoDay(presetPeriod("30d").from));
  const [to, setTo] = useState(isoDay(new Date()));
  const [stockOpen, setStockOpen] = useState(false);
  const period = preset === "custom" ? dayRange(from, to) : presetPeriod(preset);
  const stats = salesStats(orders, period);
  const chart = useMemo(() => dailySales(orders, period), [orders, period.from.getTime(), period.to.getTime()]);
  const pending = needsProcessing(orders).length;
  const variants = (catalog.data?.products ?? []).flatMap((p) => p.product_items.map((i) => ({ product: p.name, variant: i.product_configurations.map((c) => englishLabel(c.variation_options?.value)).filter(Boolean).join(" / ") || i.sku, stock: i.qty_in_stock })));
  const low = variants.filter((v) => stockState(v.stock) === "low");
  const empty = variants.filter((v) => stockState(v.stock) === "empty");
  const cards = [
    { label: "Sales", value: money(stats.sales), sub: stats.refundCount ? `Refund ${money(stats.refunds)} (${stats.refundCount})` : `${stats.paidCount} successful payments`, icon: DollarSign },
    { label: "Order Count", value: stats.orderCount, sub: "Created in this period", icon: ShoppingBag },
  ];
  return <>
    <PageTitle title="Dashboard">
      <div className="flex flex-wrap items-center gap-2">{(["today", "7d", "30d", "custom"] as const).map((p) => <Button key={p} size="sm" variant={preset === p ? "default" : "outline"} onClick={() => setPreset(p)}>{{ today: "Today", "7d": "7 Days", "30d": "30 Days", custom: "Date Range" }[p]}</Button>)}
        {preset === "custom" && <><Input type="date" aria-label="From date" className="h-9 w-40" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /><Input type="date" aria-label="To date" className="h-9 w-40" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></>}
      </div>
    </PageTitle>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => <div key={c.label} className="rounded-md border bg-background p-5"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{c.label}</p><span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"><c.icon className="size-4" /></span></div><p className="mt-3 text-3xl font-semibold tabular-nums">{c.value}</p><p className="mt-1 text-xs text-muted-foreground">{c.sub}</p></div>)}
      <Link to="/admin/orders" search={{ payment: "paid", status: "1" }} className="rounded-md border bg-background p-5 transition-colors hover:border-primary"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Needs Processing</p><span className="flex size-9 items-center justify-center rounded-md bg-accent/25 text-accent-foreground"><PackageCheck className="size-4" /></span></div><p className="mt-3 text-3xl font-semibold tabular-nums">{pending}</p><p className="mt-1 text-xs text-muted-foreground">Paid, awaiting packing/shipping · current</p></Link>
      <button type="button" onClick={() => setStockOpen(true)} className="rounded-md border bg-background p-5 text-left transition-colors hover:border-primary"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Low Stock</p><span className="flex size-9 items-center justify-center rounded-md bg-destructive/10 text-destructive"><AlertTriangle className="size-4" /></span></div><p className="mt-3 text-3xl font-semibold tabular-nums">{catalog.data ? low.length : "…"}</p><p className="mt-1 text-xs text-muted-foreground">1–5 unit · Out of stock: {catalog.data ? empty.length : "…"}</p></button>
    </div>
    <section className="rounded-md border bg-background p-5"><h2 className="mb-4 font-semibold">Sales Chart</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" fontSize={11} tickLine={false} /><YAxis fontSize={11} tickLine={false} width={50} /><Tooltip formatter={(v: number) => money(v)} /><Bar dataKey="total" name="Sales" fill="var(--color-primary)" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></section>
    <section className="space-y-3"><h2 className="font-semibold">Recent Orders</h2><div className="overflow-x-auto border-y bg-background"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b bg-muted/60 text-xs text-muted-foreground"><tr>{["Order ID", "Date", "Total", "Payment", "Status", ""].map((h, i) => <th key={i} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{orders.slice(0, 8).map((o) => <tr key={o.id} className="border-b last:border-0"><td className="px-5 py-3 font-medium">{shortId(o.id)}</td><td className="px-5 py-3 text-muted-foreground">{fmtDate(o.order_date)}</td><td className="px-5 py-3">{money(Number(o.order_total))}</td><td className="px-5 py-3"><PaymentBadge status={o.payment_status} /></td><td className="px-5 py-3"><StatusBadge id={o.status_id} name={o.order_statuses?.name} /></td><td className="px-5 py-3 text-right"><Button asChild size="sm" variant="outline"><Link to="/admin/orders/$id" params={{ id: o.id }}>View Details</Link></Button></td></tr>)}</tbody></table>{orders.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No orders yet.</p>}</div></section>
    <Dialog open={stockOpen} onOpenChange={setStockOpen}><DialogContent className="max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle>Low Stock</DialogTitle></DialogHeader>
      <StockList title="Low stock (1–5 unit)" rows={low} /><StockList title="Out of stock" rows={empty} />
    </DialogContent></Dialog>
  </>;
}
function StockList({ title, rows }: { title: string; rows: { product: string; variant: string; stock: number }[] }) {
  return <div><h3 className="mb-2 text-sm font-semibold">{title} ({rows.length})</h3>{rows.length === 0 ? <p className="text-sm text-muted-foreground">None.</p> : <ul className="divide-y rounded-md border text-sm">{rows.map((r, i) => <li key={i} className="flex justify-between gap-3 px-3 py-2"><span>{r.product} <span className="text-muted-foreground">· {r.variant}</span></span><span className="tabular-nums font-medium">{r.stock}</span></li>)}</ul>}</div>;
}
