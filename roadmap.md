# Account UI revision
- [x] Show registered user name in the header.
- [x] Build shared account sidebar and individual account views.
- [x] Add same-page order status tabs and preserve reviews.
- [x] Test signed-in profile/preference persistence, no-reload tabs, and responsive layout; 17 tests passed.

# Admin dashboard — stage 1
- [x] Build admin sidebar, product catalog, search and stock filters.
- [x] Add atomic product/variant editing with admin-only access and catalog/HTTPS photo selection.
- [ ] Image uploads: workspace blocks public image storage; photo selection is available instead.
- [x] Test validation and desktop/mobile screens.
- [x] Verify product creation and stock readback as keytama; remove QA product and restore original stock.
- [ ] Verify signed-in non-admin redirect: injected ordinary-user session is unavailable; admin content was not exposed, but authenticated redirect remains unverified.
# Admin dashboard — stage 2 (sidebar modules)
- [x] Sidebar + logout confirmation; Dashboard, Order list/detail (resi & kirim), User list/detail, Laporan + CSV.
- [ ] Home Slides (max 3, homepage hero carousel).
- [ ] Banner Promosi (static homepage positions).
- [ ] Category management (order, active, unique slug).
- [ ] Manage Logo (needs image upload; public storage is blocked in workspace).
- [ ] Pengaturan toko + link to storefront.
- [ ] Waiting on user: missing "Persistensi dan Kriteria Selesai" section of the brief.

# English page language
- [x] Translate all current storefront, account, authentication, and admin pages, including system labels and metadata.
- [x] Verify public and signed-in pages in English without changing business behavior; 32 existing tests pass, desktop/mobile checked.
