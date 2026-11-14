<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Storefront sections live in src/components/shop (Shop.tsx sections, data.ts content/asset pointers); keeps the migrated single-page shop in one place.
- Homepage hero sizing uses viewport-height-aware CSS and a proportional image layer; this keeps desktop categories visible without distorting the hardware.
- Catalog reads go through public server fns in src/lib/catalog.functions.ts; user data uses the browser client with RLS; order placement/status changes only via SQL functions place_order/set_order_status — keeps stock and totals atomic and server-trusted.
- Promotion pricing rule lives in both SQL item_price() and src/lib/pricing.ts (tested); change both together.
- Account and order pages share AccountLayout; account sections and order filters live in URL search parameters so navigation updates in place and browser history works.
- Account identity reads the owner-scoped profile with a shared query; notification preferences are stored in user metadata, not used as permissions or delivery logic.
- Featured deals use the shared Embla-backed carousel with header navigation; this keeps arrow, swipe, and boundary behavior consistent.
- Admin catalog reads and writes use authenticated server functions with database-verified roles; product, SKU and option changes use one atomic SQL function to preserve variant IDs and order references.
- Admin catalog editing supports one variation dimension per product and never deletes existing SKUs; zero stock retires an unavailable variant without breaking historical orders.
- Admin area is a layout route (admin.tsx) with child pages under _authenticated/admin/; Dashboard, Order, User and Laporan all read one shared admin orders query so figures match across pages.
- Payment status, Payment ID, courier and tracking live on shop_orders; status/payment changes only via SQL functions (set_order_status, set_payment_status, ship_order) and a trigger logs order_status_history.

- Translate legacy system-owned catalog labels through the browser-safe src/lib/english.ts presentation helper; preserve stored customer content and database status identifiers.
