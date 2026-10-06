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

export const OUTLETS = [
  ['Outlet Pusat', 142, '+62 812-3456-7890'], ['Outlet Jakarta', 96, '+62 813-8877-6655'], ['Outlet Bandung', 78, '+62 812-2211-3344'],
  ['Outlet Surabaya', 63, '+62 812-5566-7788'], ['Outlet Medan', 52, '+62 821-4455-6677'], ['Outlet Semarang', 41, '+62 819-3322-1100'],
  ['Outlet Yogyakarta', 37, '+62 812-7000-1122'], ['Outlet Bali', 29, '+62 813-3600-4455'], ['Outlet Makassar', 26, '+62 811-4100-9988'],
  ['Outlet Palembang', 22, '+62 812-7110-2233'], ['Outlet Malang', 18, '+62 821-7788-6543'], ['Outlet Sidoarjo', 15, '+62 812-3100-4400'],
  ['Outlet Depok', 12, '+62 878-2100-3300'], ['Outlet Bekasi', 11, '+62 812-1900-7722'], ['Outlet Tangerang', 9, '+62 813-1500-6611'],
  ['Outlet Bogor', 8, '+62 812-5100-8844'], ['Outlet Solo', 6, '+62 857-2700-1199'], ['Outlet Denpasar', 5, '+62 812-3600-9090'],
  ['Outlet Balikpapan', 4, '+62 811-5400-2288'], ['Outlet Manado', 3, '+62 852-4300-5577'],
].map(([name, unread, phone]) => ({ name, unread, phone, online: true }));

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
export const makeConvs = () => [
  { id: 1, outlet: 0, name: 'Rina Wulandari', phone: '+62 812-3456-7001', lastInbound: ago(14), unread: 0, msgs: [
    { dir: 'in', text: 'Halo, apakah outlet pusat buka hari ini?', at: ago(38) },
    { dir: 'out', text: 'Halo! 👋 Ya, outlet pusat buka pukul 07.00 - 22.00. Ada yang bisa kami bantu?', at: ago(37) },
    { dir: 'in', text: 'Apakah ada promo untuk pembelian 2 set produk?', at: ago(36) },
    { dir: 'out', text: 'Ada diskon 10% untuk pembelian 2 set, berlaku sampai akhir bulan 😊', at: ago(35) },
    { dir: 'in', text: 'Wah menarik! Bisa minta detail produknya?', at: ago(14) } ] },
  { id: 2, outlet: 2, name: 'Rizky Pratama', phone: '+62 812-2211-3344', lastInbound: ago(8), unread: 3, msgs: [{ dir: 'in', text: 'Apakah ada stok untuk warna hitam?', at: ago(8) }] },
  { id: 3, outlet: 1, name: 'Siti Nurhaliza', phone: '+62 813-8877-6655', lastInbound: ago(12), unread: 1, msgs: [{ dir: 'in', text: 'Terima kasih, sudah membantu!', at: ago(12) }] },
  { id: 4, outlet: 3, name: 'Andi Saputra', phone: '+62 812-5566-7788', lastInbound: ago(16), unread: 2, msgs: [{ dir: 'in', text: 'Saya mau pesan 3 pcs ya', at: ago(16) }] },
  { id: 5, outlet: 4, name: 'Dewi Lestari', phone: '+62 821-4455-6677', lastInbound: ago(19), unread: 1, msgs: [{ dir: 'in', text: 'Bisa kirim ke alamat ini?', at: ago(19) }] },
  { id: 6, outlet: 5, name: 'Budi Santoso', phone: '+62 819-3322-1100', lastInbound: ago(24), unread: 0, msgs: [{ dir: 'out', text: 'Oke, terima kasih informasinya', at: ago(24) }] },
  { id: 7, outlet: 10, name: 'Toni Prakoso', phone: '+62 821-7788-6543', lastInbound: ago(1700), unread: 0, msgs: [{ dir: 'in', text: 'Barang sudah diterima, terima kasih', at: ago(1700) }] },
];
export const makeContacts = (convs) => [
  ...convs.map((c) => ({ id: c.id, name: c.name, phone: c.phone, outlet: c.outlet })),
  { id: 91, name: 'Maya Anggraini', phone: '+62 857-1200-3456', outlet: 6 },
  { id: 92, name: 'Hendra Wijaya', phone: '+62 812-9000-1212', outlet: 7 },
  { id: 93, name: 'Lina Marlina', phone: '+62 815-9090-2211', outlet: 8 },
];
