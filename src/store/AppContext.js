'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api, apiUpload, getToken, list, setToken } from '@/lib/api';
import { mapConv, mapMsg, mapOutlet } from '@/lib/mappers';
import LoginForm from '@/components/LoginForm';
import { launchEmbeddedSignup } from '@/lib/embeddedSignup';
import { desktopNotify, startRealtime } from '@/lib/realtime';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const POLL_MS = 5000;        // tanpa koneksi realtime: cek tiap 5 detik
const POLL_LIVE_MS = 60000;  // realtime tersambung: polling hanya jaring pengaman
const MANAGED = 'Dikelola dari Django admin / Meta (belum ada endpoint di BE).';
const STAFF_ONLY = 'Hanya admin (staf) yang bisa mengelola outlet.';

// updated_at terbaru (dibandingkan sebagai waktu, bukan string)
// bunyi singkat tanpa file audio
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 880; g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.35);
    o.onended = () => ctx.close();
  } catch { /* browser memblokir audio sebelum ada interaksi */ }
}

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
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState({}); // catatan internal: belum ada di BE, hanya di memori browser

  const outletIdx = useRef({});
  const since = useRef(null); // updated_at terbaru dari server, untuk ?updated_after=
  const activeRef = useRef(null);
  const convsRef = useRef([]);
  // profil & preferensi dari BE (/me/); settings dipertahankan agar komponen lama tetap jalan
  const settings = useMemo(() => ({
    name: user?.name || '', email: user?.email || '', role: user?.role || '',
    notif: user?.preferences?.notif ?? true, sound: user?.preferences?.sound ?? true,
  }), [user]);
  const settingsRef = useRef(settings);
  const outletsRef = useRef([]);
  const openRef = useRef(() => {});
  const [live, setLive] = useState('connecting'); // connecting | live | offline
  activeRef.current = activeId;
  outletsRef.current = outlets;
  convsRef.current = convs;
  settingsRef.current = settings;


  const mergeConvs = useCallback((rows, announce = false) => {
    const fresh = rows.map((r) => mapConv(r, outletIdx.current)).filter((c) => c.outlet !== undefined);
    if (announce && settingsRef.current.notif) {
      const prev = new Map(convsRef.current.map((c) => [c.id, c]));
      const hit = fresh.find((n) => n.id !== activeRef.current && n.unread > (prev.get(n.id)?.unread ?? 0));
      if (hit) {
        const outletName = outletsRef.current[hit.outlet]?.name;
        // tab tidak sedang dilihat -> notifikasi desktop; tab dilihat -> toast di halaman
        if (typeof document !== 'undefined' && document.hidden) {
          desktopNotify({
            title: outletName ? `${hit.name} · ${outletName}` : hit.name,
            body: hit.msgs[hit.msgs.length - 1]?.text || 'Pesan baru',
            tag: `conv-${hit.id}`,
            onClick: () => openRef.current(hit.id),
          });
        } else {
          setToast(`Pesan baru dari ${hit.name}`);
        }
        if (settingsRef.current.sound) beep();
      }
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

  // Muat ulang outlet; index outlet bisa bergeser (urut nama), jadi percakapan dipetakan ulang lewat outletId
  const reloadOutlets = useCallback(async () => {
    const outs = list(await api('/outlets/')).map(mapOutlet);
    outletIdx.current = Object.fromEntries(outs.map((o, i) => [o.id, i]));
    setOutlets(outs);
    setConvs((cs) => cs.map((c) => ({ ...c, outlet: outletIdx.current[c.outletId] })).filter((c) => c.outlet !== undefined));
    return outs;
  }, []);

  // Ambil percakapan yang berubah sejak update terakhir (+ pesan chat yang sedang dibuka)
  const busy = useRef(false);
  const again = useRef(false);
  const refreshRef = useRef(() => {});
  const refresh = useCallback(async () => {
    if (busy.current) { again.current = true; return; } // event beruntun: gabungkan jadi satu putaran lagi
    busy.current = true;
    try {
      const rows = await api('/conversations/', { params: { updated_after: since.current } });
      if (rows.length) { since.current = newest(rows, since.current); mergeConvs(rows, true); }
      if (activeRef.current) await loadMsgs(activeRef.current); // pesan baru & status centang
    } catch { /* coba lagi di tick berikutnya */ } finally {
      busy.current = false;
      if (again.current) { again.current = false; setTimeout(() => refreshRef.current(), 0); }
    }
  }, [mergeConvs, loadMsgs]);

  // keluar lokal saja (dipakai juga saat token ditolak server / 401)
  const logout = useCallback(() => {
    setToken(null); setAuthed(false); setReady(false); setConvs([]); setActiveId(null);
    setUser(null); setOutlets([]); setRawContacts([]); setTemplates([]); setNotes({});
    since.current = null; outletIdx.current = {};
  }, []);

  // tombol Keluar: hapus token di server dulu, lalu keluar lokal
  const signOut = useCallback(async () => {
    try { await api('/auth/logout/', { method: 'POST' }); } catch { /* token mungkin sudah tidak berlaku */ }
    logout();
  }, [logout]);

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
    // realtime tersambung: polling jarang (jaring pengaman); terputus: polling 5 detik seperti dulu
    const ms = live === 'live' ? POLL_LIVE_MS : POLL_MS;
    const t = setInterval(() => { if (live === 'live' || !document.hidden) refresh(); }, ms);
    return () => clearInterval(t);
  }, [authed, ready, refresh, live]);

  // Realtime (SSE): backend mengabari begitu ada pesan/status baru -> ambil perubahan saat itu juga
  refreshRef.current = refresh;
  const liveRef = useRef('connecting');
  useEffect(() => {
    if (!authed || !ready) return undefined;
    let t;
    liveRef.current = 'connecting';
    setLive('connecting');
    const stop = startRealtime({
      onStatus: (st) => {
        if (st === 'live' && liveRef.current !== 'live') refreshRef.current(); // susul perubahan selama terputus
        liveRef.current = st;
        setLive(st);
      },
      onEvent: (ev) => {
        if (ev.event !== 'change') return;
        clearTimeout(t);
        t = setTimeout(() => refreshRef.current(), 150); // gabungkan event yang datang bersamaan
      },
    });
    return () => { stop(); clearTimeout(t); };
  }, [authed, ready]);

  // jumlah belum dibaca di judul tab
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const base = process.env.NEXT_PUBLIC_APP_NAME || 'Multi Outlet';
    const n = convs.reduce((a, c) => a + c.unread, 0);
    document.title = n ? `(${n}) ${base}` : base;
  }, [convs]);

  const openConv = useCallback((id) => {
    setActiveId(id);
    setConvs((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    loadMsgs(id).catch(() => {});
  }, [loadMsgs]);
  openRef.current = openConv;

  // tutup jendela percakapan (tombol X / Esc / kembali di HP)
  const closeConv = useCallback(() => setActiveId(null), []);

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

  // kirim file (gambar/video/audio/dokumen) + caption; onProgress(0..1) untuk bilah progres unggah
  const sendMedia = useCallback(async (convId, file, caption, onProgress) => {
    const fd = new FormData();
    fd.append('file', file, file.name);
    if (caption) fd.append('caption', caption);
    try {
      const m = await apiUpload(`/conversations/${convId}/media/`, fd, onProgress);
      setConvs((cs) => cs.map((c) => (c.id === convId ? { ...c, msgs: [...c.msgs, mapMsg(m)] } : c)));
      return true;
    } catch (e) {
      setToast(e.message);
      loadMsgs(convId).catch(() => {});
      return false;
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
    live,
    notify: setToast, clearToast: () => setToast(null), logout: signOut,
    reset: async () => { await boot(); setToast('Data dimuat ulang dari server'); },

    setActiveId: openConv,
    openConv,
    closeConv,
    send,
    sendMedia,
    note,
    simulateIncoming: refresh, // tidak ada lagi pesan palsu; tombol ini kini hanya memuat ulang

    // ---- Outlet (tulis: khusus staf) ----
    reloadOutlets,
    toggleOutlet: async (index) => {
      const o = outlets[index];
      if (!o) return;
      if (!user?.is_staff) { setToast(STAFF_ONLY); return; }
      try {
        await api(`/outlets/${o.id}/`, { method: 'PATCH', body: { is_active: !o.online } });
        await reloadOutlets();
      } catch (e) { setToast(e.message); }
    },
    // Tambah manual: bila phone_number_id sudah diketahui (nomor di WABA milik sendiri / token .env)
    addOutlet: async (v) => {
      if (!user?.is_staff) { setToast(STAFF_ONLY); return false; }
      try {
        await api('/outlets/', { method: 'POST', body: {
          name: v.name, city: v.city || '', display_number: v.phone, phone_number_id: String(v.phoneNumberId || '').trim(),
        } });
        await reloadOutlets();
        setToast(`${v.name} ditambahkan`);
        return true;
      } catch (e) { setToast(e.message); return false; }
    },
    updateOutlet: async (index, patch) => {
      const o = outlets[index];
      try { await api(`/outlets/${o.id}/`, { method: 'PATCH', body: patch }); await reloadOutlets(); return true; }
      catch (e) { setToast(e.message); return false; }
    },
    // Embedded Signup: buka popup Meta -> kirim code + ID ke BE -> outlet dibuat/diikat
    // opts: { outletIndex?: number, name?: string, city?: string }
    connectWhatsApp: async (opts = {}) => {
      if (!user?.is_staff) { setToast(STAFF_ONLY); return null; }
      let s;
      try { s = await launchEmbeddedSignup(); }
      catch (e) { setToast(e.message); return null; }
      const target = opts.outletIndex != null && opts.outletIndex !== '' ? outlets[Number(opts.outletIndex)] : null;
      try {
        const res = await api('/outlets/embedded-signup/', { method: 'POST', body: {
          ...s, outlet: target?.id ?? null, name: opts.name || '', city: opts.city || '',
        } });
        await reloadOutlets();
        setTemplates(list(await api('/templates/')));
        const o = res.outlet;
        const mode = o.mode === 'coexist' ? 'aktif di HP & dashboard' : 'aktif di dashboard';
        setToast(res.warnings?.length ? `${o.name} terhubung (${mode}). Catatan: ${res.warnings.join(' | ')}` : `${o.name} terhubung, ${mode}`);
        return res;
      } catch (e) { setToast(e.message); return null; }
    },
    retrySync: async (index) => {
      try {
        await api(`/outlets/${outlets[index].id}/sync/`, { method: 'POST' });
        await reloadOutlets();
        setToast('Permintaan sinkron kontak & riwayat dikirim ke Meta');
      } catch (e) { setToast(e.message); }
    },

    saveTemplate: async (t) => {
      if (t.id) { setToast('Template yang sudah diajukan tidak bisa diubah. Buat baru dengan nama lain.'); return false; }
      const slug = t.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      try {
        await api('/templates/', {
          method: 'POST',
          body: { name: slug, language: 'id', category: (t.category || 'UTILITY').toUpperCase(), body: t.body, outlet: t.outlet ?? null },
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

    // ---- Akun ----
    saveProfile: async ({ name, email }) => {
      try { setUser(await api('/me/', { method: 'PATCH', body: { name, email } })); setToast('Profil disimpan'); return true; }
      catch (e) { setToast(e.message); return false; }
    },
    savePreferences: async (prefs) => {
      try { setUser(await api('/me/', { method: 'PATCH', body: { preferences: prefs } })); setToast('Preferensi disimpan'); return true; }
      catch (e) { setToast(e.message); return false; }
    },
    changePassword: async (oldPassword, newPassword) => {
      try {
        const { token } = await api('/me/password/', { method: 'POST', body: { old_password: oldPassword, new_password: newPassword } });
        setToken(token); // token lama dicabut server; perangkat lain harus login ulang
        setToast('Password diganti. Perangkat lain perlu login ulang.');
        return true;
      } catch (e) { setToast(e.message); return false; }
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
