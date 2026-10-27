'use client';
import { useMemo, useState } from 'react';
import { Avatar, Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';
import { PhoneIphone } from '@mui/icons-material';
import { C, initials, lastOf, outletColor, previewText, when } from '@/lib/data';

const STATUS = [['all', 'Semua'], ['unread', 'Belum dibaca'], ['replied', 'Sudah dibalas']];

function OutletChip({ label, color, n, on, onClick }) {
  return (
    <ButtonBase onClick={onClick} aria-pressed={on}
      sx={{
        flexShrink: 0, height: 32, px: 1.4, gap: .8, borderRadius: '16px', fontSize: 13, fontWeight: on ? 600 : 500,
        border: `1px solid ${on ? color || C.navy : C.line}`, bgcolor: on ? (color ? `${color}14` : C.navy) : C.surface,
        color: on ? (color || '#fff') : C.text, whiteSpace: 'nowrap',
      }}>
      {color && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />}
      {label}
      {n > 0 && <Box component="span" sx={{ fontSize: 11.5, fontWeight: 700, color: on && !color ? '#fff' : C.green }}>{n}</Box>}
    </ButtonBase>
  );
}

export default function ConversationList({ convs, outlets, activeId, onPick, outlet, onOutlet, query, onClearQuery }) {
  const [status, setStatus] = useState('all');

  const unreadBy = useMemo(() => convs.reduce((m, c) => ({ ...m, [c.outlet]: (m[c.outlet] || 0) + c.unread }), {}), [convs]);
  const totalUnread = convs.reduce((n, c) => n + c.unread, 0);

  const items = useMemo(() => {
    const q = (query || '').toLowerCase();
    return convs
      .filter((c) => outlet === 'all' || c.outlet === outlet)
      .filter((c) => (status === 'unread' ? c.unread > 0 : status === 'replied' ? lastOf(c).dir === 'out' : true))
      .filter((c) => !q || `${c.name} ${c.phone} ${c.msgs.map((m) => m.text).join(' ')}`.toLowerCase().includes(q))
      .sort((a, b) => lastOf(b).at - lastOf(a).at);
  }, [convs, outlet, status, query]);

  return (
    <Box component="section" aria-label="Daftar percakapan"
      sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, height: '100%', borderRight: { md: `1px solid ${C.line}` } }}>
      <Box sx={{ px: 2, pt: 2, pb: 1.5, borderBottom: `1px solid ${C.line}` }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography component="h1" fontWeight={700} fontSize={20}>Kotak masuk</Typography>
          <Typography fontSize={13} color={C.muted}>{totalUnread ? `${totalUnread} belum dibaca` : 'Semua sudah dibaca'}</Typography>
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

        {/* filter outlet, warna = identitas outlet */}
        {outlets.length > 1 && (
          <Stack direction="row" spacing={.8} sx={{ overflowX: 'auto', mx: -2, px: 2, pb: .3, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            <OutletChip label="Semua outlet" n={0} on={outlet === 'all'} onClick={() => onOutlet('all')} />
            {outlets.map((o, i) => (
              <OutletChip key={o.id ?? i} label={o.name} color={outletColor(i)} n={unreadBy[i] || 0} on={outlet === i} onClick={() => onOutlet(outlet === i ? 'all' : i)} />
            ))}
          </Stack>
        )}
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
          const color = outletColor(c.outlet);
          const o = outlets[c.outlet];
          return (
            <Box component="li" key={c.id}>
              <ButtonBase onClick={() => onPick(c)} aria-current={on ? 'true' : undefined}
                sx={{
                  width: '100%', textAlign: 'left', display: 'flex', gap: 1.5, alignItems: 'flex-start', px: 2, py: 1.5,
                  position: 'relative', bgcolor: on ? C.greenSoft : 'transparent', '&:hover': { bgcolor: on ? C.greenSoft : C.chatBg },
                  '&::before': { content: '""', position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: '0 3px 3px 0', bgcolor: color, opacity: on ? 1 : .55 },
                }}>
                <Avatar sx={{ width: 42, height: 42, fontSize: 14, fontWeight: 600, bgcolor: `${color}1F`, color }}>{initials(c.name)}</Avatar>
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
                  {outlets.length > 1 && o && (
                    <Typography fontSize={12} fontWeight={500} sx={{ color, mt: .4 }} noWrap>{o.name}</Typography>
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
