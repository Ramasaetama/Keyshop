import { describe, it, expect } from "vitest";
import { lineSummary, salesStats, needsProcessing, reportCsv, reportFileName, dayRange, orderAmounts, orderStatusLabel } from "./admin-orders";

const line = (name: string, qty: number, price = 10, base = 10) => ({ qty, price, base_price: base, product_items: { products: { name } } });
const order = (o: Partial<Parameters<typeof needsProcessing>[0][number]>) => ({ id: "x", order_date: "2026-11-05T10:00:00", paid_at: "2026-11-05T10:00:00", payment_status: "paid", status_id: 1, order_total: 100, shipping_price: 5, order_lines: [], ...o });

describe("admin orders", () => {
  it("summarizes order lines", () => {
    expect(lineSummary([line("Boat Wireless Headphones", 1), line("A", 1), line("B", 2)])).toBe("Boat Wireless Headphones ×1, +2 more items");
    expect(lineSummary([])).toBe("—");
  });
  it("counts only successful payments as sales and refunds separately", () => {
    const p = dayRange("2026-11-01", "2026-11-30");
    const s = salesStats([order({}), order({ payment_status: "pending" }), order({ payment_status: "refunded", order_total: 40 }), order({ order_date: "2026-10-01T00:00:00", paid_at: "2026-10-01T00:00:00" })], p);
    expect(s).toMatchObject({ sales: 100, refunds: 40, orderCount: 3 });
  });
  it("needs processing = paid and still packing", () => {
    expect(needsProcessing([order({}), order({ status_id: 2 }), order({ payment_status: "pending" })])).toHaveLength(1);
  });
  it("computes discount from purchase vs base price", () => {
    expect(orderAmounts(order({ order_lines: [line("A", 2, 8.5, 10)] })).discount).toBe(3);
  });
  it("maps statuses to storefront tab labels", () => {
    expect(orderStatusLabel(1)).toBe("Packing");
    expect(orderStatusLabel(4, "Belum Bayar")).toBe("Unpaid");
  });
  it("exports one escaped row per transaction", () => {
    const csv = reportCsv([{ paidAt: "2026-11-05", orderId: "o1", paymentId: "P1", products: "A ×1, B ×2", qty: 3, discount: 0, total: 30, status: "Lunas", currency: "USD" }]);
    expect(csv.split("\n")).toHaveLength(2);
    expect(csv).toContain('"A ×1, B ×2"');
    expect(reportFileName("2026-11-01", "2026-11-30")).toBe("sales-report-2026-11-01-to-2026-11-30.csv");
  });
});
