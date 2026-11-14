export const orderTabs = [
  { key: "all", label: "All" },
  { key: "unpaid", label: "Unpaid" },
  { key: "packing", label: "Packing" },
  { key: "shipped", label: "Shipped" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "returned", label: "Returns" },
] as const;
export type OrderTab = (typeof orderTabs)[number]["key"];
export function parseOrderTab(value: unknown): OrderTab {
  return orderTabs.find((tab) => tab.key === value)?.key ?? "all";
}
export function orderTabForStatus(statusId: number, statusName?: string | null): OrderTab | null {
  const name = statusName?.trim().toLowerCase();
  if (name === "belum bayar") return "unpaid";
  if (name === "dibatalkan") return "cancelled";
  if (name === "pengembalian barang") return "returned";
  if (name === "sedang dikemas" || name === "diproses") return "packing";
  if (name === "dikirim" || name === "sedang dikirim") return "shipped";
  if (name === "selesai" || name === "diterima") return "completed";
  return ({ 1: "packing", 2: "shipped", 3: "completed" } as const)[statusId as 1 | 2 | 3] ?? null;
}
export function matchesOrderTab(order: { status_id: number; order_statuses?: { name: string } | null }, tab: OrderTab) {
  return tab === "all" || orderTabForStatus(order.status_id, order.order_statuses?.name) === tab;
}