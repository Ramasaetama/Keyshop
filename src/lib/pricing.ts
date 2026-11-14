export type ActivePromotion = { id: number; name: string; discount_rate: number; category_ids: number[] };

/** Highest active discount (percent) for a category; 0 when none. Mirrors the SQL item_price() rule. */
export function discountFor(categoryId: number, promotions: ActivePromotion[]): number {
  return promotions.reduce((best, p) => (p.category_ids.includes(categoryId) ? Math.max(best, Number(p.discount_rate)) : best), 0);
}

export function applyDiscount(price: number, rate: number): number {
  return Math.round(price * (1 - rate / 100) * 100) / 100;
}

export function orderTotal(lines: { price: number; qty: number }[], shippingPrice: number): number {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return Math.round((subtotal + shippingPrice) * 100) / 100;
}

export function money(n: number) {
  return `$${n.toFixed(2)}`;
}
