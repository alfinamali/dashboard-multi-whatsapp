import { DAY } from '@/lib/data';

const ts = (s) => (s ? Date.parse(s) : 0);

// BE -> bentuk data yang dipakai komponen FE (Dashboard, OutletList, ConversationList, ChatPanel)
export const mapOutlet = (o) => ({
  id: o.id, name: o.name, city: o.city || '', phone: o.display_number, online: o.is_active, unread: o.unread ?? 0,
  phoneNumberId: o.phone_number_id, wabaId: o.waba_id || '',
  mode: o.mode || 'cloud', // 'coexist' = nomor tetap aktif di aplikasi WhatsApp Business HP
  verifiedName: o.verified_name || '',
  connectedAt: ts(o.connected_at),
  contactsSynced: !!o.contacts_sync_requested_at,
  historySynced: !!o.history_sync_requested_at,
  historyProgress: o.history_progress ?? 0,
  disconnected: o.disconnected_reason || '',
  autoReply: !!o.auto_reply, autoReplyText: o.auto_reply_text || '',
});

export const mapMsg = (m) => ({
  id: m.id, dir: m.direction, text: m.body, at: ts(m.created_at),
  template: m.is_template, status: m.status, error: m.error_detail,
  source: m.source, // dashboard | customer | phone (dikirim dari HP) | history (riwayat HP)
  by: m.sent_by_name,
});

// outletIdx: { [outletId]: index di array outlets }. FE memakai index, BE memakai id.
export const mapConv = (c, outletIdx) => ({
  id: c.id,
  outlet: outletIdx[c.outlet],
  outletId: c.outlet,
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