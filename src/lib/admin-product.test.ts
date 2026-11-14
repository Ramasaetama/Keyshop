import { describe, expect, it } from "vitest";
import { productInput, stockState } from "./admin-product";

const product = { name: "Laptop", description: "", category_id: 11, image_url: "https://example.com/laptop.jpg", tag: null, is_deal: false, variation_name: "Warna", items: [{ sku: "LAP-BLACK", variant: "Hitam", price: 100, qty_in_stock: 5 }] };
describe("Admin catalog validation", () => {
  it("flags stock below five, but not five", () => { expect(stockState(4)).toBe("low"); expect(stockState(5)).toBe("available"); });
  it("distinguishes sold-out stock", () => expect(stockState(0)).toBe("empty"));
  it("rejects negative stock", () => expect(productInput.safeParse({ ...product, items: [{ ...product.items[0], qty_in_stock: -1 }] }).success).toBe(false));
  it("rejects fractional stock", () => expect(productInput.safeParse({ ...product, items: [{ ...product.items[0], qty_in_stock: 1.5 }] }).success).toBe(false));
  it("rejects negative prices", () => expect(productInput.safeParse({ ...product, items: [{ ...product.items[0], price: -1 }] }).success).toBe(false));
  it("requires at least one SKU", () => expect(productInput.safeParse({ ...product, items: [] }).success).toBe(false));
  it("rejects duplicate SKUs", () => expect(productInput.safeParse({ ...product, items: [...product.items, { ...product.items[0], variant: "Putih" }] }).success).toBe(false));
  it("accepts an existing product and SKU IDs", () => expect(productInput.parse({ ...product, id: 15, items: [{ ...product.items[0], id: 43 }] }).items[0]?.id).toBe(43));
  it("accepts existing hosted catalog images", () => expect(productInput.safeParse({ ...product, image_url: "/__l5e/assets-v1/21d54ea5-c75e-4829-8b69-047bb33faec2/asus-rog-strix-g16.jpg" }).success).toBe(true));
  it("rejects script image URLs", () => expect(productInput.safeParse({ ...product, image_url: "javascript:alert(1)" }).success).toBe(false));
});