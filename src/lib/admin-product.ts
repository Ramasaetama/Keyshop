import { z } from "zod";

export const productInput = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1, "Product name is required").max(200),
  description: z.string().max(5000),
  category_id: z.number().int().positive(),
  image_url: z.string().refine((v) => /^\/__l5e\/assets-v1\/[a-zA-Z0-9/_\-.]+$/.test(v) || (v.startsWith("https://") && z.string().url().safeParse(v).success), "Choose a catalog photo or an HTTPS image URL"),
  tag: z.enum(["best", "sale", "featured", "new"]).nullable(),
  is_deal: z.boolean(),
  variation_name: z.string().trim().min(1).max(80),
  items: z.array(z.object({
    id: z.number().int().positive().optional(),
    sku: z.string().trim().min(1).max(100),
    variant: z.string().trim().min(1).max(100),
    price: z.number().finite().nonnegative(),
    qty_in_stock: z.number().int().nonnegative(),
  })).min(1, "Add at least one variant").max(100),
}).superRefine((p, ctx) => {
  if (new Set(p.items.map((i) => i.sku.toLowerCase())).size !== p.items.length)
    ctx.addIssue({ code: "custom", path: ["items"], message: "Each variant must have a unique SKU" });
  if (new Set(p.items.map((i) => i.variant.toLowerCase())).size !== p.items.length)
    ctx.addIssue({ code: "custom", path: ["items"], message: "Each variant must have a unique name" });
});

export type ProductInput = z.infer<typeof productInput>;
export function stockState(stock: number) {
  return stock === 0 ? "empty" : stock < 5 ? "low" : "available";
}