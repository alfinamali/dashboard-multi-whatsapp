'use client';
import { useEffect, useRef, useState } from 'react';
import { Avatar, Box, Button, Chip, InputBase, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import {
  AttachFile, Check, DescriptionOutlined, DoneAll, EmojiEmotionsOutlined, ImageOutlined,
  InsertDriveFileOutlined, NoteAddOutlined, Send, StorefrontOutlined,
} from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, DAY, actionBtn, card, hhmm } from '@/lib/data';

export default function ChatPanel({ conv, height }) {
  const { outlets, templates, send, note, openConv } = useApp();
  const [text, setText] = useState('');
  const [tplId, setTplId] = useState('');
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [conv?.id, conv?.msgs.length]);

  const wrap = { ...card, height, display: 'flex', flexDirection: 'column', minWidth: 0 };
  if (!conv) return <Paper elevation={0} sx={wrap}><Typography color={C.muted} sx={{ m: 'auto' }}>Pilih percakapan untuk membaca dan membalas.</Typography></Paper>;

  const outlet = outlets[conv.outlet];
  const open = Date.now() - conv.lastInbound < DAY;
  const approved = templates.filter((t) => t.status === 'approved');
  const tpl = approved.find((t) => t.id === tplId) || approved[0];

  const sendText = () => { const b = text.trim(); if (b) { send(conv.id, b); setText(''); } };
  const sendTpl = () => tpl && send(conv.id, tpl.body, true);

  return (
    <Paper elevation={0} sx={wrap}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2, borderBottom: `1px solid ${C.line}` }}>
        <Avatar sx={{ bgcolor: C.green, width: 48, height: 48 }}><StorefrontOutlined /></Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>{outlet.name}</Typography>
          <Stack direction="row" alignItems="center" spacing={.8} sx={{ fontSize: 13, color: C.muted }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: outlet.online ? '#22C55E' : '#9CA3AF' }} />
            <span>{outlet.online ? 'Online' : 'Offline'}</span>
            <Chip size="small" color={open ? 'success' : 'warning'} variant="outlined" sx={{ height: 20, fontSize: 11 }} label={open ? 'Jendela 24 jam aktif' : 'Jendela 24 jam berakhir'} />
          </Stack>
        </Box>
        <Typography sx={{ fontSize: 13.5, color: C.muted, display: { xs: 'none', sm: 'block' } }}>{outlet.phone}</Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ flex: 1, overflow: 'auto', p: 2.5, bgcolor: '#F8FAF9' }}>
        <Typography fontSize={12.5} color={C.muted} textAlign="center">{conv.name} · {conv.phone}</Typography>
        {conv.msgs.map((m, i) => {
          if (m.dir === 'note') return <Box key={i} sx={{ alignSelf: 'center', px: 2, py: .8, borderRadius: 2, bgcolor: '#FFF6D6', fontSize: 13 }}>📝 Catatan: {m.text}</Box>;
          const out = m.dir === 'out';
          return (
            <Box key={i} sx={{ maxWidth: '78%', alignSelf: out ? 'flex-end' : 'flex-start', px: 2, py: 1.2, borderRadius: 2, bgcolor: out ? C.bubbleOut : '#fff', border: out ? 'none' : `1px solid ${C.line}` }}>
              {m.template && <Typography fontSize={11} color={C.green} fontWeight={600}>Template</Typography>}
              <Typography fontSize={14} lineHeight={1.7}>{m.text}</Typography>
              <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={.5} sx={{ color: C.muted }}>
                <Typography fontSize={11}>{hhmm(m.at)}</Typography>
                {out && <DoneAll sx={{ fontSize: 15, color: C.blue }} />}
              </Stack>
            </Box>
          );
        })}
        <div ref={end} />
      </Stack>

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          {open ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 3, px: 1.5, height: 48 }}>
              <EmojiEmotionsOutlined sx={{ color: C.muted }} />
              <InputBase fullWidth placeholder="Ketik pesan..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendText()} />
              <AttachFile sx={{ color: C.muted }} />
            </Stack>
          ) : (
            <Select fullWidth size="small" displayEmpty value={tpl?.id ?? ''} onChange={(e) => setTplId(e.target.value)} sx={{ height: 48, borderRadius: 3, fontSize: 14 }}>
              {!tpl && <MenuItem value="">Belum ada template disetujui</MenuItem>}
              {approved.map((t) => <MenuItem key={t.id} value={t.id} sx={{ whiteSpace: 'normal' }}>{t.name}: {t.body}</MenuItem>)}
            </Select>
          )}
          <Button variant="contained" aria-label={open ? 'Kirim' : 'Kirim template'} onClick={open ? sendText : sendTpl}
            sx={{ minWidth: 48, height: 48, borderRadius: '50%', p: 0, bgcolor: C.green, '&:hover': { bgcolor: C.greenDark } }}><Send fontSize="small" /></Button>
        </Stack>
        {!open && <Typography fontSize={12.5} color="warning.main" sx={{ mt: 1 }}>Sudah lewat 24 jam. Kirim template yang disetujui Meta.</Typography>}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.2, mt: 1.5 }}>
          <Button startIcon={<DescriptionOutlined />} variant="outlined" sx={actionBtn} onClick={sendTpl}>Kirim Template</Button>
          <Button startIcon={<ImageOutlined />} variant="outlined" sx={actionBtn} disabled={!open} onClick={() => send(conv.id, '🖼️ gambar-produk.jpg')}>Kirim Gambar</Button>
          <Button startIcon={<InsertDriveFileOutlined />} variant="outlined" sx={actionBtn} disabled={!open} onClick={() => send(conv.id, '📎 katalog-produk.pdf')}>Kirim File</Button>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.2, mt: 1.2 }}>
          <Button startIcon={<NoteAddOutlined />} variant="outlined" sx={actionBtn} onClick={() => { const t = window.prompt('Catatan internal (tidak dikirim ke pelanggan):'); if (t?.trim()) note(conv.id, t.trim()); }}>Tambah Catatan</Button>
          <Button startIcon={<Check />} variant="outlined" sx={actionBtn} onClick={() => openConv(conv.id)}>Tandai Sudah Dibalas</Button>
        </Box>
      </Box>
    </Paper>
  );
}
