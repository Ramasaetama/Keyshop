import { englishLabel } from "@/lib/english";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImageOff, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { productInput, type ProductInput } from "@/lib/admin-product";
import { saveAdminProduct, type AdminCatalog, type AdminProduct } from "@/lib/admin.functions";

const fieldClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export function AdminProductEditor({ product, catalog, onClose }: { product: AdminProduct | null; catalog: AdminCatalog; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductInput>(() => product ? {
    id: product.id, name: product.name, description: englishLabel(product.description), category_id: product.category_id,
    image_url: product.image_url, tag: productInput.innerType().shape.tag.safeParse(product.tag).success ? product.tag as ProductInput["tag"] : null,
    is_deal: product.is_deal, variation_name: englishLabel(product.variations[0]?.name) || "Color",
    items: product.product_items.map((i) => ({ id: i.id, sku: i.sku, price: Number(i.price), qty_in_stock: i.qty_in_stock, variant: i.product_configurations.map((c) => englishLabel(c.variation_options?.value)).filter(Boolean).join(" / ") || "Standard" })),
  } : { name: "", description: "", category_id: catalog.categories.find((c) => c.parent_id !== null)?.id ?? 1, image_url: "", tag: null, is_deal: false, variation_name: "Color", items: [{ sku: "", variant: "", price: 0, qty_in_stock: 0 }] });
  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) { setForm((prev) => ({ ...prev, [key]: value })); }
  function item(index: number, values: Partial<ProductInput["items"][number]>) { setForm((prev) => ({ ...prev, items: prev.items.map((i, n) => n === index ? { ...i, ...values } : i) })); }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = productInput.safeParse(form);
    if (!result.success) return void toast.error(result.error.issues[0]?.message ?? "Check the product details");
    setSaving(true);
    try {
      await saveAdminProduct({ data: result.data });
      await queryClient.invalidateQueries();
      toast.success("Product and stock saved successfully");
      onClose();
    } catch (error) { toast.error(error instanceof Error ? englishLabel(error.message) : "Unable to save product"); }
    finally { setSaving(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
    <DialogContent className="max-h-[90svh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto" aria-describedby={undefined} onInteractOutside={(e) => { if (saving) e.preventDefault(); }}>
      <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
          <div className="space-y-3">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-muted p-3">{form.image_url ? <img src={form.image_url} alt="Product photo" className="h-full w-full object-contain" /> : <ImageOff className="size-8 text-muted-foreground" />}</div>
            <label className="block space-y-2 text-sm font-medium"><span>Catalog photo</span><select className={fieldClass} value="" onChange={(e) => set("image_url", e.target.value)}><option value="">Choose photo…</option>{catalog.products.map((p) => <option key={p.id} value={p.image_url}>{p.name}</option>)}</select></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium sm:col-span-2"><span>Product name</span><Input required maxLength={200} value={form.name} onChange={(e) => set("name", e.target.value)} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Category</span><select className={fieldClass} value={form.category_id} onChange={(e) => set("category_id", Number(e.target.value))}>{catalog.categories.map((c) => <option value={c.id} key={c.id}>{englishLabel(c.name)}</option>)}</select></label>
            <label className="space-y-2 text-sm font-medium"><span>Storefront tag</span><select className={fieldClass} value={form.tag ?? ""} onChange={(e) => { const value = e.target.value; set("tag", value === "best" || value === "sale" || value === "featured" || value === "new" ? value : null); }}><option value="">No tag</option><option value="best">Best Seller</option><option value="sale">Sale</option><option value="featured">Featured</option><option value="new">New Products</option></select></label>
            <label className="space-y-2 text-sm font-medium sm:col-span-2"><span>Image URL</span><Input required value={form.image_url} onChange={(e) => set("image_url", e.target.value)} /></label>
            <label className="space-y-2 text-sm font-medium sm:col-span-2"><span>Description</span><Textarea rows={3} maxLength={5000} value={form.description} onChange={(e) => set("description", e.target.value)} /></label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.is_deal} onChange={(e) => set("is_deal", e.target.checked)} className="size-4 accent-primary" />Today's Featured Deals</label>
          </div>
        </div>
        <section className="space-y-4 border-t pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Variants & Stock</h2><Button type="button" variant="outline" size="sm" onClick={() => set("items", [...form.items, { sku: "", variant: "", price: 0, qty_in_stock: 0 }])}><Plus />Add Variant</Button></div>
          <label className="block max-w-xs space-y-2 text-sm font-medium"><span>Variant type</span><Input required value={form.variation_name} onChange={(e) => set("variation_name", e.target.value)} /></label>
          {form.items.map((i, index) => <div key={i.id ?? `new-${index}`} className="grid items-end gap-3 border-b pb-4 sm:grid-cols-[1fr_1fr_1fr_100px_36px]">
            <label className="space-y-2 text-xs font-medium"><span>Variant</span><Input required value={i.variant} onChange={(e) => item(index, { variant: e.target.value })} /></label>
            <label className="space-y-2 text-xs font-medium"><span>SKU</span><Input required value={i.sku} onChange={(e) => item(index, { sku: e.target.value })} /></label>
            <label className="space-y-2 text-xs font-medium"><span>Price ($)</span><Input required type="number" min="0" step="0.01" value={i.price} onChange={(e) => item(index, { price: Number(e.target.value) })} /></label>
            <label className="space-y-2 text-xs font-medium"><span>Stock</span><Input required type="number" min="0" step="1" value={i.qty_in_stock} onChange={(e) => item(index, { qty_in_stock: Number(e.target.value) })} /></label>
            {!i.id && <Button type="button" variant="ghost" size="icon" aria-label="Remove new variant" title="Remove new variant" disabled={form.items.length === 1} onClick={() => set("items", form.items.filter((_, n) => n !== index))}><Trash2 className="text-destructive" /></Button>}
          </div>)}
        </section>
        <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}><Save />{saving ? "Saving…" : "Save Product"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}