import { describe, expect, it } from "vitest";
import { applyDiscount, discountFor, orderTotal } from "./pricing";

const promos = [
  { id: 1, name: "Audio Week", discount_rate: 15, category_ids: [3, 4] },
  { id: 2, name: "Small", discount_rate: 5, category_ids: [3] },
];

describe("pricing rules", () => {
  it("promotion discounts products in its categories (15% of $120 = $102)", () => {
    expect(applyDiscount(120, discountFor(3, promos))).toBe(102);
  });
  it("uses the biggest promotion when several match", () => {
    expect(discountFor(3, promos)).toBe(15);
  });
  it("categories without promotion keep full price", () => {
    expect(applyDiscount(420, discountFor(6, promos))).toBe(420);
  });
  it("order total adds one flat shipping price", () => {
    expect(orderTotal([{ price: 102, qty: 2 }, { price: 89, qty: 1 }], 15)).toBe(308);
  });
});
