import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminOrdersQuery } from "@/lib/admin-queries";
import { dayRange, isoDay, lineSummary, orderAmounts, paymentLabels, presetPeriod, reportCsv, reportFileName, salesStats, type PaymentStatus } from "@/lib/admin-orders";
import { money } from "@/lib/pricing";
import { PaymentBadge, fmtDate, shortId } from "@/components/shop/AdminBits";
import { PageTitle } from "../admin";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminOrdersQuery),
  head: () => ({ meta: [{ title: "Sales Reports — Admin KEYSHOP" }, { name: "description", content: "KEYSHOP transaction reports and CSV exports." }, { property: "og:title", content: "Sales Reports — Admin KEYSHOP" }, { property: "og:description", content: "KEYSHOP transaction reports and CSV exports." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Reports,
});

function Reports() {
  const { data: orders } = useSuspenseQuery(adminOrdersQuery);
  const [from, setFrom] = useState(isoDay(presetPeriod("30d").from));
  const [to, setTo] = useState(isoDay(new Date()));
  const [page, setPage] = useState(0);
  const period = dayRange(from, to);
  const stats = salesStats(orders, period);
  const tx = orders.filter((o) => (o.payment_status === "paid" || o.payment_status === "refunded")).filter((o) => { const d = new Date(o.paid_at ?? o.order_date); return d >= period.from && d <= period.to; })
    .map((o) => ({ o, a: orderAmounts(o), qty: o.order_lines.reduce((s, l) => s + l.qty, 0) }));
  const pages = Math.max(1, Math.ceil(tx.length / 15)); const cur = Math.min(page, pages - 1);
  function exportCsv() {
    const csv = reportCsv(tx.map(({ o, a, qty }) => ({ paidAt: (o.paid_at ?? o.order_date).replace("T", " ").slice(0, 19), orderId: o.id, paymentId: o.payment_id ?? "", products: o.order_lines.map((l) => `${l.product_items?.products?.name} ×${l.qty}`).join("; "), qty, discount: a.discount, total: a.total, status: paymentLabels[o.payment_status as PaymentStatus] ?? o.payment_status, currency: o.currency })));
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = reportFileName(from, to); link.click(); URL.revokeObjectURL(url);
  }
  return <>
    <PageTitle title="Sales Reports"><Button onClick={exportCsv} disabled={tx.length === 0}><Download />Export CSV</Button></PageTitle>
    <div className="flex flex-wrap items-center gap-2"><Input type="date" aria-label="From date" className="h-10 w-44 bg-background" value={from} max={to} onChange={(e) => { setFrom(e.target.value); setPage(0); }} /><span className="text-sm text-muted-foreground">to</span><Input type="date" aria-label="To date" className="h-10 w-44 bg-background" value={to} min={from} onChange={(e) => { setTo(e.target.value); setPage(0); }} /></div>
    <div className="grid gap-3 sm:grid-cols-3">{[["Paid Orders", String(stats.paidCount)], ["Total Sales", money(stats.sales)], ["Refund", `${money(stats.refunds)} (${stats.refundCount})`]].map(([k, v]) => <div key={k} className="rounded-md border bg-background p-5"><p className="text-sm text-muted-foreground">{k}</p><p className="mt-2 text-2xl font-semibold">{v}</p></div>)}</div>
    <div className="overflow-x-auto border-y bg-background"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="border-b bg-muted/60 text-xs text-muted-foreground"><tr>{["Payment Date", "Order ID", "Payment ID", "Product", "Quantity", "Discount", "Total", "Status", "Currency"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
      <tbody>{tx.slice(cur * 15, cur * 15 + 15).map(({ o, a, qty }) => <tr key={o.id} className="border-b last:border-0"><td className="whitespace-nowrap px-4 py-3">{fmtDate(o.paid_at ?? o.order_date)}</td><td className="px-4 py-3"><Link to="/admin/orders/$id" params={{ id: o.id }} className="text-primary">{shortId(o.id)}</Link></td><td className="px-4 py-3 font-mono text-xs">{o.payment_id ?? "—"}</td><td className="max-w-64 px-4 py-3">{lineSummary(o.order_lines)}</td><td className="px-4 py-3">{qty}</td><td className="px-4 py-3">{money(a.discount)}</td><td className="px-4 py-3">{money(a.total)}</td><td className="px-4 py-3"><PaymentBadge status={o.payment_status} /></td><td className="px-4 py-3">{o.currency}</td></tr>)}</tbody></table>
      {tx.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No transactions in this date range.</p>}</div>
    <div className="flex items-center justify-between text-xs text-muted-foreground"><p>{tx.length} transactions</p><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Previous</Button><span>{cur + 1} / {pages}</span><Button size="sm" variant="outline" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</Button></div></div>
  </>;
}
