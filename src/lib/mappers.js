import { DAY } from '@/lib/data';

const ts = (s) => (s ? Date.parse(s) : 0);

// BE -> bentuk data yang dipakai komponen FE (Dashboard, OutletList, ConversationList, ChatPanel)
export const mapOutlet = (o) => ({
  id: o.id, name: o.name, phone: o.display_number, online: o.is_active, unread: o.unread ?? 0,
});

export const mapMsg = (m) => ({
  id: m.id, dir: m.direction, text: m.body, at: ts(m.created_at),
  template: m.is_template, status: m.status, error: m.error_detail,
});

// outletIdx: { [outletId]: index di array outlets }. FE memakai index, BE memakai id.
export const mapConv = (c, outletIdx) => ({
  id: c.id,
  outlet: outletIdx[c.outlet],
  name: c.name || c.wa_id,
  phone: `+${c.wa_id}`,
  waId: c.wa_id,
  unread: c.unread_count,
  // ChatPanel menghitung jendela 24 jam dari lastInbound: now - lastInbound < DAY
  lastInbound: c.window_expires_at ? ts(c.window_expires_at) - DAY : 0,
  loaded: false, // true setelah seluruh pesan diunduh
  // sebelum chat dibuka, cukup preview pesan terakhir untuk daftar percakapan
  msgs: c.preview ? [{ dir: c.preview_direction, text: c.preview, at: ts(c.last_message_at) }] : [],
});