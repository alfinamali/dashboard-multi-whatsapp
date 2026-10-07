export const MIN = 60_000, DAY = 24 * 60 * MIN;
export const ago = (m) => Date.now() - m * MIN;
export const C = {
  green: '#0F8F63', greenDark: '#0A7A54', greenSoft: '#E6F5EE', bubbleOut: '#DDF7E3',
  navy: '#0C1E33', page: '#F3F6F5', line: '#E6ECEA', text: '#14212B', muted: '#6B7A85', blue: '#3B6BF0',
};
export const card = { bgcolor: '#fff', border: `1px solid ${C.line}`, borderRadius: 3, boxShadow: '0 1px 3px rgba(12,30,51,.05)' };
export const primaryBtn = { bgcolor: C.green, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: C.greenDark } };
export const actionBtn = { height: 40, textTransform: 'none', fontSize: 13, color: C.text, borderColor: C.line, bgcolor: '#FAFCFB', '& .MuiSvgIcon-root': { fontSize: 18, color: C.muted }, '&:hover': { borderColor: C.green, bgcolor: C.greenSoft } };
export const AVATAR_COLORS = ['#8FB3F5', '#8FD3C0', '#B9A6E8', '#F2B880', '#8CC7F2'];

export const hhmm = (t) => { const d = new Date(t); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
export const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const lastOf = (c) => c.msgs[c.msgs.length - 1] || { dir: 'out', text: '(belum ada pesan)', at: c.createdAt || 0 };

// unread di sini hanya placeholder; badge sebenarnya dihitung dari percakapan (lihat OutletList)
export const OUTLETS = [
  ['Outlet Pusat', '+62 812-3456-7890'], ['Outlet Jakarta', '+62 813-8877-6655'], ['Outlet Bandung', '+62 812-2211-3344'],
  ['Outlet Surabaya', '+62 812-5566-7788'], ['Outlet Medan', '+62 821-4455-6677'], ['Outlet Semarang', '+62 819-3322-1100'],
  ['Outlet Yogyakarta', '+62 812-7000-1122'], ['Outlet Bali', '+62 813-3600-4455'], ['Outlet Makassar', '+62 811-4100-9988'],
  ['Outlet Palembang', '+62 812-7110-2233'], ['Outlet Malang', '+62 821-7788-6543'], ['Outlet Sidoarjo', '+62 812-3100-4400'],
  ['Outlet Depok', '+62 878-2100-3300'], ['Outlet Bekasi', '+62 812-1900-7722'], ['Outlet Tangerang', '+62 813-1500-6611'],
  ['Outlet Bogor', '+62 812-5100-8844'], ['Outlet Solo', '+62 857-2700-1199'], ['Outlet Denpasar', '+62 812-3600-9090'],
  ['Outlet Balikpapan', '+62 811-5400-2288'], ['Outlet Manado', '+62 852-4300-5577'],
].map(([name, phone], i) => ({ name, phone, unread: 0, online: i !== 9 && i !== 16 }));

export const TEMPLATES = [
  { id: 1, name: 'Konfirmasi pesanan', category: 'Utility', status: 'approved', body: 'Halo, pesanan Anda sedang kami proses.' },
  { id: 2, name: 'Terima kasih', category: 'Utility', status: 'approved', body: 'Halo, terima kasih sudah berbelanja di outlet kami.' },
  { id: 3, name: 'Promo akhir bulan', category: 'Marketing', status: 'pending', body: 'Promo akhir bulan! Diskon 10% untuk pembelian 2 set produk.' },
];

export const DEFAULT_SETTINGS = {
  name: 'Admin', email: 'admin@perusahaan.id', sound: true, notif: true,
  autoReply: false, autoReplyText: 'Terima kasih sudah menghubungi kami. Tim kami akan segera membalas.',
};

// dir: 'in' = pesan masuk, 'out' = balasan kita, 'note' = catatan internal
// msgs ditulis ringkas: [dir, text, menitLalu]. unread & lastInbound dihitung otomatis.
const conv = (id, outlet, name, phone, msgs) => {
  const m = msgs.map(([dir, text, min]) => ({ dir, text, at: ago(min) }));
  let unread = 0;
  for (let i = m.length - 1; i >= 0 && m[i].dir === 'in'; i--) unread++;
  const lastIn = [...m].reverse().find((x) => x.dir === 'in');
  return { id, outlet, name, phone, lastInbound: lastIn ? lastIn.at : 0, unread, msgs: m };
};

export const makeConvs = () => [
  // ── Outlet Pusat (0) ──
  conv(1, 0, 'Rina Wulandari', '+62 812-3456-7001', [
    ['in', 'Halo, apakah outlet pusat buka hari ini?', 38],
    ['out', 'Halo! 👋 Ya, outlet pusat buka pukul 07.00 - 22.00. Ada yang bisa kami bantu?', 37],
    ['in', 'Apakah ada promo untuk pembelian 2 set produk?', 36],
    ['out', 'Ada diskon 10% untuk pembelian 2 set, berlaku sampai akhir bulan 😊', 35],
    ['in', 'Wah menarik! Bisa minta detail produknya?', 14]]),
  conv(2, 0, 'Agus Hermawan', '+62 812-7001-2020', [
    ['in', 'Kak, pesanan saya kapan dikirim?', 60],
    ['in', 'Sudah 3 hari belum ada kabar', 55]]),
  conv(3, 0, 'Maria Ulfa', '+62 813-7001-3030', [
    ['in', 'Ukuran L masih ada?', 125],
    ['out', 'Masih ada kak, mau dibuatkan pesanan?', 120]]),
  conv(4, 0, 'Hendro Gunawan', '+62 815-7001-4040', [
    ['in', 'Bisa kirim invoice untuk pesanan kemarin?', 240],
    ['out', 'Baik pak, kami kirimkan via email ya.', 230],
    ['in', 'Oke, ditunggu', 225],
    ['note', 'Pelanggan korporat, kirim invoice ke finance@hendro.co.id', 220]]),
  conv(5, 0, 'Lestari Dewi', '+62 857-7001-5050', [
    ['in', 'Halo kak, mau tanya cara klaim garansi', 380],
    ['out', 'Halo kak! Silakan kirim foto produk dan struk pembelian ya 🙏', 375],
    ['in', '🖼️ foto-produk.jpg', 370],
    ['out', 'Terima kasih, klaim sedang kami proses. Estimasi 2-3 hari kerja.', 360]]),

  // ── Outlet Jakarta (1) ──
  conv(6, 1, 'Siti Nurhaliza', '+62 813-8001-1010', [['in', 'Terima kasih, sudah membantu!', 12]]),
  conv(7, 1, 'Fajar Nugroho', '+62 812-8001-4040', [['in', 'Bisa COD ke Kemang?', 300]]),
  conv(8, 1, 'Bayu Aditya', '+62 821-8001-5050', [
    ['in', 'Mau pesan 2 set, ada diskon?', 90],
    ['out', 'Ada kak, diskon 10% untuk 2 set. Mau dilanjutkan?', 85],
    ['in', 'Lanjut, kirim ke Cilandak ya', 80],
    ['in', 'Alamat lengkap saya kirim nanti', 79],
    ['in', 'Bisa hari ini sampai?', 78]]),
  conv(9, 1, 'Nadia Putri', '+62 878-8001-6060', [
    ['in', 'Pesanan #2291 sudah sampai, terima kasih', 700],
    ['out', 'Sama-sama kak, ditunggu order berikutnya 😊', 690]]),

  // ── Outlet Bandung (2) ──
  conv(10, 2, 'Rizky Pratama', '+62 812-2001-3344', [['in', 'Apakah ada stok untuk warna hitam?', 8]]),
  conv(11, 2, 'Citra Kirana', '+62 821-2200-5050', [
    ['in', 'Terima kasih promonya', 33],
    ['out', 'Sama-sama kak 😊', 30]]),
  conv(12, 2, 'Dimas Anggara', '+62 813-2001-7070', [
    ['in', 'Barang yang kemarin ada cacat di bagian jahitan', 150],
    ['in', '🖼️ foto-cacat.jpg', 149],
    ['in', 'Bisa ditukar?', 148]]),

  // ── Outlet Surabaya (3) ──
  conv(13, 3, 'Andi Saputra', '+62 812-5001-7788', [
    ['in', 'Saya mau pesan 3 pcs ya', 17],
    ['in', 'Yang warna navy', 16]]),
  conv(14, 3, 'Wahyu Hidayat', '+62 815-5001-8899', [
    ['in', 'Ongkir ke Gresik berapa?', 200],
    ['out', 'Untuk Gresik Rp15.000 kak, estimasi 1 hari.', 195]]),
  conv(15, 3, 'Putri Maharani', '+62 857-5001-9900', [['in', 'Katalog terbaru ada kak?', 45]]),

  // ── Outlet Medan (4) ──
  conv(16, 4, 'Dewi Lestari', '+62 821-4001-6677', [['in', 'Bisa kirim ke alamat ini?', 19]]),
  conv(17, 4, 'Ahmad Fauzi', '+62 812-4001-1122', [
    ['in', 'Pesanan saya sudah dibayar, mohon dicek', 500],
    ['out', 'Sudah kami terima pak, pesanan segera diproses.', 490]]),

  // ── Outlet lain (1 customer) ──
  conv(18, 5, 'Budi Santoso', '+62 819-3001-1100', [['out', 'Oke, terima kasih informasinya', 24]]),
  conv(19, 5, 'Yuni Astuti', '+62 812-3001-2200', [
    ['in', 'Kapan restock produk yang kemarin?', 2000],
    ['out', 'Rencananya minggu depan kak.', 1990]]),
  conv(20, 6, 'Maya Anggraini', '+62 857-1200-3456', [
    ['in', 'Ada ukuran M untuk model ini?', 25],
    ['in', 'Kalau ada saya ambil 2', 24]]),
  conv(21, 7, 'Hendra Wijaya', '+62 812-9000-1212', [
    ['in', 'Apakah bisa kirim ke luar Bali?', 70],
    ['out', 'Bisa pak, ke seluruh Indonesia lewat ekspedisi.', 65]]),
  conv(22, 8, 'Lina Marlina', '+62 815-9090-2211', [['in', 'Halo, masih buka?', 1600]]),
  conv(23, 10, 'Toni Prakoso', '+62 821-7788-1234', [['in', 'Barang sudah diterima, terima kasih', 1700]]),
];

export const makeContacts = (convs) => [
  ...convs.map((c) => ({ id: c.id, name: c.name, phone: c.phone, outlet: c.outlet })),
  // kontak tersimpan yang belum pernah chat
  { id: 91, name: 'Rangga Pratama', phone: '+62 812-7110-0091', outlet: 9 },
  { id: 92, name: 'Salsa Bilqis', phone: '+62 813-3100-0092', outlet: 11 },
  { id: 93, name: 'Reza Mahendra', phone: '+62 878-2100-0093', outlet: 12 },
];