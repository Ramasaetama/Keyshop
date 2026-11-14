import { englishLabel } from "@/lib/english";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell, ProductCard } from "@/components/shop/Shop";
import { getCategories, getCategoryPage } from "@/lib/catalog.functions";

type Search = { cat?: number | undefined; q?: string | undefined };

const pageQuery = (s: Search) =>
  queryOptions({ queryKey: ["category", s.cat ?? 1, s.q ?? ""], queryFn: () => getCategoryPage({ data: { id: s.cat ?? 1, search: s.q } }) });
const catsQuery = queryOptions({ queryKey: ["categories"], queryFn: () => getCategories() });

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: s["cat"] ? Number(s["cat"]) || undefined : undefined,
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
  }),
  loaderDeps: ({ search }) => ({ cat: search.cat, q: search.q }),
  loader: ({ context, deps }) =>
    Promise.all([context.queryClient.ensureQueryData(pageQuery(deps)), context.queryClient.ensureQueryData(catsQuery)]),
  head: () => ({
    meta: [
      { title: "Shop All Products — KEYSHOP" },
      { name: "description", content: "Explore KEYSHOP electronics: audio, wearables, gaming, laptops, and accessories." },
      { property: "og:title", content: "Shop All Products — KEYSHOP" },
      { property: "og:description", content: "Explore KEYSHOP electronics: audio, wearables, gaming, laptops, and accessories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShopPage,
  errorComponent: ({ error }) => <div className="p-10 text-center">Unable to load: {englishLabel((error as Error).message)}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Category not found.</div>,
});

function ShopPage() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(pageQuery(search));
  const { data: cats } = useSuspenseQuery(catsQuery);
  const roots = cats.filter((c) => c.parent_id === 1);
  return (
    <PageShell>
      <div className="container-shop grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <h2 className="mb-3 text-sm font-bold">Categories</h2>
          <ul className="space-y-1 text-sm">
            <li><Link to="/shop" search={{}} className="hover:text-primary">All</Link></li>
            {roots.map((r) => (
              <li key={r.id}>
                <Link to="/shop" search={{ cat: r.id }} className={`font-medium hover:text-primary ${search.cat === r.id ? "text-primary" : ""}`}>{englishLabel(r.name)}</Link>
                <ul className="ml-3 mt-1 space-y-1 border-l border-border pl-3">
                  {cats.filter((c) => c.parent_id === r.id).map((c) => (
                    <li key={c.id}>
                      <Link to="/shop" search={{ cat: c.id }} className={`text-muted-foreground hover:text-primary ${search.cat === c.id ? "text-primary" : ""}`}>{englishLabel(c.name)}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </aside>
        <section>
          <nav className="text-xs text-muted-foreground">
            {data.trail.map((t, i) => (
              <span key={t.id}>{i > 0 && " › "}<Link to="/shop" search={{ cat: t.id }} className="hover:text-primary">{englishLabel(t.name)}</Link></span>
            ))}
          </nav>
          <h1 className="mt-1 text-2xl font-bold">
            {search.q ? `Results for "${search.q}"` : englishLabel(data.current?.name) || "All Products"}
          </h1>
          <p className="text-sm text-muted-foreground">{data.products.length} products</p>
          {data.products.length === 0 ? (
            <p className="mt-10 text-center text-muted-foreground">No matching products yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
              {data.products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
