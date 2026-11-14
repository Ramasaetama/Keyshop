import { englishLabel } from "@/lib/english";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/shop/Shop";
import { useCartDetails } from "@/lib/cart-details";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart — KEYSHOP" },
      { name: "description", content: "View and update your KEYSHOP shopping cart." },
      { property: "og:title", content: "Shopping Cart — KEYSHOP" },
      { property: "og:description", content: "View and update your KEYSHOP shopping cart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { user, ready, setQty, remove } = useStore();
  const { lines, subtotal, loading } = useCartDetails();

  return (
    <PageShell>
      <div className="container-shop py-10">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        {!user && ready && (
          <p className="mt-2 text-sm text-muted-foreground">
            Your guest cart is saved only in this browser. <Link to="/auth" className="text-primary underline">Sign In</Link> to save it to your account.
          </p>
        )}
        {!ready || loading ? (
          <p className="mt-8 text-muted-foreground">Loading…</p>
        ) : lines.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="mt-4 inline-block rounded-sm bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Start Shopping</Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
            <ul className="divide-y divide-border rounded-sm border border-border">
              {lines.map((l) => (
                <li key={l.itemId} className="flex items-center gap-4 p-4">
                  <img src={l.item.image_url} alt={l.item.name} className="h-20 w-20 rounded-sm bg-muted object-contain p-1" />
                  <div className="flex-1">
                    <Link to="/product/$id" params={{ id: String(l.item.product_id) }} className="font-medium hover:text-primary">{l.item.name}</Link>
                    <p className="text-xs text-muted-foreground">{l.item.variant.split(" / ").map(englishLabel).join(" / ")}</p>
                    <p className="text-sm font-bold text-primary">{money(l.item.final_price)}</p>
                    {l.qty > l.item.qty_in_stock && <p className="text-xs text-destructive">Stock remaining: {l.item.qty_in_stock}</p>}
                  </div>
                  <div className="flex items-center rounded-sm border border-border">
                    <button className="px-3 py-1" onClick={() => setQty(l.itemId, l.qty - 1)} aria-label="Decrease">−</button>
                    <span className="w-8 text-center text-sm">{l.qty}</span>
                    <button className="px-3 py-1" disabled={l.qty >= l.item.qty_in_stock} onClick={() => setQty(l.itemId, l.qty + 1)} aria-label="Increase">+</button>
                  </div>
                  <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => remove(l.itemId)}>Delete</button>
                </li>
              ))}
            </ul>
            <aside className="h-fit rounded-sm border border-border p-5">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-bold">{money(subtotal)}</span></div>
              <p className="mt-1 text-xs text-muted-foreground">Shipping is selected at checkout.</p>
              {user ? (
                <Link to="/checkout" className="mt-4 block rounded-sm bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground">Proceed to Checkout</Link>
              ) : (
                <Link to="/auth" search={{ redirect: "/checkout" }} className="mt-4 block rounded-sm bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground">Sign In to Checkout</Link>
              )}
            </aside>
          </div>
        )}
      </div>
    </PageShell>
  );
}
