import { englishLabel } from "@/lib/english";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/shop/Shop";
import { supabase } from "@/integrations/supabase/client";
import { getShippingMethods } from "@/lib/catalog.functions";
import { useCartDetails } from "@/lib/cart-details";
import { money, orderTotal } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { useAddresses, usePaymentMethods } from "./account";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — KEYSHOP" },
      { name: "description", content: "Choose an address, shipping method, and payment method for your KEYSHOP order." },
      { property: "og:title", content: "Checkout — KEYSHOP" },
      { property: "og:description", content: "Choose an address, shipping method, and payment method for your KEYSHOP order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lines, subtotal, loading } = useCartDetails();
  const { reload } = useStore();
  const { data: addresses = [] } = useAddresses();
  const { data: payments = [] } = usePaymentMethods();
  const { data: shipping = [] } = useQuery({ queryKey: ["shipping"], queryFn: () => getShippingMethods() });
  const [addr, setAddr] = useState<string>();
  const [pay, setPay] = useState<string>();
  const [ship, setShip] = useState<number>();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => { if (!addr && addresses.length) setAddr((addresses.find((a) => a.is_default) ?? addresses[0])?.id); }, [addresses, addr]);
  useEffect(() => { if (!pay && payments.length) setPay((payments.find((p) => p.is_default) ?? payments[0])?.id); }, [payments, pay]);
  useEffect(() => { if (!ship && shipping.length) setShip(shipping[0]?.id); }, [shipping, ship]);

  const shipPrice = shipping.find((s) => s.id === ship)?.price ?? 0;
  const total = orderTotal(lines.map((l) => ({ price: l.item.final_price, qty: l.qty })), shipPrice);

  async function place() {
    if (!addr || !pay || !ship) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("place_order", { _address: addr, _shipping: ship, _payment: pay });
    setBusy(false);
    if (error) return void toast.error(englishLabel(error.message));
    toast.success("Order placed successfully!");
    await reload();
    qc.invalidateQueries();
    navigate({ to: "/orders", search: { placed: data ?? undefined } });
  }

  const radio = (active: boolean) => `block cursor-pointer rounded-sm border p-3 text-sm ${active ? "border-primary bg-primary/5" : "border-border"}`;

  if (!loading && lines.length === 0)
    return (
      <PageShell>
        <div className="container-shop py-16 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="mt-4 inline-block text-primary underline">Start shopping</Link>
        </div>
      </PageShell>
    );

  return (
    <PageShell>
      <div className="container-shop grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <section>
            <h2 className="mb-2 font-semibold">1. Shipping Address</h2>
            {addresses.length === 0 ? (
              <p className="text-sm">No addresses yet. <Link to="/account" className="text-primary underline">Add one in My Account</Link></p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {addresses.map((a) => (
                  <label key={a.id} className={radio(addr === a.id)}>
                    <input type="radio" className="sr-only" checked={addr === a.id} onChange={() => setAddr(a.id)} />
                    <p className="font-semibold">{a.label}</p>
                    <p className="text-muted-foreground">{a.recipient}, {a.street}, {a.city}</p>
                  </label>
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="mb-2 font-semibold">2. Shipping Method</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {shipping.map((s) => (
                <label key={s.id} className={radio(ship === s.id)}>
                  <input type="radio" className="sr-only" checked={ship === s.id} onChange={() => setShip(s.id)} />
                  <p className="font-semibold">{englishLabel(s.name)}</p>
                  <p className="text-muted-foreground">{money(s.price)}</p>
                </label>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">3. Payment</h2>
            {payments.length === 0 ? (
              <p className="text-sm">No payment methods yet. <Link to="/account" className="text-primary underline">Add one in My Account</Link></p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {payments.map((p) => (
                  <label key={p.id} className={radio(pay === p.id)}>
                    <input type="radio" className="sr-only" checked={pay === p.id} onChange={() => setPay(p.id)} />
                    <p className="font-semibold">{englishLabel(p.payment_types?.name)} · {p.provider}</p>
                    <p className="text-muted-foreground">•••• {p.account_last4}</p>
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>
        <aside className="h-fit rounded-sm border border-border p-5">
          <h2 className="font-bold">Summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {lines.map((l) => (
              <li key={l.itemId} className="flex justify-between gap-2">
                <span>{l.item.name} <span className="text-muted-foreground">({l.item.variant.split(" / ").map(englishLabel).join(" / ")}) ×{l.qty}</span></span>
                <span>{money(l.item.final_price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{money(shipPrice)}</span></div>
            <div className="flex justify-between font-bold"><span>Total</span><span className="text-primary">{money(total)}</span></div>
          </div>
          <button disabled={busy || !addr || !pay || !ship} onClick={place} className="mt-4 w-full rounded-sm bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            {busy ? "Processing…" : "Buat Order"}
          </button>
          <p className="mt-2 text-[11px] text-muted-foreground">Payments are simulated — no money will be charged.</p>
        </aside>
      </div>
    </PageShell>
  );
}
