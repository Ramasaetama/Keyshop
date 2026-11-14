import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminOrdersQuery, adminProfilesQuery } from "@/lib/admin-queries";
import { isPaid, lineSummary } from "@/lib/admin-orders";
import { money } from "@/lib/pricing";
import { PaymentBadge, StatusBadge, fmtDate, shortId } from "@/components/shop/AdminBits";
import { PageTitle } from "../admin";

export const Route = createFileRoute("/_authenticated/admin/users/$id")({
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(adminOrdersQuery), context.queryClient.ensureQueryData(adminProfilesQuery)]); },
  head: () => ({ meta: [{ title: "Customer Details — Admin KEYSHOP" }, { name: "description", content: "Customer contact details and order history." }, { property: "og:title", content: "Customer Details — Admin KEYSHOP" }, { property: "og:description", content: "Customer contact details and order history." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  notFoundComponent: () => <p className="p-8">Customer not found.</p>,
  component: UserDetail,
});

function UserDetail() {
  const { id } = Route.useParams();
  const { data: orders } = useSuspenseQuery(adminOrdersQuery);
  const { data: profiles } = useSuspenseQuery(adminProfilesQuery);
  const p = profiles.find((x) => x.id === id);
  if (!p) throw notFound();
  const mine = orders.filter((o) => o.user_id === id);
  return <>
    <Button asChild variant="ghost" size="sm" className="-ml-2"><Link to="/admin/users"><ArrowLeft />Customers</Link></Button>
    <PageTitle title={p.full_name || p.email} />
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-md border bg-background p-5 text-sm"><h2 className="mb-2 font-semibold">Contact</h2><p>{p.email}</p><p className="text-muted-foreground">{p.phone || "No phone number provided"}</p><p className="mt-2 text-xs text-muted-foreground">Joined {fmtDate(p.created_at)}</p></div>
      <div className="rounded-md border bg-background p-5"><p className="text-sm text-muted-foreground">Order Count</p><p className="mt-2 text-3xl font-semibold">{mine.length}</p></div>
      <div className="rounded-md border bg-background p-5"><p className="text-sm text-muted-foreground">Total Spent (paid)</p><p className="mt-2 text-3xl font-semibold">{money(mine.filter(isPaid).reduce((s, o) => s + Number(o.order_total), 0))}</p></div>
    </div>
    <section className="space-y-3"><h2 className="font-semibold">Order History</h2><div className="overflow-x-auto border-y bg-background"><table className="w-full min-w-[720px] text-left text-sm"><tbody>{mine.map((o) => <tr key={o.id} className="border-b last:border-0"><td className="px-5 py-3 font-medium"><Link to="/admin/orders/$id" params={{ id: o.id }} className="text-primary">{shortId(o.id)}</Link></td><td className="px-5 py-3">{lineSummary(o.order_lines)}</td><td className="px-5 py-3">{money(Number(o.order_total))}</td><td className="px-5 py-3"><PaymentBadge status={o.payment_status} /></td><td className="px-5 py-3"><StatusBadge id={o.status_id} name={o.order_statuses?.name} /></td><td className="px-5 py-3 text-muted-foreground">{fmtDate(o.order_date)}</td></tr>)}</tbody></table>{mine.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No orders yet.</p>}</div></section>
  </>;
}
