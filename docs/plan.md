# Rencana Pengembangan Fitur E-commerce (Next.js)

Dokumen ini berisi rencana implementasi teknis untuk 5 fitur baru dan perbaikan bug pada aplikasi e-commerce berbasis Next.js.

## 1. Dialog Window untuk Checkout dan Hapus Item
**Tujuan:** Menampilkan konfirmasi saat pengguna ingin melakukan checkout atau menghapus item dari keranjang belanja untuk mencegah ketidaksengajaan.

**Implementasi (Next.js/React):**
- **Komponen:** Buat komponen `ConfirmDialog` yang reusable.
- **UI Library:** Gunakan Radix UI Dialog, Headless UI, atau tag native HTML `<dialog>` untuk menjaga aksesibilitas (a11y).
- **State Management:** Gunakan state lokal (`useState`) di komponen Cart untuk mengontrol visibilitas dialog (`isCheckoutDialogOpen`, `isRemoveDialogOpen`).
- **Aksi:** Panggil fungsi `proceedToCheckout()` atau `removeFromCart(itemId)` hanya setelah pengguna menekan tombol "Konfirmasi" pada dialog.

## 2. Notifikasi (Toast) saat Menambahkan Item ke Keranjang
**Tujuan:** Memberikan umpan balik visual (feedback) yang jelas seketika saat pengguna berhasil menambahkan produk ke keranjang.

**Implementasi (Next.js/React):**
- **Library:** Integrasikan library toast notification yang ringan seperti `sonner` atau `react-toastify`.
- **Setup Provider:** Tambahkan komponen `Toaster` di root layout aplikasi (`app/layout.tsx` pada App Router atau `pages/_app.tsx` pada Pages Router).
- **Pemanggilan:** Sisipkan fungsi pemanggilan toast (contoh: `toast.success('Berhasil ditambahkan ke keranjang!')`) ke dalam fungsi *event handler* `handleAddToCart` di komponen `ProductCard` atau `ProductDetail`.

## 3. Hitung Total Kuantitas Keranjang Belanja
**Tujuan:** Menampilkan indikator total jumlah seluruh barang (bukan hanya jumlah jenis barang) yang ada di keranjang, biasanya dirender sebagai *badge* di icon keranjang pada Navbar.

**Implementasi (Next.js/React):**
- **State/Konteks:** Di dalam state management keranjang (Cart Context, Redux, atau Zustand), buat fungsi *derived state* / selector.
- **Logika Perhitungan:** 
  ```javascript
  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  ```
- **Integrasi UI:** Tampilkan variabel `totalQuantity` ini pada komponen `Header` atau `Navbar`. Gunakan rendering kondisional agar badge disembunyikan jika `totalQuantity === 0`.

## 4. Kotak Pencarian (Search Box) untuk Produk
**Tujuan:** Memudahkan pengguna mencari spesifik produk berdasarkan nama atau kata kunci.

**Implementasi (Next.js/React):**
- **Komponen Input:** Buat komponen `SearchBox` dengan tag `<input type="search" />`.
- **Routing:** Gunakan hook `useRouter` dan `useSearchParams` (dari `next/navigation`).
- **Flow:** 
  - Saat pengguna mengetik teks dan men-submit (tekan Enter atau klik tombol cari), *push* router ke halaman pencarian dengan URL parameter: `router.push('/products?q=kata-kunci')`.
  - Pertimbangkan menggunakan teknik *debouncing* (misal: library `use-debounce`) jika fitur pencarian akan langsung memfilter tanpa perlu tombol submit.
- **Pengambilan Data:** Di halaman produk (`/products`), ambil param `q` dan teruskan sebagai argumen filter pada pemanggilan API produk.

## 5. Perbaikan Bug: Kuantitas Tidak Bisa Diperbarui Berdasarkan Kelipatan
**Tujuan:** Memperbaiki masalah logika (*bug*) di mana pengguna gagal menambah, mengurangi, atau memasukkan jumlah barang di keranjang berdasarkan kelipatan tertentu.

**Implementasi (Next.js/React):**
- **Identifikasi Masalah:** Periksa *reducer* atau fungsi `updateItemQuantity` di dalam state management keranjang. Kemungkinan ada mutasi state langsung (direct mutation) atau tipe data yang salah (misal *string* alih-alih *number*).
- **Perbaikan Logika:** 
  - Saat memproses *input* kuantitas, pastikan tipe datanya diubah dengan `parseInt(value, 10)` atau `Number(value)`.
  - Jika logika membutuhkan kelipatan (misal produk kelipatan 5: 5, 10, 15), validasi input dengan modulo: `if (newQuantity % stepMultiplier !== 0) { // handle error atau bulatkan }`.
  - Pastikan pengembalian state yang baru menggunakan *spread operator* untuk memicu re-render yang tepat di React:
    ```javascript
    setCartItems(prev => prev.map(item => 
      item.id === targetId ? { ...item, quantity: validNewQuantity } : item
    ));
    ```
- **Validasi Ekstra:** Cegah pengguna memasukkan angka kurang dari batas minimal (misal `< 1`) dan lebih besar dari persediaan (`> stock`).

---

# Evaluasi & Implementasi Core Task (Product List & Cart)

Bagian ini memetakan implementasi *core features* (Product list, Shopping cart, dan Checkout Simulation) agar memenuhi kriteria penilaian teknis (Rubrik 60% Code Structure, 30% Problem Solving).

## A. Code Structure (60%)
- **Framework & Modern Features:** Menggunakan **React (Next.js)** dengan *Functional Components* dan *Hooks*.
- **State Management (3 poin):** Menggunakan **Context API + `useReducer`** (`CartContext.tsx`) untuk mengelola *state* keranjang yang kompleks dengan aman.
- **Custom Hooks:** Membuat hook `useCart()` agar komponen UI dapat mengakses *context* secara bersih.
- **Component Separation:**
  - `ProductList.tsx`: Komponen untuk merender grid produk.
  - `ProductCard.tsx`: Komponen atomik untuk satu item produk.
  - `Cart.tsx`: Menampilkan list item, kalkulasi total, dan tombol checkout.
  - `CheckoutModal.tsx`: Komponen UI dialog khusus simulasi pembayaran.
- **CSS Organization:** Menggunakan **Tailwind CSS** dengan pendekatan *utility-first* untuk mencegah konflik global *styling* dan menjaga konsistensi.

## B. Task Implementation
1. **Product List Display:**
   - Membuat *mock data* statis di `data/products.ts`.
   - Menggunakan CSS Grid (`grid-cols-1 md:grid-cols-3`) agar layout responsif.
2. **Shopping Cart Functionality:**
   - **Add:** Hindari duplikasi array; jika item sudah ada, tambahkan kuantitasnya saja.
   - **Remove:** Hapus item menggunakan `array.filter()`.
   - **Update:** Input kuantitas yang memicu *action* ke *reducer*.
3. **Basic Checkout (Simulation):**
   - Alur: Klik "Checkout" -> Buka `CheckoutModal` -> Klik "Confirm" -> Trigger `CLEAR_CART` -> Tutup Modal & tampilkan notifikasi sukses.

## C. Problem Solving & Optimization (30%)
- **CSS / Layout Issues:**
  - Memberikan keranjang batas tinggi (`max-h-96` dan `overflow-y-auto`) agar item yang banyak tidak merusak layout halaman utama (bisa di-*scroll* di dalam keranjang).
- **JavaScript / Logic Issues:**
  - **Validasi Tipe Data:** Mem-parsing input form dari *String* menjadi *Number* (`parseInt(value, 10)`) sebelum masuk ke reducer.
  - **Validasi Kuantitas Minus:** Menggunakan `Math.max(1, newQuantity)` di reducer agar user tidak dapat memasukkan angka nol atau negatif.
  - **Kalkulasi Terpusat:** Menghitung total harga di dalam fungsi *reducer*, bukan di komponen UI, untuk menghindari ketidaksinkronan state (*Single Source of Truth*).
