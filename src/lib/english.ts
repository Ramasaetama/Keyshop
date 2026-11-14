/** Translate existing system-owned catalog labels without rewriting customer content. */
const labels: Record<string, string> = {
  "Headphone nirkabel dengan baterai 30 jam.": "Wireless headphones with 30-hour battery life.",
  "Jam olahraga tahan air dengan GPS.": "Water-resistant sports watch with GPS.",
  "Kacamata VR ringan untuk gaming imersif.": "Lightweight VR goggles for immersive gaming.",
  "Casing keras bermotif untuk perlindungan maksimal.": "Patterned hard case for maximum protection.",
  "Bass dalam untuk produksi musik.": "Deep bass for music production.",
  "Smartwatch klasik dengan pemantau detak jantung.": "Classic smartwatch with heart rate monitoring.",
  "Ponsel kamera tiga lensa.": "Smartphone with a triple-lens camera.",
  "Laptop tipis untuk kreator.": "Slim laptop for creators.",
  "Pelacak aktivitas sepanjang hari.": "All-day activity tracker.",
  "Stik game nirkabel presisi tinggi.": "High-precision wireless game controller.",
  "Speaker bluetooth tahan air.": "Water-resistant Bluetooth speaker.",
  "Headset VR mandiri tanpa kabel.": "Standalone wireless VR headset.",
  "Jam pintar ringan untuk harian.": "Lightweight smartwatch for everyday use.",
  "Over-ear dengan peredam bising aktif.": "Over-ear headphones with active noise cancellation.",
  "Komputer": "Computers", "Konsol generasi terbaru dengan DualSense.": "Next-generation console with DualSense.",
  "Elektronik": "Electronics", "Speaker": "Speakers", "Aksesoris": "Accessories", "Konsol": "Consoles",
  "Warna": "Color", "Hitam": "Black", "Putih": "White", "Biru": "Blue", "Standar": "Standard",
  "Kartu Kredit": "Credit Card", "Kartu Debit": "Debit Card", "Transfer Bank": "Bank Transfer",
  "Reguler (3-5 hari)": "Standard (3–5 days)", "Express (1-2 hari)": "Express (1–2 days)",
  "Akses admin diperlukan": "Admin access is required", "Gagal memeriksa akses admin": "Unable to verify admin access",
  "Gagal memuat katalog admin": "Unable to load the admin catalog", "Produk dan varian wajib diisi": "Product and variant details are required",
  "Produk tidak ditemukan": "Product not found", "Produk memiliki beberapa jenis opsi; konfigurasi tidak boleh ditimpa": "Products with multiple option types cannot be overwritten",
  "Varian lama tidak boleh dihapus; ubah stok menjadi nol": "Existing variants cannot be deleted; set their stock to zero",
  "Harga dan stok tidak valid": "Invalid price or stock", "Varian bukan milik produk ini": "This variant does not belong to this product",
};
export function englishLabel(value?: string | null): string {
  return value ? labels[value] ?? value : "";
}