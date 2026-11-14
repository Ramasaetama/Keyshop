import { describe, expect, it } from "vitest";
import { matchesOrderTab, parseOrderTab } from "./order-tabs";

describe("Order filtering", () => {
  const processing = { status_id: 1, order_statuses: { name: "Diproses" } };
  it("All includes every status", () => {
    for (const status_id of [1, 2, 3, 42]) expect(matchesOrderTab({ status_id }, "all")).toBe(true);
  });
  it("Sedang Dikemas includes Diproses, not shipped orders", () => {
    expect(matchesOrderTab(processing, "packing")).toBe(true);
    expect(matchesOrderTab({ status_id: 2 }, "packing")).toBe(false);
  });
  it("Dikirim includes Sedang Dikirim, not completed orders", () => {
    expect(matchesOrderTab({ status_id: 2, order_statuses: { name: "Sedang Dikirim" } }, "shipped")).toBe(true);
    expect(matchesOrderTab({ status_id: 3 }, "shipped")).toBe(false);
  });
  it("Selesai includes Diterima, not processing orders", () => {
    expect(matchesOrderTab({ status_id: 3, order_statuses: { name: "Diterima" } }, "completed")).toBe(true);
    expect(matchesOrderTab(processing, "completed")).toBe(false);
  });
  for (const [tab, name] of [["unpaid", "Belum Bayar"], ["cancelled", "Dibatalkan"], ["returned", "Pengembalian Barang"]] as const) {
    it(`${name} only includes its matching status`, () => {
      expect(matchesOrderTab({ status_id: 42, order_statuses: { name } }, tab)).toBe(true);
      expect(matchesOrderTab(processing, tab)).toBe(false);
    });
  }
  it("defaults invalid tabs to All", () => expect(parseOrderTab("unknown")).toBe("all"));
});