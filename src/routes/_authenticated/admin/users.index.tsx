import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminOrdersQuery, adminProfilesQuery } from "@/lib/admin-queries";
import { isPaid } from "@/lib/admin-orders";
import { money } from "@/lib/pricing";
import { PageTitle } from "../admin";

export const Route = createFileRoute("/_authenticated/admin/users/")({
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(adminOrdersQuery), context.queryClient.ensureQueryData(adminProfilesQuery)]),
  head: () => ({ meta: [{ title: "Customers — Admin KEYSHOP" }, { name: "description", content: "KEYSHOP customer directory." }, { property: "og:title", content: "Customers — Admin KEYSHOP" }, { property: "og:description", content: "KEYSHOP customer directory." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: UsersPage,
});

function UsersPage() {
  const { data: orders } = useSuspenseQuery(adminOrdersQuery);
  const { data: profiles } = useSuspenseQuery(adminProfilesQuery);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const rows = profiles.map((p) => { const mine = orders.filter((o) => o.user_id === p.id); return { ...p, count: mine.length, spent: mine.filter(isPaid).reduce((s, o) => s + Number(o.order_total), 0) }; })
    .filter((p) => `${p.full_name} ${p.email}`.toLowerCase().includes(q.trim().toLowerCase()));
  const pages = Math.max(1, Math.ceil(rows.length / 15)); const cur = Math.min(page, pages - 1);
  return <>
    <PageTitle title="Customers" />
    <div className="relative max-w-md"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search customers" placeholder="Search name or email…" className="h-10 bg-background pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
    <div className="overflow-x-auto border-y bg-background"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-muted/60 text-xs text-muted-foreground"><tr>{["Name", "Email", "Joined", "Order Count", "Total Spent", "Actions"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead>
      <tbody>{rows.slice(cur * 15, cur * 15 + 15).map((p) => <tr key={p.id} className="border-b last:border-0"><td className="px-5 py-3 font-medium">{p.full_name || "—"}</td><td className="px-5 py-3 text-muted-foreground">{p.email}</td><td className="px-5 py-3">{new Date(p.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}</td><td className="px-5 py-3 tabular-nums">{p.count}</td><td className="px-5 py-3">{money(p.spent)}</td><td className="px-5 py-3"><Button asChild size="sm" variant="outline"><Link to="/admin/users/$id" params={{ id: p.id }}>View Details</Link></Button></td></tr>)}</tbody></table>
      {rows.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No matching customers.</p>}</div>
    <div className="flex items-center justify-between text-xs text-muted-foreground"><p>{rows.length} customers</p><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Previous</Button><span>{cur + 1} / {pages}</span><Button size="sm" variant="outline" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</Button></div></div>
  </>;
}
