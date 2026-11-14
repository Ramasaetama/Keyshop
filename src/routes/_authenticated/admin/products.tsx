import { englishLabel } from "@/lib/english";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Boxes, Package, Search, Plus, Pencil, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminProductEditor } from "@/components/shop/AdminProductEditor";
import { getAdminCatalog, type AdminProduct } from "@/lib/admin.functions";
import { stockState } from "@/lib/admin-product";
import { money } from "@/lib/pricing";
import { PageTitle } from "../admin";

export const adminCatalogQuery = (userId: string) => queryOptions({ queryKey: ["admin-catalog", userId], queryFn: () => getAdminCatalog() });
export const Route = createFileRoute("/_authenticated/admin/products")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminCatalogQuery(context.user.id)),
  head: () => ({ meta: [{ title: "Products & Stock — Admin KEYSHOP" }, { name: "description", content: "Manage KEYSHOP products, variants, and stock." }, { property: "og:title", content: "Products & Stock — Admin KEYSHOP" }, { property: "og:description", content: "Manage KEYSHOP products, variants, and stock." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ProductsPage,
});

function StockBadge({ stock }: { stock: number }) {
  const state = stockState(stock);
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-1 text-xs font-medium ${state === "empty" ? "bg-destructive/10 text-destructive" : state === "low" ? "bg-accent/25 text-accent-foreground" : "bg-brand-green/15 text-foreground"}`}><span className={`size-1.5 rounded-full ${state === "empty" ? "bg-destructive" : state === "low" ? "bg-accent" : "bg-brand-green"}`} />{state === "empty" ? "Out of stock" : state === "low" ? "Low stock" : "Available"}</span>;
}

function ProductsPage() {
  const { user } = Route.useRouteContext();
  const { data: catalog } = useSuspenseQuery(adminCatalogQuery(user.id));
  const [editing, setEditing] = useState<AdminProduct | null | undefined>();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const [page, setPage] = useState(0);
  const variants = catalog.products.flatMap((p) => p.product_items);
  const filtered = catalog.products.filter((p) => {
    const matchesSearch = `${p.name} ${p.product_items.map((i) => i.sku).join(" ")}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === "all" || p.category_id === Number(category)) && (stock === "all" || p.product_items.some((i) => stockState(i.qty_in_stock) === stock));
  });
  const maxPage = Math.max(0, Math.ceil(filtered.length / 10) - 1);
  const currentPage = Math.min(page, maxPage);
  const visible = filtered.slice(currentPage * 10, currentPage * 10 + 10);
  const metrics = [
    { label: "Total Products", value: catalog.products.length, icon: Package, color: "bg-primary/10 text-primary" },
    { label: "Total Variants", value: variants.length, icon: Boxes, color: "bg-brand-green/15 text-foreground" },
    { label: "Low Stock", value: variants.filter((i) => stockState(i.qty_in_stock) === "low").length, icon: AlertTriangle, color: "bg-accent/25 text-accent-foreground" },
    { label: "Out of Stock", value: variants.filter((i) => stockState(i.qty_in_stock) === "empty").length, icon: Package, color: "bg-destructive/10 text-destructive" },
  ];
  return <>
    <PageTitle title="Products & Stock"><Button onClick={() => setEditing(null)}><Plus />Add Product</Button></PageTitle>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map((m) => <div key={m.label} className="rounded-md border bg-background p-4 sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs text-muted-foreground sm:text-sm">{m.label}</p><span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${m.color}`}><m.icon className="size-4" /></span></div><p className="mt-3 text-3xl font-semibold tabular-nums">{m.value}</p></div>)}</div>
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Product List <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length})</span></h2><div className="flex w-full flex-wrap gap-2 xl:w-auto"><div className="relative w-full min-w-0 xl:w-64"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search product or SKU" placeholder="Search product or SKU…" className="h-10 pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} /></div><select aria-label="Filter categories" value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }} className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm xl:w-40 min-w-36"><option value="all">All categories</option>{catalog.categories.map((c) => <option key={c.id} value={c.id}>{englishLabel(c.name)}</option>)}</select><select aria-label="Filter stock" value={stock} onChange={(e) => { setStock(e.target.value); setPage(0); }} className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm xl:w-36 min-w-36"><option value="all">All stock</option><option value="available">Available</option><option value="low">Low stock</option><option value="empty">Out of stock</option></select></div></div>
            <div className="overflow-x-auto border-y bg-background"><table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b bg-muted/60 text-xs text-muted-foreground"><tr>{["Product", "Category", "Price", "Stock", "Status", ""].map((label, i) => <th key={i} className="px-5 py-4 font-medium">{label}</th>)}</tr></thead><tbody>{visible.map((p) => { const total = p.product_items.reduce((sum, i) => sum + i.qty_in_stock, 0); const lowest = Math.min(...p.product_items.map((i) => i.qty_in_stock), 0 + total); return <tr key={p.id} className="border-b last:border-b-0 hover:bg-muted/40"><td className="px-5 py-4"><div className="flex items-center gap-3"><img src={p.image_url} alt="" className="size-14 shrink-0 rounded-sm border object-contain p-1" /><div className="max-w-60"><p className="font-medium">{p.name}</p><p className="mt-1 text-xs text-muted-foreground">{p.product_items.length} variants · #{p.id}</p></div></div></td><td className="px-5 py-4 text-muted-foreground">{englishLabel(p.categories?.name)}</td><td className="whitespace-nowrap px-5 py-4">{money(Math.min(...p.product_items.map((i) => Number(i.price))))}</td><td className="px-5 py-4 tabular-nums">{total}</td><td className="px-5 py-4"><StockBadge stock={total === 0 ? 0 : lowest === 0 ? 1 : lowest} /></td><td className="px-5 py-4"><Button size="icon" variant="ghost" aria-label={`Edit ${p.name}`} title="Edit product and stock" onClick={() => setEditing(p)}><Pencil /></Button></td></tr>; })}</tbody></table>{visible.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">No matching products.</div>}</div>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><p>{filtered.length ? currentPage * 10 + 1 : 0}–{Math.min((currentPage + 1) * 10, filtered.length)} of {filtered.length} products</p><div className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="Previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft /></Button><span>{currentPage + 1} / {maxPage + 1}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={currentPage === maxPage} onClick={() => setPage(currentPage + 1)}><ChevronRight /></Button></div></div>
          </section>
    {editing !== undefined && <AdminProductEditor product={editing} catalog={catalog} onClose={() => setEditing(undefined)} />}
  </>;
}
