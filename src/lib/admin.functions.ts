import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { productInput } from "./admin-product";

export const checkAdmin = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Gagal memeriksa akses admin");
  return data === true;
});

export const getAdminCatalog = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (roleError || !allowed) throw new Error("Akses admin diperlukan");
  const [{ data: products, error }, { data: categories, error: categoryError }] = await Promise.all([
    context.supabase.from("products").select("id, name, description, category_id, image_url, tag, is_deal, categories(name), variations(id, name), product_items(id, sku, price, qty_in_stock, product_configurations(variation_options(value)))").order("id", { ascending: false }),
    context.supabase.from("categories").select("id, name, parent_id").order("id"),
  ]);
  if (error || categoryError) throw new Error("Gagal memuat katalog admin");
  return { products: products ?? [], categories: categories ?? [] };
});

export type AdminCatalog = Awaited<ReturnType<typeof getAdminCatalog>>;
export type AdminProduct = AdminCatalog["products"][number];

export const saveAdminProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => productInput.parse(data))
  .handler(async ({ context, data }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !allowed) throw new Error("Akses admin diperlukan");
    const { data: id, error } = await context.supabase.rpc("admin_save_product", { _payload: data });
    if (error) throw new Error(error.message);
    return id;
  });