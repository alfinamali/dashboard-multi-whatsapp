'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, OUTLETS, TEMPLATES, makeContacts, makeConvs } from '@/lib/data';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
let nid = 100;
const INCOMING = ['Apakah barang ini masih tersedia?', 'Jam buka hari ini sampai jam berapa?', 'Bisa kirim hari ini?', 'Saya mau pesan 2 pcs'];

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [convs, setConvs] = useState([]);
  const [outlets, setOutlets] = useState(OUTLETS);
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState(TEMPLATES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Data waktu diisi setelah mount agar tidak beda antara server dan klien
  const seed = () => {
    const c = makeConvs();
    setConvs(c); setContacts(makeContacts(c)); setOutlets(OUTLETS); setTemplates(TEMPLATES);
    setSettings(DEFAULT_SETTINGS); setActiveId(1); setReady(true);
  };
  useEffect(seed, []);

  const patch = (id, fn) => setConvs((p) => p.map((c) => (c.id === id ? fn(c) : c)));
  const addMsg = (id, m) => patch(id, (c) => ({ ...c, msgs: [...c.msgs, { at: Date.now(), ...m }] }));
  const bumpOutlet = (i, d) => setOutlets((p) => p.map((o, k) => (k === i ? { ...o, unread: Math.max(0, o.unread + d) } : o)));

  const value = {
    ready, convs, outlets, contacts, templates, settings, activeId, setActiveId, query, setQuery, toast,
    notify: setToast, clearToast: () => setToast(null), reset: () => { seed(); setToast('Data demo dikembalikan'); },
    totalUnread: outlets.reduce((a, o) => a + o.unread, 0),

    send: (id, text, template = false) => addMsg(id, { dir: 'out', text, template }),
    note: (id, text) => addMsg(id, { dir: 'note', text }),
    openConv(id) {
      setActiveId(id);
      const c = convs.find((x) => x.id === id);
      if (c?.unread) { bumpOutlet(c.outlet, -c.unread); patch(id, (x) => ({ ...x, unread: 0 })); }
    },
    simulateIncoming() {
      const c = convs[Math.floor(Math.random() * convs.length)];
      if (!c) return;
      const at = Date.now(), seen = c.id === activeId;
      const msgs = [{ dir: 'in', text: INCOMING[Math.floor(Math.random() * INCOMING.length)], at }];
      if (settings.autoReply) msgs.push({ dir: 'out', text: settings.autoReplyText, at: at + 1, auto: true });
      if (!seen) bumpOutlet(c.outlet, 1);
      patch(c.id, (x) => ({ ...x, unread: seen ? 0 : x.unread + 1, lastInbound: at, msgs: [...x.msgs, ...msgs] }));
      if (settings.notif) setToast(`Pesan baru dari ${c.name}`);
    },

    toggleOutlet: (i) => setOutlets((p) => p.map((o, k) => (k === i ? { ...o, online: !o.online } : o))),
    addOutlet: (o) => setOutlets((p) => [...p, { name: o.name, phone: o.phone, unread: 0, online: true }]),

    addContact: (c) => setContacts((p) => [{ ...c, id: ++nid, outlet: Number(c.outlet) }, ...p]),
    removeContact: (id) => setContacts((p) => p.filter((c) => c.id !== id)),
    startChat(ct) {
      let c = convs.find((x) => x.phone === ct.phone && x.outlet === ct.outlet);
      if (!c) { c = { id: ++nid, outlet: ct.outlet, name: ct.name, phone: ct.phone, lastInbound: 0, unread: 0, msgs: [], createdAt: Date.now() }; setConvs((p) => [c, ...p]); }
      setActiveId(c.id);
    },

    saveTemplate: (t) => setTemplates((p) => (t.id ? p.map((x) => (x.id === t.id ? t : x)) : [...p, { ...t, id: ++nid }])),
    removeTemplate: (id) => setTemplates((p) => p.filter((t) => t.id !== id)),
    saveSettings: (s) => { setSettings(s); setToast('Pengaturan disimpan'); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
