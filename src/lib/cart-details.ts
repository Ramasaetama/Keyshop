import { useQuery } from "@tanstack/react-query";
import { getCartItems } from "@/lib/catalog.functions";
import { useStore } from "@/lib/store";

export function useCartDetails() {
  const { cart } = useStore();
  const ids = cart.map((l) => l.itemId).sort();
  const q = useQuery({ queryKey: ["cart-items", ids], queryFn: () => getCartItems({ data: { ids } }), enabled: ids.length > 0 });
  const lines = cart
    .map((l) => ({ ...l, item: q.data?.find((i) => i.id === l.itemId) }))
    .filter((l): l is typeof l & { item: NonNullable<typeof l.item> } => !!l.item);
  const subtotal = lines.reduce((s, l) => s + l.item.final_price * l.qty, 0);
  return { lines, subtotal, loading: ids.length > 0 && q.isLoading };
}

