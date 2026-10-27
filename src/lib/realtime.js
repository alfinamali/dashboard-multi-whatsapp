// Klien Server-Sent Events untuk /api/events/.
// Memakai fetch + ReadableStream (bukan EventSource) supaya token dikirim lewat header Authorization,
// tidak lewat URL yang bisa tercatat di log server.
import { BASE, getToken } from '@/lib/api';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parse(block) {
  let event = 'message';
  const data = [];
  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) continue; // komentar = ping
    const i = line.indexOf(':');
    const k = i < 0 ? line : line.slice(0, i);
    const v = i < 0 ? '' : line.slice(i + 1).replace(/^ /, '');
    if (k === 'event') event = v;
    else if (k === 'data') data.push(v);
  }
  if (!data.length) return null;
  try { return { event, data: JSON.parse(data.join('\n')) }; } catch { return { event, data: data.join('\n') }; }
}

// onEvent({event, data}) dipanggil untuk tiap event; onStatus('connecting'|'live'|'offline', mode?)
// Mengembalikan fungsi untuk menghentikan koneksi.
export function startRealtime({ onEvent, onStatus }) {
  let stopped = false;
  let ctrl = null;
  let backoff = 1000;

  (async () => {
    while (!stopped) {
      ctrl = new AbortController();
      try {
        const res = await fetch(`${BASE}/events/`, {
          headers: { Authorization: `Token ${getToken()}`, Accept: 'text/event-stream' },
          cache: 'no-store',
          signal: ctrl.signal,
        });
        if (res.status === 401) { window.dispatchEvent(new Event('wa-logout')); return; }
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true }).replace(/\r\n/g, '\n');
          let i;
          while ((i = buf.indexOf('\n\n')) >= 0) {
            const ev = parse(buf.slice(0, i));
            buf = buf.slice(i + 2);
            if (!ev) continue;
            if (ev.event === 'hello') { backoff = 1000; onStatus?.('live', ev.data?.mode); } else onEvent?.(ev);
          }
        }
        // server menutup stream secara normal (umur koneksi habis): sambung lagi segera
      } catch (e) {
        if (stopped || e?.name === 'AbortError') return;
        onStatus?.('offline');
        await sleep(backoff);
        backoff = Math.min(backoff * 2, 30000);
      }
    }
  })();

  return () => { stopped = true; ctrl?.abort(); };
}

// ---- Notifikasi desktop (Notification API) ----
export const notifySupported = () => typeof window !== 'undefined' && 'Notification' in window;
export const notifyPermission = () => (notifySupported() ? Notification.permission : 'unsupported');
export const requestNotify = async () => (notifySupported() ? Notification.requestPermission() : 'unsupported');

export function desktopNotify({ title, body, tag, onClick }) {
  if (notifyPermission() !== 'granted') return;
  try {
    const n = new Notification(title, { body, tag, icon: '/favicon.ico', renotify: true });
    n.onclick = () => { window.focus(); onClick?.(); n.close(); };
  } catch { /* beberapa browser HP hanya mendukung lewat service worker */ }
}
