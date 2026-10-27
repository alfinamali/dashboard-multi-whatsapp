'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputBase, LinearProgress, List,
  ListItemButton, ListItemText, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import {
  ArrowBack, AttachFile, Check, Close, CloudUploadOutlined, DescriptionOutlined, DoneAll, DoneAllOutlined, ErrorOutline,
  ForumOutlined, NoteAddOutlined, PhoneIphone, Schedule, Send,
} from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, DAY, hhmm, initials, outletColor } from '@/lib/data';
import { ACCEPT, DocumentCard, Lightbox, MediaContent, checkFile, fmtSize } from '@/components/chat/Media';

const dayLabel = (t) => {
  const d = new Date(t), now = new Date();
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(now) - start(d)) / DAY);
  if (diff <= 0) return 'Hari ini';
  if (diff === 1) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
};

const SOURCE = { phone: 'Dikirim dari HP', history: 'Riwayat dari HP', auto: 'Balasan otomatis' };

function Status({ m }) {
  if (m.status === 'failed') return <Tooltip title={m.error || 'Gagal terkirim'}><ErrorOutline sx={{ fontSize: 15, color: '#B3261E' }} /></Tooltip>;
  if (m.status === 'queued') return <Schedule sx={{ fontSize: 14 }} />;
  if (m.status === 'read') return <DoneAll sx={{ fontSize: 16, color: C.blue }} />;
  if (m.status === 'delivered') return <DoneAllOutlined sx={{ fontSize: 16 }} />;
  return <Check sx={{ fontSize: 15 }} />;
}

// caption yang benar-benar ditulis (bukan "[image]" atau nama file dokumen)
const captionOf = (m) => {
  const t = m.text || '';
  if (/^\[(image|video|audio|document|sticker|media|media_placeholder)\]$/.test(t)) return '';
  if (m.type === 'document' && t === m.filename) return '';
  return t;
};

function Bubble({ m, onOpenImage }) {
  if (m.dir === 'note') {
    return (
      <Box sx={{ alignSelf: 'center', maxWidth: '85%', px: 1.6, py: .9, borderRadius: '10px', bgcolor: '#FFF4D6', border: '1px solid #F2DFA6', fontSize: 13 }}>
        <b>Catatan internal:</b> {m.text}
      </Box>
    );
  }
  const out = m.dir === 'out';
  const label = [m.template && 'Template', SOURCE[m.source]].filter(Boolean).join(' · ');
  const isMedia = m.hasMedia || m.type === 'media_placeholder' || captionOf(m) !== (m.text || '');
  const caption = isMedia ? captionOf(m) : m.text;
  return (
    <Box sx={{
      alignSelf: out ? 'flex-end' : 'flex-start', maxWidth: { xs: '86%', md: '72%' }, px: 1.6, pt: 1, pb: .6,
      borderRadius: out ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
      bgcolor: out ? C.bubbleOut : C.surface, border: out ? 'none' : `1px solid ${C.lineSoft}`,
      boxShadow: out ? 'none' : '0 1px 1px rgba(14,42,43,.04)',
    }}>
      {label && (
        <Stack direction="row" alignItems="center" spacing={.5} sx={{ mb: .3, color: m.source === 'phone' ? C.blue : C.greenDark }}>
          {m.source === 'phone' && <PhoneIphone sx={{ fontSize: 13 }} />}
          <Typography fontSize={11.5} fontWeight={600}>{label}</Typography>
        </Stack>
      )}
      {isMedia && <Box sx={{ mt: label ? .3 : 0, mb: caption ? .8 : .2 }}><MediaContent m={m} onOpenImage={onOpenImage} /></Box>}
      {caption && <Typography fontSize={14} lineHeight={1.55} sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{caption}</Typography>}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={.5} sx={{ color: C.muted, mt: .2 }}>
        {out && m.by && <Typography fontSize={11}>{m.by}</Typography>}
        <Typography fontSize={11}>{hhmm(m.at)}</Typography>
        {out && <Status m={m} />}
      </Stack>
    </Box>
  );
}

function Empty() {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ height: '100%', bgcolor: C.chatBg, px: 4, textAlign: 'center' }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '20px', bgcolor: C.greenSoft, display: 'grid', placeItems: 'center' }}>
        <ForumOutlined sx={{ fontSize: 30, color: C.green }} />
      </Box>
      <Typography fontWeight={600} fontSize={16}>Pilih percakapan</Typography>
      <Typography fontSize={13.5} color={C.muted} sx={{ maxWidth: 340 }}>
        Klik salah satu chat di sebelah kiri untuk membaca dan membalas. Tekan Esc untuk menutup percakapan.
      </Typography>
    </Stack>
  );
}

export default function ChatPanel({ conv, onClose, mobile }) {
  const { outlets, templates, send, sendMedia, note, openConv } = useApp();
  const [text, setText] = useState('');
  const [pickOpen, setPickOpen] = useState(false);
  const [pickId, setPickId] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [pending, setPending] = useState(null); // { file, kind, error, url }
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(null); // null | 0..1 saat mengunggah
  const [dragging, setDragging] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { url, m }
  const end = useRef(null);
  const input = useRef(null);
  const fileInput = useRef(null);

  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [conv?.id, conv?.msgs.length]);
  useEffect(() => { setText(''); if (!mobile) input.current?.focus(); }, [conv?.id, mobile]);
  useEffect(() => () => { if (pending?.url) URL.revokeObjectURL(pending.url); }, [pending]);

  if (!conv) return mobile ? null : <Empty />;

  const outlet = outlets[conv.outlet];
  const color = outletColor(conv.outlet);
  const open = Date.now() - conv.lastInbound < DAY;
  const hoursLeft = open ? Math.max(1, Math.ceil((conv.lastInbound + DAY - Date.now()) / 3600000)) : 0;
  // template milik WABA outlet ini saja (tiap nomor yang dihubungkan lewat Meta punya WABA sendiri)
  const approved = templates.filter((t) => t.status === 'approved' && (t.waba_id ?? '') === (outlet?.wabaId ?? ''));

  const sendText = () => { const b = text.trim(); if (b) { send(conv.id, b); setText(''); } };
  const sendTpl = (id) => { if (approved.some((t) => t.id === id)) send(conv.id, null, id); };
  const openPicker = () => { setPickId(approved[0]?.id ?? ''); setPickOpen(true); };
  const saveNote = () => { const t = noteText.trim(); if (t) note(conv.id, t); setNoteText(''); setNoteOpen(false); };

  // ---- lampiran ----
  const pick = (file) => {
    if (!file) return;
    if (!open) { setPending({ file, kind: null, error: 'Lewat 24 jam: file hanya bisa dikirim setelah pelanggan membalas.', url: '' }); return; }
    const { kind, error } = checkFile(file);
    const url = ['image', 'video', 'audio'].includes(kind) && !error ? URL.createObjectURL(file) : '';
    setCaption(kind === 'audio' ? '' : text.trim());
    setPending({ file, kind, error, url });
  };
  const closePending = () => { if (progress === null) { setPending(null); setCaption(''); } };
  const sendPending = async () => {
    if (!pending || pending.error || progress !== null) return;
    setProgress(0);
    const cap = pending.kind === 'audio' ? '' : caption.trim();
    const ok = await sendMedia(conv.id, pending.file, cap, setProgress);
    setProgress(null);
    if (ok) { if (cap && cap === text.trim()) setText(''); setPending(null); setCaption(''); }
  };
  const onDrop = (e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer?.files?.[0]); };
  const onPaste = (e) => { const f = e.clipboardData?.files?.[0]; if (f) { e.preventDefault(); pick(f); } };

  // kelompokkan pesan per hari
  const rows = [];
  let lastDay = '';
  conv.msgs.forEach((m, i) => {
    const d = m.at ? dayLabel(m.at) : '';
    if (d && d !== lastDay) { rows.push({ sep: d, key: `d${i}` }); lastDay = d; }
    rows.push({ m, key: m.id ?? `m${i}` });
  });

  return (
    <Box component="section" aria-label={`Percakapan dengan ${conv.name}`}
      onDragOver={(e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); setDragging(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
      onDrop={onDrop}
      sx={{ position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, height: '100%', bgcolor: C.chatBg }}>
      {dragging && (
        <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ position: 'absolute', inset: 8, zIndex: 5, borderRadius: '14px', border: `2px dashed ${C.green}`, bgcolor: 'rgba(227,242,234,.92)', pointerEvents: 'none' }}>
          <CloudUploadOutlined sx={{ fontSize: 40, color: C.green }} />
          <Typography fontWeight={600}>{open ? 'Lepaskan untuk mengirim file' : 'Lewat 24 jam: file belum bisa dikirim'}</Typography>
        </Stack>
      )}
      {/* header */}
      <Stack direction="row" alignItems="center" spacing={1.2} sx={{ flexShrink: 0, px: { xs: 1, sm: 2 }, height: 68, bgcolor: C.surface, borderBottom: `1px solid ${C.line}` }}>
        {mobile && <IconButton aria-label="Kembali ke daftar" onClick={onClose}><ArrowBack /></IconButton>}
        <Avatar sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 600, bgcolor: `${color}1F`, color }}>{initials(conv.name)}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} fontSize={15} noWrap>{conv.name}</Typography>
          <Stack direction="row" alignItems="center" spacing={.8} sx={{ minWidth: 0 }}>
            <Typography fontSize={12.5} color={C.muted} noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>{conv.phone}</Typography>
            {outlet && (
              <Stack direction="row" alignItems="center" spacing={.5} sx={{ minWidth: 0 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                <Typography fontSize={12.5} fontWeight={500} noWrap sx={{ color }}>{outlet.name}</Typography>
                {outlet.mode === 'coexist' && <Tooltip title="Nomor ini juga dipakai di aplikasi WhatsApp Business HP"><PhoneIphone sx={{ fontSize: 14, color: C.muted }} /></Tooltip>}
              </Stack>
            )}
          </Stack>
        </Box>
        <Box sx={{ display: { xs: 'none', xl: 'flex' }, alignItems: 'center', gap: .6, px: 1.2, height: 28, borderRadius: 14, fontSize: 12, fontWeight: 600, flexShrink: 0,
          bgcolor: open ? C.greenSoft : '#FDF1DC', color: open ? C.greenDark : C.amber }}>
          <Schedule sx={{ fontSize: 15 }} />{open ? `Bisa dibalas bebas ${hoursLeft} jam lagi` : 'Lewat 24 jam'}
        </Box>
        <Tooltip title="Catatan internal"><IconButton aria-label="Tambah catatan internal" onClick={() => setNoteOpen(true)}><NoteAddOutlined /></IconButton></Tooltip>
        <Tooltip title="Tandai sudah dibaca"><IconButton aria-label="Tandai sudah dibaca" onClick={() => openConv(conv.id)}><DoneAll /></IconButton></Tooltip>
        {!mobile && <Tooltip title="Tutup percakapan (Esc)"><IconButton aria-label="Tutup percakapan" onClick={onClose}><Close /></IconButton></Tooltip>}
      </Stack>

      {/* pesan */}
      <Stack spacing={1} sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: { xs: 1.5, md: 3 }, py: 2 }}>
        {!conv.loaded && !conv.msgs.length && <Typography fontSize={13} color={C.muted} textAlign="center">Memuat pesan…</Typography>}
        {rows.map((r) => (r.sep ? (
          <Box key={r.key} sx={{ alignSelf: 'center', px: 1.4, py: .4, my: .5, borderRadius: 8, bgcolor: C.surface, border: `1px solid ${C.lineSoft}`, fontSize: 12, fontWeight: 500, color: C.muted }}>{r.sep}</Box>
        ) : <Bubble key={r.key} m={r.m} onOpenImage={(url, m) => setLightbox({ url, m })} />))}
        <div ref={end} />
      </Stack>

      {/* kolom balasan */}
      <Box sx={{ flexShrink: 0, px: { xs: 1, md: 2 }, pt: 1.2, pb: 'max(12px, env(safe-area-inset-bottom))', bgcolor: C.surface, borderTop: `1px solid ${C.line}` }}>
        {open ? (
          <Stack direction="row" alignItems="flex-end" spacing={1}>
            <Tooltip title={approved.length ? 'Kirim template' : 'Belum ada template disetujui untuk outlet ini'}>
              <span><IconButton aria-label="Kirim template" disabled={!approved.length} onClick={openPicker}><DescriptionOutlined /></IconButton></span>
            </Tooltip>
            <Tooltip title="Lampirkan file (foto, video, audio, dokumen)">
              <IconButton aria-label="Lampirkan file" onClick={() => fileInput.current?.click()}><AttachFile /></IconButton>
            </Tooltip>
            <input ref={fileInput} type="file" accept={ACCEPT} hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
            <Box sx={{ flex: 1, minWidth: 0, bgcolor: C.page, borderRadius: '12px', px: 1.6, py: 1, border: '1px solid transparent', '&:focus-within': { borderColor: C.green, bgcolor: C.surface } }}>
              <InputBase inputRef={input} fullWidth multiline maxRows={6} placeholder="Tulis balasan…" value={text} sx={{ fontSize: 14.5 }}
                inputProps={{ 'aria-label': 'Tulis balasan' }}
                onChange={(e) => setText(e.target.value)} onPaste={onPaste}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); sendText(); } }} />
            </Box>
            <IconButton aria-label="Kirim" onClick={sendText} disabled={!text.trim()}
              sx={{ width: 44, height: 44, bgcolor: C.green, color: '#fff', '&:hover': { bgcolor: C.greenDark }, '&.Mui-disabled': { bgcolor: C.lineSoft, color: C.muted } }}>
              <Send sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1.2} sx={{ p: 1.4, borderRadius: '12px', bgcolor: '#FDF6E8', border: '1px solid #F1DDB0' }}>
            <Box sx={{ flex: 1 }}>
              <Typography fontSize={13.5} fontWeight={600}>
                {conv.lastInbound ? 'Pelanggan belum membalas dalam 24 jam' : 'Pelanggan ini belum pernah chat ke outlet ini'}
              </Typography>
              <Typography fontSize={12.5} color={C.muted}>
                Aturan WhatsApp: pesan pembuka harus template yang disetujui Meta. Setelah pelanggan membalas, Anda bisa membalas bebas selama 24 jam.
                {!approved.length && ' Outlet ini belum punya template yang disetujui.'}
                {!approved.length && outlet?.mode === 'coexist' && ' Atau sapa dulu dari WhatsApp Business di HP outlet; begitu pelanggan membalas, lanjutkan dari sini.'}
              </Typography>
            </Box>
            {approved.length ? (
              <Button variant="contained" startIcon={<DescriptionOutlined />} onClick={openPicker}
                sx={{ bgcolor: C.green, '&:hover': { bgcolor: C.greenDark }, flexShrink: 0 }}>Pilih template</Button>
            ) : (
              <Button variant="outlined" startIcon={<DescriptionOutlined />} href={`/templates?baru=${outlet?.id ?? ''}`} sx={{ flexShrink: 0 }}>
                Buat template
              </Button>
            )}
          </Stack>
        )}
        {open && text.length === 0 && !mobile && (
          <Typography fontSize={11.5} color={C.muted} sx={{ mt: .6, ml: 12 }}>Enter untuk kirim, Shift+Enter untuk baris baru. Tarik file ke sini atau tempel gambar untuk melampirkan.</Typography>
        )}
      </Box>

      <Dialog open={pickOpen} onClose={() => setPickOpen(false)} fullWidth maxWidth="sm" fullScreen={mobile}>
        <DialogTitle>Kirim template ke {conv.name}</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <List disablePadding>
            {approved.map((t) => (
              <ListItemButton key={t.id} selected={t.id === pickId} onClick={() => setPickId(t.id)} sx={{ py: 1.5 }}>
                <ListItemText primary={t.name} secondary={t.body}
                  slotProps={{ primary: { fontWeight: 600, fontSize: 14 }, secondary: { sx: { whiteSpace: 'pre-wrap', mt: .5 } } }} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPickOpen(false)}>Batal</Button>
          <Button variant="contained" disabled={!pickId} onClick={() => { sendTpl(pickId); setPickOpen(false); }}>Kirim template</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!pending} onClose={closePending} fullWidth maxWidth="sm" fullScreen={mobile}>
        <DialogTitle>Kirim file ke {conv.name}</DialogTitle>
        <DialogContent>
          {pending && (
            <Stack spacing={2} sx={{ pt: .5 }}>
              {pending.error ? <Alert severity="error">{pending.error}</Alert> : (
                <Box sx={{ display: 'grid', placeItems: 'center', p: 1.5, borderRadius: '12px', bgcolor: C.page }}>
                  {pending.kind === 'image' && <Box component="img" src={pending.url} alt="" sx={{ maxWidth: '100%', maxHeight: 360, borderRadius: '8px', objectFit: 'contain' }} />}
                  {pending.kind === 'video' && <Box component="video" src={pending.url} controls sx={{ maxWidth: '100%', maxHeight: 360, borderRadius: '8px', bgcolor: '#000' }} />}
                  {pending.kind === 'audio' && <Box component="audio" src={pending.url} controls sx={{ width: '100%' }} />}
                  {pending.kind === 'document' && <DocumentCard name={pending.file.name} size={pending.file.size} mime={pending.file.type} />}
                </Box>
              )}
              <Typography fontSize={12.5} color={C.muted}>{pending.file.name}, {fmtSize(pending.file.size)}</Typography>
              {!pending.error && pending.kind !== 'audio' && (
                <TextField label="Keterangan (opsional)" value={caption} onChange={(e) => setCaption(e.target.value)} multiline maxRows={4}
                  inputProps={{ maxLength: 1024 }} disabled={progress !== null}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); sendPending(); } }} />
              )}
              {progress !== null && (
                <Box>
                  <LinearProgress variant={progress < 1 ? 'determinate' : 'indeterminate'} value={progress * 100} sx={{ height: 6, borderRadius: 3 }} />
                  <Typography fontSize={12} color={C.muted} sx={{ mt: .6 }}>{progress < 1 ? `Mengunggah ${Math.round(progress * 100)}%` : 'Mengirim ke WhatsApp…'}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closePending} disabled={progress !== null}>Batal</Button>
          {!pending?.error && <Button variant="contained" startIcon={<Send />} disabled={progress !== null} onClick={sendPending}>Kirim file</Button>}
        </DialogActions>
      </Dialog>

      <Lightbox open={!!lightbox} url={lightbox?.url} m={lightbox?.m} onClose={() => setLightbox(null)} />

      <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Catatan internal</DialogTitle>
        <DialogContent>
          <Typography fontSize={13} color={C.muted} sx={{ mb: 1.5 }}>Hanya terlihat oleh tim di dashboard ini, tidak dikirim ke pelanggan.</Typography>
          <TextField autoFocus fullWidth multiline minRows={3} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Mis. pelanggan minta dihubungi sore" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNoteOpen(false)}>Batal</Button>
          <Button variant="contained" disabled={!noteText.trim()} onClick={saveNote}>Simpan catatan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
