'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_SETTINGS } from '@/lib/data';
import { api, getToken, list, setToken } from '@/lib/api';
import { mapConv, mapMsg, mapOutlet } from '@/lib/mappers';
import LoginForm from '@/components/LoginForm';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const POLL_MS = 5000;
const SETTINGS_KEY = 'wa_settings';
const MANAGED = 'Dikelola dari Django admin / Meta (belum ada endpoint di BE).';

// updated_at terbaru (dibandingkan sebagai waktu, bukan string)
const newest = (rows, cur) =>
  rows.reduce((m, r) => (!m || Date.parse(r.updated_at) > Date.parse(m) ? r.updated_at : m), cur);

export function AppProvider({ children }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(null); // null = sedang cek token
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [convs, setConvs] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [rawContacts, setRawContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState({}); // catatan internal: belum ada di BE, hanya di memori browser

  const outletIdx = useRef({});
  const since = useRef(null); // updated_at terbaru dari server, untuk ?updated_after=
  const activeRef = useRef(null);
  const convsRef = useRef([]);
  const settingsRef = useRef(settings);
  activeRef.current = activeId;
  convsRef.current = convs;
  settingsRef.current = settings;

  // Pengaturan belum ada di BE: simpan di localStorage (dibaca setelah mount agar server/klien sama)
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY)); if (s) setSettings({ ...DEFAULT_SETTINGS, ...s }); } catch { /* abaikan */ }
  }, []);

  const mergeConvs = useCallback((rows, announce = false) => {
    const fresh = rows.map((r) => mapConv(r, outletIdx.current)).filter((c) => c.outlet !== undefined);
    if (announce && settingsRef.current.notif) {
      const prev = new Map(convsRef.current.map((c) => [c.id, c]));
      const hit = fresh.find((n) => n.id !== activeRef.current && n.unread > (prev.get(n.id)?.unread ?? 0));
      if (hit) setToast(`Pesan baru dari ${hit.name}`);
    }
    setConvs((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]));
      for (const n of fresh) {
        const old = byId.get(n.id);
        // chat yang sedang dibuka mempertahankan pesan lengkapnya; yang lain kembali ke preview
        byId.set(n.id, n.id === activeRef.current && old?.loaded
          ? { ...n, loaded: true, msgs: old.msgs, unread: 0 } : n);
      }
      return [...byId.values()];
    });
  }, []);

  // GET messages = BE menandai percakapan terbaca
  const loadMsgs = useCallback(async (id) => {
    const data = await api(`/conversations/${id}/messages/`);
    setConvs((cs) => cs.map((c) => (c.id === id ? { ...c, loaded: true, unread: 0, msgs: data.map(mapMsg) } : c)));
  }, []);

  const boot = useCallback(async () => {
    const [me, os, cs, ts, ct] = await Promise.all([
      api('/me/'), api('/outlets/'), api('/conversations/'), api('/templates/'), api('/contacts/'),
    ]);
    const outs = list(os).map(mapOutlet);
    outletIdx.current = Object.fromEntries(outs.map((o, i) => [o.id, i]));
    since.current = newest(cs, null);
    setUser(me); setOutlets(outs); setTemplates(list(ts)); setRawContacts(list(ct));
    mergeConvs(cs);
    setReady(true);
  }, [mergeConvs]);

  // Ambil percakapan yang berubah sejak update terakhir (+ pesan chat yang sedang dibuka)
  const refresh = useCallback(async () => {
    try {
      const rows = await api('/conversations/', { params: { updated_after: since.current } });
      if (rows.length) { since.current = newest(rows, since.current); mergeConvs(rows, true); }
      if (activeRef.current) await loadMsgs(activeRef.current); // pesan baru & status centang
    } catch { /* coba lagi di tick berikutnya */ }
  }, [mergeConvs, loadMsgs]);

  const logout = useCallback(() => {
    setToken(null); setAuthed(false); setReady(false); setConvs([]); setActiveId(null);
  }, []);

  const login = async (username, password) => {
    const { token } = await api('/auth/login/', { method: 'POST', body: { username, password } });
    setToken(token);
    await boot();
    setAuthed(true);
  };

  useEffect(() => {
    if (pathname === '/privacy-policy') {
      setAuthed(false);
      setReady(true);
      return;
    }

    if (!getToken()) {
      setAuthed(false);
      return;
    }

    boot()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, [pathname, boot]);

  useEffect(() => {
    window.addEventListener('wa-logout', logout);
    return () => window.removeEventListener('wa-logout', logout);
  }, [logout]);

  useEffect(() => {
    if (!authed || !ready) return;
    const t = setInterval(() => { if (!document.hidden) refresh(); }, POLL_MS);
    return () => clearInterval(t);
  }, [authed, ready, refresh]);

  const openConv = useCallback((id) => {
    setActiveId(id);
    setConvs((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    loadMsgs(id).catch(() => {});
  }, [loadMsgs]);

  // send(convId, 'teks') -> teks (hanya saat jendela 24 jam aktif) | send(convId, null, templateId) -> template
  const send = useCallback(async (convId, text, templateId) => {
    try {
      const m = await api(`/conversations/${convId}/messages/`, {
        method: 'POST', body: templateId ? { template: templateId } : { text },
      });
      setConvs((cs) => cs.map((c) => (c.id === convId ? { ...c, msgs: [...c.msgs, mapMsg(m)] } : c)));
    } catch (e) {
      setToast(e.message);
      loadMsgs(convId).catch(() => {}); // BE mencatat pesan gagal; tampilkan
    }
  }, [loadMsgs]);

  // get-or-create kontak + percakapan di outlet tsb (satu panggilan ke BE)
  const startConv = useCallback(async (outletIndex, phone, name = '') => {
    const c = await api('/conversations/', {
      method: 'POST', body: { outlet: outlets[Number(outletIndex)].id, wa_id: phone, name },
    });
    mergeConvs([c]);
    return c;
  }, [outlets, mergeConvs]);

  const note = useCallback((convId, text) =>
    setNotes((n) => ({ ...n, [convId]: [...(n[convId] || []), { dir: 'note', text, at: Date.now() }] })), []);

  const convsView = useMemo(() => convs.map((c) => (notes[c.id] && c.loaded
    ? { ...c, msgs: [...c.msgs, ...notes[c.id]].sort((a, b) => a.at - b.at) } : c)), [convs, notes]);

  // BE hanya mendaftar kontak yang sudah punya percakapan; outlet diambil dari percakapan tsb
  const contacts = useMemo(() => rawContacts.map((c) => ({
    id: c.id, name: c.name || c.wa_id, phone: `+${c.wa_id}`,
    outlet: convs.find((v) => v.waId === c.wa_id)?.outlet ?? 0,
  })), [rawContacts, convs]);

  const value = {
    ready, user, convs: convsView, outlets, contacts, templates, settings, activeId, query, setQuery, toast,
    totalUnread: convs.reduce((a, c) => a + c.unread, 0),
    notify: setToast, clearToast: () => setToast(null), logout,
    reset: async () => { await boot(); setToast('Data dimuat ulang dari server'); },

    setActiveId: openConv,
    openConv,
    send,
    note,
    simulateIncoming: refresh, // tidak ada lagi pesan palsu; tombol ini kini hanya memuat ulang

    // Outlet & template dikelola di luar aplikasi ini (BE read-only)
    toggleOutlet: () => setToast(`Status outlet: ${MANAGED}`),
    addOutlet: () => setToast(`Outlet: ${MANAGED}`),
    saveTemplate: async (t) => {
      if (t.id) { setToast('Template yang sudah diajukan tidak bisa diubah. Buat baru dengan nama lain.'); return false; }
      const slug = t.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      try {
        await api('/templates/', {
          method: 'POST',
          body: { name: slug, language: 'id', category: (t.category || 'UTILITY').toUpperCase(), body: t.body },
        });
        setTemplates(list(await api('/templates/')));
        setToast('Template dikirim ke Meta, menunggu persetujuan');
        return true;
      } catch (e) { setToast(e.message); return false; }
    },
    removeTemplate: () => setToast(`Template: ${MANAGED}`),
    syncTemplates: async () => {
      try {
        await api('/templates/sync/', { method: 'POST' }); // admin saja
        setTemplates(list(await api('/templates/')));
        setToast('Template disinkronkan dari Meta');
      } catch (e) { setToast(e.message); }
    },

    addContact: async (c) => {
      try {
        await startConv(c.outlet, c.phone, c.name);
        setRawContacts(list(await api('/contacts/')));
        setToast('Kontak ditambahkan');
      } catch (e) { setToast(e.message); }
    },
    removeContact: async (id) => {
      try {
        await api(`/contacts/${id}/`, { method: 'DELETE' }); // admin saja
        setRawContacts((p) => p.filter((c) => c.id !== id));
      } catch (e) { setToast(e.message); }
    },
    startChat: async (ct) => {
      try { const c = await startConv(ct.outlet, ct.phone, ct.name); openConv(c.id); }
      catch (e) { setToast(e.message); }
    },

    saveSettings: (s) => {
      setSettings(s);
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* abaikan */ }
      setToast('Pengaturan disimpan');
    },
  };

  if (pathname === '/privacy-policy') {
    return (
      <Ctx.Provider value={value}>
        {children}
      </Ctx.Provider>
    );
  }

  if (authed === null) return null;

  if (!authed) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}
