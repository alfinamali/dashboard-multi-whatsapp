'use client';
import { useMemo, useState } from 'react';
import { Avatar, Box, ButtonBase, Chip, IconButton, Stack, Typography } from '@mui/material';
import { AllInbox, ArrowBack, PhoneIphone } from '@mui/icons-material';
import { C, initials, lastOf, outletColor, previewText, when } from '@/lib/data';

const STATUS = [['all', 'Semua'], ['unread', 'Belum dibaca'], ['replied', 'Sudah dibalas']];

// Daftar chat untuk outlet yang dipilih di kolom outlet ('all' = semua outlet).
export default function ConversationList({ convs, outlets, activeId, onPick, outlet, query, onClearQuery, onBack }) {
  const [status, setStatus] = useState('all');
  const scoped = useMemo(() => convs.filter((c) => outlet === 'all' || c.outlet === outlet), [convs, outlet]);
  const scopedUnread = scoped.reduce((n, c) => n + c.unread, 0);
  const o = outlet === 'all' ? null : outlets[outlet];
  const color = o ? outletColor(outlet) : C.navy;

  const items = useMemo(() => {
    const q = (query || '').toLowerCase();
    return scoped
      .filter((c) => (status === 'unread' ? c.unread > 0 : status === 'replied' ? lastOf(c).dir === 'out' : true))
      .filter((c) => !q || `${c.name} ${c.phone} ${c.msgs.map((m) => m.text).join(' ')}`.toLowerCase().includes(q))
      .sort((a, b) => lastOf(b).at - lastOf(a).at);
  }, [scoped, status, query]);

  return (
    <Box component="section" aria-label="Daftar percakapan"
      sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, height: '100%', borderRight: { md: `1px solid ${C.line}` } }}>
      <Box sx={{ px: 2, pt: 2, pb: 1.5, borderBottom: `1px solid ${C.line}` }}>
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1.5, minHeight: 40 }}>
          {onBack && <IconButton aria-label="Kembali ke daftar outlet" onClick={onBack} sx={{ ml: -1 }}><ArrowBack /></IconButton>}
          <Avatar sx={{ width: 36, height: 36, borderRadius: '10px', fontSize: 13, fontWeight: 700, bgcolor: `${color}1F`, color }}>
            {o ? initials(o.name) : <AllInbox sx={{ fontSize: 19 }} />}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={.6}>
              <Typography component="h2" fontWeight={700} fontSize={16} noWrap sx={{ color: o ? color : C.text }}>{o ? o.name : 'Semua outlet'}</Typography>
              {o?.mode === 'coexist' && <PhoneIphone sx={{ fontSize: 14, color: C.muted }} />}
            </Stack>
            <Typography fontSize={12.5} color={C.muted} noWrap>
              {scoped.length} percakapan{scopedUnread ? `, ${scopedUnread} belum dibaca` : ''}{o?.phone ? ` · ${o.phone}` : ''}
            </Typography>
          </Box>
        </Stack>

        {/* tab status */}
        <Stack direction="row" role="tablist" sx={{ bgcolor: C.page, borderRadius: '10px', p: .4, mb: 1.5 }}>
          {STATUS.map(([v, l]) => {
            const on = status === v;
            return (
              <ButtonBase key={v} role="tab" aria-selected={on} onClick={() => setStatus(v)}
                sx={{ flex: 1, height: 32, borderRadius: '8px', fontSize: 13, fontWeight: on ? 600 : 500, color: on ? C.text : C.muted,
                  bgcolor: on ? C.surface : 'transparent', boxShadow: on ? '0 1px 2px rgba(14,42,43,.12)' : 'none' }}>
                {l}
              </ButtonBase>
            );
          })}
        </Stack>

        {query && (
          <Chip size="small" label={`Hasil untuk "${query}"`} onDelete={onClearQuery} sx={{ mt: 1.2, bgcolor: C.greenSoft, color: C.greenDark }} />
        )}
      </Box>

      <Box component="ul" sx={{ flex: 1, overflow: 'auto', minHeight: 0, m: 0, p: 0, listStyle: 'none' }}>
        {!items.length && (
          <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
            <Typography fontWeight={600} fontSize={14.5}>
              {query ? 'Tidak ada yang cocok' : status === 'unread' ? 'Semua pesan sudah dibaca' : 'Belum ada percakapan'}
            </Typography>
            <Typography fontSize={13} color={C.muted} sx={{ mt: .5 }}>
              {query ? 'Coba kata kunci lain atau hapus pencarian.'
                : outlets.length ? 'Pesan dari pelanggan akan muncul di sini begitu masuk.'
                  : 'Hubungkan nomor WhatsApp outlet di halaman Outlet untuk mulai menerima pesan.'}
            </Typography>
          </Box>
        )}
        {items.map((c) => {
          const on = c.id === activeId;
          const last = lastOf(c);
          const rowColor = outletColor(c.outlet);
          return (
            <Box component="li" key={c.id}>
              <ButtonBase onClick={() => onPick(c)} aria-current={on ? 'true' : undefined}
                sx={{
                  width: '100%', textAlign: 'left', display: 'flex', gap: 1.5, alignItems: 'flex-start', px: 2, py: 1.5,
                  position: 'relative', bgcolor: on ? C.greenSoft : 'transparent', '&:hover': { bgcolor: on ? C.greenSoft : C.chatBg },
                  '&::before': { content: '""', position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: '0 3px 3px 0', bgcolor: rowColor, opacity: on ? 1 : .55 },
                }}>
                <Avatar sx={{ width: 42, height: 42, fontSize: 14, fontWeight: 600, bgcolor: `${rowColor}1F`, color: rowColor }}>{initials(c.name)}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography fontSize={14.5} fontWeight={c.unread ? 700 : 600} noWrap sx={{ flex: 1 }}>{c.name}</Typography>
                    <Typography fontSize={12} color={c.unread ? C.green : C.muted} fontWeight={c.unread ? 600 : 400} sx={{ flexShrink: 0 }}>{when(last.at)}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: .2 }}>
                    <Typography fontSize={13} color={c.unread ? C.text : C.muted} fontWeight={c.unread ? 500 : 400} noWrap sx={{ flex: 1 }}>
                      {last.dir === 'out' && (last.source === 'phone' ? <PhoneIphone sx={{ fontSize: 13, mr: .4, verticalAlign: '-2px' }} /> : 'Anda: ')}
                      {previewText(last.text)}
                    </Typography>
                    {c.unread > 0 && (
                      <Box sx={{ minWidth: 20, height: 20, px: .6, borderRadius: 10, bgcolor: C.green, color: '#fff', fontSize: 11.5, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{c.unread}</Box>
                    )}
                  </Stack>
                  {outlet === 'all' && outlets.length > 1 && outlets[c.outlet] && (
                    <Typography fontSize={12} fontWeight={500} sx={{ color: outletColor(c.outlet), mt: .4 }} noWrap>{outlets[c.outlet].name}</Typography>
                  )}
                </Box>
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
