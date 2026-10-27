'use client';
import { useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, CircularProgress, Dialog, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  BrokenImageOutlined, Close, Download, InsertDriveFileOutlined, OpenInNew, PictureAsPdfOutlined, SlideshowOutlined,
  TableChartOutlined, TextSnippetOutlined,
} from '@mui/icons-material';
import { apiBlob } from '@/lib/api';
import { C } from '@/lib/data';

// ---- Aturan file WhatsApp (sama dengan backend) ----
const MB = 1024 * 1024;
export const MEDIA_RULES = {
  image: { types: ['image/jpeg', 'image/png'], ext: ['jpg', 'jpeg', 'png'], max: 5 * MB, label: 'gambar' },
  video: { types: ['video/mp4', 'video/3gpp'], ext: ['mp4', '3gp'], max: 16 * MB, label: 'video' },
  audio: { types: ['audio/aac', 'audio/amr', 'audio/mpeg', 'audio/mp4', 'audio/ogg'], ext: ['aac', 'amr', 'mp3', 'm4a', 'ogg'], max: 16 * MB, label: 'audio' },
  document: {
    types: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    ext: ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'], max: 100 * MB, label: 'dokumen',
  },
};
export const ACCEPT = Object.values(MEDIA_RULES).flatMap((r) => [...r.types, ...r.ext.map((e) => `.${e}`)]).join(',');
const extOf = (name) => (String(name || '').split('.').pop() || '').toLowerCase();

export function kindOf(file) {
  const mime = (file?.type || '').toLowerCase();
  const ext = extOf(file?.name);
  return Object.keys(MEDIA_RULES).find((k) => MEDIA_RULES[k].types.includes(mime))
    || Object.keys(MEDIA_RULES).find((k) => MEDIA_RULES[k].ext.includes(ext)) || null;
}

// Pesan error yang jelas sebelum mengunggah (backend tetap memeriksa ulang)
export function checkFile(file) {
  const kind = kindOf(file);
  if (!kind) return { kind: null, error: 'Jenis file ini tidak didukung WhatsApp. Gunakan JPG/PNG, MP4, MP3/OGG, PDF, Word, Excel, PowerPoint, atau TXT.' };
  const r = MEDIA_RULES[kind];
  if (file.size > r.max) return { kind, error: `File terlalu besar (${fmtSize(file.size)}). Batas WhatsApp untuk ${r.label} adalah ${r.max / MB} MB.` };
  return { kind, error: '' };
}

export const fmtSize = (n) => (!n ? '' : n < 1024 ? `${n} B` : n < MB ? `${Math.round(n / 1024)} KB` : `${(n / MB).toFixed(n < 10 * MB ? 1 : 0)} MB`);

// ---- Ambil file lewat backend (pakai token) dan simpan sebagai object URL selama sesi ----
const cache = new Map(); // messageId -> Promise<string>
export function mediaUrl(id) {
  if (!cache.has(id)) {
    const p = apiBlob(`/media/${id}/`).then((b) => URL.createObjectURL(b));
    p.catch(() => cache.delete(id)); // gagal: boleh dicoba lagi nanti
    cache.set(id, p);
  }
  return cache.get(id);
}

// Muat hanya saat gelembung terlihat di layar, agar chat panjang tidak mengunduh semua file sekaligus
function useLazyMedia(id, enabled) {
  const ref = useRef(null);
  const [st, setSt] = useState({ url: '', error: '', loading: false });
  useEffect(() => {
    if (!enabled || !id) return undefined;
    let alive = true;
    const load = () => {
      setSt((s) => ({ ...s, loading: true }));
      mediaUrl(id).then((url) => alive && setSt({ url, error: '', loading: false }))
        .catch((e) => alive && setSt({ url: '', error: e.message || 'Gagal memuat', loading: false }));
    };
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { load(); return () => { alive = false; }; }
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '300px' });
    io.observe(el);
    return () => { alive = false; io.disconnect(); };
  }, [id, enabled]);
  return [ref, st];
}

function Unavailable({ text }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1.4, py: 1.2, borderRadius: '10px', bgcolor: 'rgba(14,42,43,.05)', color: C.muted, maxWidth: 280 }}>
      <BrokenImageOutlined sx={{ fontSize: 20 }} />
      <Typography fontSize={12.5}>{text}</Typography>
    </Stack>
  );
}

const DOC_ICON = { pdf: [PictureAsPdfOutlined, '#C53929'], xls: [TableChartOutlined, '#1D7A45'], xlsx: [TableChartOutlined, '#1D7A45'],
  ppt: [SlideshowOutlined, '#C2560C'], pptx: [SlideshowOutlined, '#C2560C'], doc: [TextSnippetOutlined, '#2F6FDB'], docx: [TextSnippetOutlined, '#2F6FDB'],
  txt: [TextSnippetOutlined, C.muted] };

async function download(id, filename) {
  const url = await mediaUrl(id);
  const a = document.createElement('a');
  a.href = url; a.download = filename || ''; document.body.appendChild(a); a.click(); a.remove();
}

export function DocumentCard({ name, size, mime, onDownload, onOpen, busy }) {
  const ext = extOf(name) || (mime?.includes('pdf') ? 'pdf' : '');
  const [Icon, color] = DOC_ICON[ext] || [InsertDriveFileOutlined, C.muted];
  return (
    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ p: 1.2, pr: .6, borderRadius: '10px', bgcolor: 'rgba(14,42,43,.05)', width: { xs: 240, sm: 280 }, maxWidth: '100%' }}>
      <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: `${color}1A`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon sx={{ color }} /></Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontSize={13.5} fontWeight={600} noWrap title={name}>{name || 'Dokumen'}</Typography>
        <Typography fontSize={12} color={C.muted}>{[ext.toUpperCase(), fmtSize(size)].filter(Boolean).join(', ')}</Typography>
      </Box>
      {busy ? <CircularProgress size={20} sx={{ mx: 1 }} /> : (
        <>
          {onOpen && <Tooltip title="Buka di tab baru"><IconButton size="small" aria-label="Buka dokumen" onClick={onOpen}><OpenInNew fontSize="small" /></IconButton></Tooltip>}
          {onDownload && <Tooltip title="Unduh"><IconButton size="small" aria-label="Unduh dokumen" onClick={onDownload}><Download fontSize="small" /></IconButton></Tooltip>}
        </>
      )}
    </Stack>
  );
}

function DocumentMedia({ m }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const run = (fn) => async () => { setBusy(true); setErr(''); try { await fn(); } catch (e) { setErr(e.message); } setBusy(false); };
  const open = async () => { const w = window.open('', '_blank'); const url = await mediaUrl(m.id); if (w) w.location.href = url; };
  if (err) return <Unavailable text={err} />;
  return <DocumentCard name={m.filename} size={m.size} mime={m.mime} busy={busy}
    onDownload={run(() => download(m.id, m.filename))}
    onOpen={(m.mime === 'application/pdf' || extOf(m.filename) === 'pdf') ? run(open) : undefined} />;
}

// Isi media sebuah gelembung chat. onOpenImage(url, m) membuka lightbox.
export function MediaContent({ m, onOpenImage }) {
  const visual = ['image', 'sticker', 'video', 'audio'].includes(m.type);
  const [ref, st] = useLazyMedia(m.id, m.hasMedia && visual);

  if (!m.hasMedia) {
    if (m.type === 'media_placeholder' || /^\[(image|video|audio|document|sticker|media)\]$/.test(m.text || '')) {
      return <Unavailable text="File dari riwayat lama tidak tersedia." />;
    }
    return null;
  }
  if (m.type === 'document') return <DocumentMedia m={m} />;

  const box = { width: m.type === 'sticker' ? 140 : { xs: 220, sm: 280 }, maxWidth: '100%' };
  if (st.error) return <Unavailable text={st.error} />;
  if (!st.url) {
    return (
      <Box ref={ref} sx={{ ...box, height: m.type === 'audio' ? 54 : m.type === 'sticker' ? 140 : 180, borderRadius: '10px', bgcolor: 'rgba(14,42,43,.06)', display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={22} sx={{ color: C.muted }} />
      </Box>
    );
  }
  if (m.type === 'image' || m.type === 'sticker') {
    return (
      <ButtonBase onClick={() => onOpenImage?.(st.url, m)} aria-label="Perbesar foto" sx={{ ...box, borderRadius: '10px', overflow: 'hidden', display: 'block' }}>
        <Box component="img" src={st.url} alt={m.text && !/^\[/.test(m.text) ? m.text : 'Foto'} sx={{ display: 'block', width: '100%', maxHeight: 340, objectFit: 'cover', bgcolor: m.type === 'sticker' ? 'transparent' : '#E5ECE9' }} />
      </ButtonBase>
    );
  }
  if (m.type === 'video') return <Box component="video" src={st.url} controls preload="metadata" sx={{ ...box, display: 'block', borderRadius: '10px', bgcolor: '#000', maxHeight: 360 }} />;
  return <Box component="audio" src={st.url} controls preload="metadata" sx={{ width: { xs: 220, sm: 280 }, maxWidth: '100%', display: 'block' }} />;
}

export function Lightbox({ open, url, m, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullScreen slotProps={{ paper: { sx: { bgcolor: 'rgba(8,20,20,.94)', borderRadius: 0 } } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.5, color: '#fff' }}>
        <Typography sx={{ flex: 1, fontSize: 14 }} noWrap>{m?.text && !/^\[/.test(m.text) ? m.text : ''}</Typography>
        {m && <Tooltip title="Unduh"><IconButton aria-label="Unduh foto" onClick={() => download(m.id, m.filename || `foto-${m.id}.jpg`)} sx={{ color: '#fff' }}><Download /></IconButton></Tooltip>}
        <Tooltip title="Tutup (Esc)"><IconButton aria-label="Tutup" onClick={onClose} sx={{ color: '#fff' }}><Close /></IconButton></Tooltip>
      </Stack>
      <Box onClick={onClose} sx={{ flex: 1, display: 'grid', placeItems: 'center', p: 2, minHeight: 0 }}>
        {url && <Box component="img" src={url} alt="" onClick={(e) => e.stopPropagation()} sx={{ maxWidth: '100%', maxHeight: 'calc(100dvh - 100px)', objectFit: 'contain', borderRadius: '6px' }} />}
      </Box>
    </Dialog>
  );
}
