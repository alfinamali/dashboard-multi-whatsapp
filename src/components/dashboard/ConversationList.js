'use client';
import { useMemo, useState } from 'react';
import { Box, Chip, InputBase, Paper, Stack, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import { CountPill, OnlineAvatar } from '@/components/ui';
import { C, card, hhmm, lastOf } from '@/lib/data';

const FILTERS = [['all', 'Semua'], ['unread', 'Belum Dibaca'], ['replied', 'Dibalas']];

export default function ConversationList({ convs, outletName, activeId, onPick, height }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  const items = useMemo(() => convs
    .filter((c) => status === 'unread' ? c.unread > 0 : status === 'replied' ? lastOf(c).dir === 'out' : true)
    .filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => lastOf(b).at - lastOf(a).at), [convs, q, status]);

  const unread = convs.reduce((n, c) => n + c.unread, 0);

  return (
    <Paper elevation={0} sx={{ ...card, height, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${C.line}` }}>
        <Typography fontWeight={700} fontSize={16} noWrap>{outletName}</Typography>
        <Typography fontSize={12.5} color={C.muted} sx={{ mb: 1.2 }}>{convs.length} percakapan • {unread} belum dibaca</Typography>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ border: `1px solid ${C.line}`, borderRadius: 2, px: 1.5, height: 38, mb: 1.2 }}>
          <Search sx={{ color: C.muted }} />
          <InputBase fullWidth placeholder="Cari customer..." value={q} onChange={(e) => setQ(e.target.value)} sx={{ fontSize: 14 }} />
        </Stack>
        <Stack direction="row" spacing={.8}>
          {FILTERS.map(([v, l]) => {
            const on = status === v;
            return (
              <Chip key={v} size="small" label={l} onClick={() => setStatus(v)}
                sx={{ fontWeight: 500, bgcolor: on ? C.green : '#F0F4F3', color: on ? '#fff' : C.text, '&:hover': { bgcolor: on ? C.greenDark : '#E6ECEA' } }} />
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {!items.length && <Typography fontSize={13} color={C.muted} textAlign="center" sx={{ py: 4 }}>Tidak ada percakapan.</Typography>}
        {items.map((c, i) => {
          const on = c.id === activeId;
          const last = lastOf(c);
          return (
            <Stack key={c.id} direction="row" spacing={1.5} onClick={() => onPick(c)}
              sx={{
                px: 2, py: 1.5, cursor: 'pointer',
                bgcolor: on ? C.greenSoft : 'transparent',
                borderLeft: `3px solid ${on ? C.green : 'transparent'}`,
                borderBottom: `1px solid ${C.line}`,
                '&:hover': { bgcolor: on ? C.greenSoft : '#F7FAF9' },
              }}>
              <OnlineAvatar name={c.name} i={i} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography fontSize={14} fontWeight={c.unread ? 700 : 600} noWrap sx={{ flex: 1 }}>{c.name}</Typography>
                  <Typography fontSize={11.5} color={c.unread ? C.green : C.muted}>{hhmm(last.at)}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography fontSize={12.5} color={c.unread ? C.text : C.muted} fontWeight={c.unread ? 600 : 400} noWrap sx={{ flex: 1 }}>
                    {last.dir === 'out' ? 'Anda: ' : ''}{last.text}
                  </Typography>
                  {c.unread > 0 && <CountPill n={c.unread} />}
                </Stack>
              </Box>
            </Stack>
          );
        })}
      </Box>
    </Paper>
  );
}