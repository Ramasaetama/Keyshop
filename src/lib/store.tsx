import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CartLine = { itemId: number; qty: number };
const LOCAL_KEY = "eshop-cart";

type Store = {
  user: User | null;
  ready: boolean;
  cart: CartLine[];
  count: number;
  add: (itemId: number, qty?: number) => Promise<void>;
  setQty: (itemId: number, qty: number) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
  reload: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

function readLocal(): CartLine[] {
  try {
    const v = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((l) => Number.isFinite(l.itemId) && l.qty > 0) : [];
  } catch {
    return [];
  }
}
function writeLocal(lines: CartLine[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(lines));
}

async function readDb(): Promise<CartLine[]> {
  const { data } = await supabase.from("cart_items").select("product_item_id, qty");
  return (data ?? []).map((r) => ({ itemId: r.product_item_id, qty: r.qty }));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);

  const reload = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    setCart(data.user ? await readDb() : readLocal());
  }, []);

  useEffect(() => {
    reload().finally(() => setReady(true));
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        // merge guest cart into the saved cart
        const local = readLocal();
        if (local.length) {
          const existing = await readDb();
          const rows = local.map((l) => ({
            user_id: session.user.id,
            product_item_id: l.itemId,
            qty: l.qty + (existing.find((e) => e.itemId === l.itemId)?.qty ?? 0),
          }));
          await supabase.from("cart_items").upsert(rows, { onConflict: "user_id,product_item_id" });
          writeLocal([]);
        }
        setCart(await readDb());
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setCart(readLocal());
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [reload]);

  const setQty = useCallback(
    async (itemId: number, qty: number) => {
      if (user) {
        const { error } =
          qty <= 0
            ? await supabase.from("cart_items").delete().eq("product_item_id", itemId)
            : await supabase.from("cart_items").upsert({ user_id: user.id, product_item_id: itemId, qty }, { onConflict: "user_id,product_item_id" });
        if (error) return void toast.error("Unable to update cart");
        setCart(await readDb());
      } else {
        const next = readLocal().filter((l) => l.itemId !== itemId);
        if (qty > 0) next.push({ itemId, qty });
        writeLocal(next);
        setCart(next);
      }
    },
    [user],
  );

  const add = useCallback(
    async (itemId: number, qty = 1) => {
      const current = cart.find((l) => l.itemId === itemId)?.qty ?? 0;
      await setQty(itemId, current + qty);
      toast.success("Added to cart");
    },
    [cart, setQty],
  );

  const remove = useCallback((itemId: number) => setQty(itemId, 0), [setQty]);

  return (
    <Ctx.Provider value={{ user, ready, cart, count: cart.reduce((s, l) => s + l.qty, 0), add, setQty, remove, reload }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside StoreProvider");
  return v;
}
