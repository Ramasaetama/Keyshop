import { orderTabForStatus, orderTabs } from "./order-tabs";

export const ADMIN_ORDER_SELECT =
  "id, user_id, order_date, payment_id, payment_status, paid_at, currency, payment_label, shipping_address, shipping_price, order_total, status_id, courier, tracking_number, shipped_at, order_statuses(name), shipping_methods(name), order_lines(id, qty, price, base_price, product_items(sku, products(name, image_url), product_configurations(variation_options(value))))";

export type PaymentStatus = "pending" | "paid" | "expired" | "refunded";
export const paymentLabels: Record<PaymentStatus, string> = { pending: "Pending Payment", paid: "Paid", expired: "Expired", refunded: "Refund" };
export const orderStatusOptions = [
  { id: 4, label: "Unpaid" }, { id: 1, label: "Packing" }, { id: 2, label: "Shipped" },
  { id: 3, label: "Completed" }, { id: 5, label: "Cancelled" }, { id: 6, label: "Returns" },
];
export function orderStatusLabel(statusId: number, name?: string | null) {
  const tab = orderTabForStatus(statusId, name);
  return orderTabs.find((t) => t.key === tab)?.label ?? name ?? "—";
}

type Line = { qty: number; price: number | string; base_price?: number | string | null; product_items?: { products?: { name: string } | null } | null };
export type OrderLike = { id: string; order_date: string; paid_at?: string | null; payment_status: string; status_id: number; order_total: number | string; shipping_price: number | string; order_lines: Line[] };

export function lineSummary(lines: Line[]) {
  const firstLine = lines[0];
  if (!firstLine) return "—";
  const first = `${firstLine.product_items?.products?.name ?? "Product"} ×${firstLine.qty}`;
  return lines.length > 1 ? `${first}, +${lines.length - 1} more items` : first;
}
export function orderAmounts(o: OrderLike) {
  const subtotal = o.order_lines.reduce((s, l) => s + Number(l.price) * l.qty, 0);
  const discount = o.order_lines.reduce((s, l) => s + Math.max(0, Number(l.base_price ?? l.price) - Number(l.price)) * l.qty, 0);
  return { subtotal: round(subtotal), discount: round(discount), shipping: Number(o.shipping_price), total: Number(o.order_total) };
}
const round = (n: number) => Math.round(n * 100) / 100;

export type Period = { from: Date; to: Date };
/** Inclusive local-day range. */
export function presetPeriod(preset: "today" | "7d" | "30d", now = new Date()): Period {
  const to = new Date(now); to.setHours(23, 59, 59, 999);
  const from = new Date(now); from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (preset === "today" ? 0 : preset === "7d" ? 6 : 29));
  return { from, to };
}
export function dayRange(fromIso: string, toIso: string): Period {
  const from = new Date(`${fromIso}T00:00:00`); const to = new Date(`${toIso}T23:59:59.999`);
  return { from, to };
}
const inPeriod = (iso: string | null | undefined, p: Period) => !!iso && new Date(iso) >= p.from && new Date(iso) <= p.to;

export function isPaid(o: { payment_status: string }) { return o.payment_status === "paid"; }
/** Sales = successful payments whose payment time falls in the period. Refunds counted separately. */
export function salesStats(orders: OrderLike[], p: Period) {
  const paid = orders.filter((o) => isPaid(o) && inPeriod(o.paid_at ?? o.order_date, p));
  const refunded = orders.filter((o) => o.payment_status === "refunded" && inPeriod(o.paid_at ?? o.order_date, p));
  return {
    sales: round(paid.reduce((s, o) => s + Number(o.order_total), 0)),
    paidCount: paid.length,
    refunds: round(refunded.reduce((s, o) => s + Number(o.order_total), 0)),
    refundCount: refunded.length,
    orderCount: orders.filter((o) => inPeriod(o.order_date, p)).length,
  };
}
export function needsProcessing(orders: OrderLike[]) {
  return orders.filter((o) => isPaid(o) && o.status_id === 1);
}
export function dailySales(orders: OrderLike[], p: Period) {
  const days: { date: string; label: string; total: number }[] = [];
  const d = new Date(p.from);
  while (d <= p.to && days.length < 400) {
    days.push({ date: isoDay(d), label: d.toLocaleDateString("en-US", { day: "2-digit", month: "short" }), total: 0 });
    d.setDate(d.getDate() + 1);
  }
  for (const o of orders) if (isPaid(o) && inPeriod(o.paid_at ?? o.order_date, p)) {
    const day = days.find((x) => x.date === isoDay(new Date(o.paid_at ?? o.order_date)));
    if (day) day.total = round(day.total + Number(o.order_total));
  }
  return days;
}
export function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const csvCell = (v: string | number) => { const s = String(v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
/** One row per transaction (order) so multi-product orders are never double counted. */
export function reportCsv(rows: { paidAt: string; orderId: string; paymentId: string; products: string; qty: number; discount: number; total: number; status: string; currency: string }[]) {
  const header = ["Payment Date", "Order ID", "Payment ID", "Product", "Quantity", "Discount", "Transaction Total", "Payment Status", "Currency"];
  return [header, ...rows.map((r) => [r.paidAt, r.orderId, r.paymentId, r.products, r.qty, r.discount.toFixed(2), r.total.toFixed(2), r.status, r.currency])]
    .map((r) => r.map(csvCell).join(",")).join("\n");
}
export function reportFileName(from: string, to: string) { return `sales-report-${from}-to-${to}.csv`; }
