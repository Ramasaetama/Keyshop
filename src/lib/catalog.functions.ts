import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { applyDiscount, discountFor, type ActivePromotion } from "./pricing";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type CatalogProduct = {
  id: number;
  name: string;
  image_url: string;
  category_id: number;
  category: string;
  tag: string | null;
  is_deal: boolean;
  price: number;
  final_price: number;
  discount: number;
  in_stock: number;
};

type Db = ReturnType<typeof publicClient>;

async function activePromotions(db: Db): Promise<ActivePromotion[]> {
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("promotions")
    .select("id, name, discount_rate, promotion_categories(category_id)")
    .lte("start_date", now)
    .gte("end_date", now);
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    discount_rate: Number(p.discount_rate),
    category_ids: p.promotion_categories.map((c) => c.category_id),
  }));
}

async function loadProducts(db: Db, filter?: { categoryIds?: number[] | undefined; search?: string | undefined }) {
  let q = db
    .from("products")
    .select("id, name, image_url, category_id, tag, is_deal, categories(name), product_items(price, qty_in_stock)")
    .order("id");
  if (filter?.categoryIds) q = q.in("category_id", filter.categoryIds);
  if (filter?.search) q = q.ilike("name", `%${filter.search.replace(/[%_]/g, "")}%`);
  const [{ data, error }, promos] = await Promise.all([q, activePromotions(db)]);
  if (error) throw new Error(error.message);
  const products: CatalogProduct[] = (data ?? []).map((p) => {
    const price = Math.min(...p.product_items.map((i) => Number(i.price)));
    const discount = discountFor(p.category_id, promos);
    return {
      id: p.id,
      name: p.name,
      image_url: p.image_url,
      category_id: p.category_id,
      category: p.categories?.name ?? "",
      tag: p.tag,
      is_deal: p.is_deal,
      price,
      final_price: applyDiscount(price, discount),
      discount,
      in_stock: p.product_items.reduce((s, i) => s + i.qty_in_stock, 0),
    };
  });
  return { products, promos };
}

export const getHomeCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const { products, promos } = await loadProducts(db);
  return { products, promos };
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("categories").select("id, parent_id, name").order("id");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getCategoryPage = createServerFn({ method: "GET" })
  .inputValidator((d: { id?: number | undefined; search?: string | undefined }) => ({ id: Number(d.id ?? 1) || 1, search: d.search?.slice(0, 80) }))
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: cats, error } = await db.from("categories").select("id, parent_id, name").order("id");
    if (error) throw new Error(error.message);
    const all = cats ?? [];
    const current = all.find((c) => c.id === data.id) ?? null;
    // include all descendant categories
    const ids = new Set<number>([data.id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const c of all) if (c.parent_id && ids.has(c.parent_id) && !ids.has(c.id)) { ids.add(c.id); grew = true; }
    }
    const trail: typeof all = [];
    let cur = current;
    while (cur) { trail.unshift(cur); cur = all.find((c) => c.id === cur!.parent_id) ?? null; }
    const { products } = await loadProducts(db, { categoryIds: [...ids], search: data.search });
    return { current, trail, children: all.filter((c) => c.parent_id === data.id), products };
  });

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => ({ q: String(d.q ?? "").slice(0, 80) }))
  .handler(async ({ data }) => (await loadProducts(publicClient(), { search: data.q })).products);

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: { id: number }) => ({ id: Number(d.id) }))
  .handler(async ({ data }) => {
    const db = publicClient();
    const [{ data: p, error }, promos, { data: reviews }] = await Promise.all([
      db
        .from("products")
        .select(
          "id, name, description, image_url, category_id, categories(name), variations(id, name, variation_options(id, value)), product_items(id, sku, price, qty_in_stock, product_configurations(variation_option_id))",
        )
        .eq("id", data.id)
        .maybeSingle(),
      activePromotions(db),
      db.from("reviews").select("id, reviewer_name, rating, comment, created_at").eq("product_id", data.id).order("created_at", { ascending: false }),
    ]);
    if (error) throw new Error(error.message);
    if (!p) return null;
    const discount = discountFor(p.category_id, promos);
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      image_url: p.image_url,
      category_id: p.category_id,
      category: p.categories?.name ?? "",
      discount,
      variations: p.variations.map((v) => ({ id: v.id, name: v.name, options: v.variation_options })),
      items: p.product_items.map((i) => ({
        id: i.id,
        sku: i.sku,
        price: Number(i.price),
        final_price: applyDiscount(Number(i.price), discount),
        qty_in_stock: i.qty_in_stock,
        option_ids: i.product_configurations.map((c) => c.variation_option_id),
      })),
      reviews: reviews ?? [],
    };
  });

export const getShippingMethods = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("shipping_methods").select("id, name, price").order("price");
  if (error) throw new Error(error.message);
  return (data ?? []).map((s) => ({ ...s, price: Number(s.price) }));
});

/** Item details for cart display (guest or signed-in). */
export const getCartItems = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => ({ ids: (d.ids ?? []).map(Number).filter(Number.isFinite).slice(0, 100) }))
  .handler(async ({ data }) => {
    if (!data.ids.length) return [];
    const db = publicClient();
    const [{ data: items, error }, promos] = await Promise.all([
      db
        .from("product_items")
        .select("id, sku, price, qty_in_stock, products(id, name, image_url, category_id), product_configurations(variation_options(value))")
        .in("id", data.ids),
      activePromotions(db),
    ]);
    if (error) throw new Error(error.message);
    return (items ?? []).map((i) => {
      const discount = i.products ? discountFor(i.products.category_id, promos) : 0;
      return {
        id: i.id,
        sku: i.sku,
        product_id: i.products?.id ?? 0,
        name: i.products?.name ?? "",
        image_url: i.products?.image_url ?? "",
        variant: i.product_configurations.map((c) => c.variation_options?.value).filter(Boolean).join(" / "),
        price: Number(i.price),
        final_price: applyDiscount(Number(i.price), discount),
        qty_in_stock: i.qty_in_stock,
      };
    });
  });
