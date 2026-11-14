import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminOrdersQuery, adminProfilesQuery } from "@/lib/admin-queries";
import { lineSummary, orderStatusOptions, paymentLabels } from "@/lib/admin-orders";
import { money } from "@/lib/pricing";
import { PaymentBadge, StatusBadge, fmtDate, shortId } from "@/components/shop/AdminBits";
import { PageTitle } from "../admin";

type S = { payment?: string | undefined; status?: string | undefined };
export const Route = createFileRoute("/_authenticated/admin/orders/")({
  validateSearch: (s: Record<string, unknown>): S => ({ payment: typeof s["payment"] === "string" ? s["payment"] : undefined, status: s["status"] != null ? String(s["status"]) : undefined }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(adminOrdersQuery), context.queryClient.ensureQueryData(adminProfilesQuery)]),
  head: () => ({ meta: [{ title: "Orders — Admin KEYSHOP" }, { name: "description", content: "Search, filter, and manage KEYSHOP orders." }, { property: "og:title", content: "Orders — Admin KEYSHOP" }, { property: "og:description", content: "Search, filter, and manage KEYSHOP orders." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: OrdersList,
});

function OrdersList() {
  const { data: orders } = useSuspenseQuery(adminOrdersQuery);
  const { data: profiles } = useSuspenseQuery(adminProfilesQuery);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const filtered = orders.filter((o) => {
    const p = byId.get(o.user_id);
    const text = `${o.id} ${o.payment_id ?? ""} ${p?.full_name ?? ""} ${p?.email ?? ""}`.toLowerCase();
    const d = o.order_date.slice(0, 10);
    return text.includes(q.trim().toLowerCase()) && (!search.payment || o.payment_status === search.payment) && (!search.status || String(o.status_id) === search.status) && (!from || d >= from) && (!to || d <= to);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / 15));
  const cur = Math.min(page, pages - 1);
  const reset = () => { setQ(""); setFrom(""); setTo(""); setPage(0); navigate({ search: {} }); };
  return <>
    <PageTitle title="Orders" />
    <div className="flex flex-wrap gap-2 rounded-md border bg-background p-4">
      <div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search orders" placeholder="Order ID, Payment ID, name or email…" className="h-10 pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
      <select aria-label="Payment status" className="h-10 rounded-md border bg-background px-3 text-sm" value={search.payment ?? ""} onChange={(e) => navigate({ search: (s) => ({ ...s, payment: e.target.value || undefined }) })}><option value="">All payments</option>{Object.entries(paymentLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      <select aria-label="Order status" className="h-10 rounded-md border bg-background px-3 text-sm" value={search.status ?? ""} onChange={(e) => navigate({ search: (s) => ({ ...s, status: e.target.value || undefined }) })}><option value="">All statuses</option>{orderStatusOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
      <Input type="date" aria-label="From date" className="h-10 w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
      <Input type="date" aria-label="To date" className="h-10 w-40" value={to} onChange={(e) => setTo(e.target.value)} />
      <Button variant="outline" className="h-10" onClick={reset}><RotateCcw />Reset</Button>
    </div>
    <div className="overflow-x-auto border-y bg-background"><table className="w-full min-w-[1150px] text-left text-sm"><thead className="border-b bg-muted/60 text-xs text-muted-foreground"><tr>{["Order ID", "Payment ID", "Buyer", "Orders", "Total", "Payment Status", "Order Status", "Date", "Actions"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
      <tbody>{filtered.slice(cur * 15, cur * 15 + 15).map((o) => { const p = byId.get(o.user_id); return <tr key={o.id} className="border-b last:border-0 align-top"><td className="px-4 py-3 font-medium">{shortId(o.id)}</td><td className="px-4 py-3 font-mono text-xs">{o.payment_id ?? "—"}</td><td className="px-4 py-3"><p>{p?.full_name || "—"}</p><p className="text-xs text-muted-foreground">{p?.email}</p></td><td className="max-w-64 px-4 py-3">{lineSummary(o.order_lines)}</td><td className="whitespace-nowrap px-4 py-3">{money(Number(o.order_total))}</td><td className="px-4 py-3"><PaymentBadge status={o.payment_status} /></td><td className="px-4 py-3"><StatusBadge id={o.status_id} name={o.order_statuses?.name} /></td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDate(o.order_date)}</td><td className="px-4 py-3"><Button asChild size="sm" variant="outline"><Link to="/admin/orders/$id" params={{ id: o.id }}>View Details</Link></Button></td></tr>; })}</tbody></table>
      {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No matching orders.</p>}</div>
    <div className="flex items-center justify-between text-xs text-muted-foreground"><p>{filtered.length} orders</p><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Previous</Button><span>{cur + 1} / {pages}</span><Button size="sm" variant="outline" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</Button></div></div>
  </>;
}
