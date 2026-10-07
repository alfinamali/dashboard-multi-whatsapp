'use client';
import { useMemo, useState } from 'react';
import { Avatar, Box, InputBase, Paper, Stack, Typography } from '@mui/material';
import { Search, StorefrontOutlined } from '@mui/icons-material';
import { CountPill } from '@/components/ui';
import { C, card } from '@/lib/data';

export default function OutletList({ outlets, active, onPick, height }) {
  const [q, setQ] = useState('');
  const items = useMemo(
    () => outlets.map((o, i) => ({ ...o, i })).filter((o) => o.name.toLowerCase().includes(q.toLowerCase())),
    [outlets, q],
  );

  return (
    <Paper elevation={0} sx={{ ...card, p: 2, height, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Typography fontWeight={700} fontSize={16} sx={{ mb: 1.5 }}>WA Bisnis ({outlets.length})</Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ border: `1px solid ${C.line}`, borderRadius: 2, px: 1.5, height: 40, mb: 1 }}>
        <Search sx={{ color: C.muted }} />
        <InputBase fullWidth placeholder="Cari outlet..." value={q} onChange={(e) => setQ(e.target.value)} sx={{ fontSize: 14 }} />
      </Stack>
      <Box sx={{ flex: 1, overflow: 'auto', mx: -2, minHeight: 0 }}>
        {items.map((o) => {
          const on = active === o.i;
          return (
            <Stack key={o.i} direction="row" alignItems="center" spacing={1.5} onClick={() => onPick(o.i)}
              sx={{
                px: 2, py: 1.2, cursor: 'pointer',
                bgcolor: on ? C.greenSoft : 'transparent',
                borderLeft: `3px solid ${on ? C.green : 'transparent'}`,
                '&:hover': { bgcolor: on ? C.greenSoft : '#F7FAF9' },
              }}>
              <Avatar sx={{ bgcolor: o.online ? C.green : '#9CA3AF', width: 34, height: 34 }}>
                <StorefrontOutlined fontSize="small" />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontSize={14} fontWeight={o.unread ? 700 : 500} noWrap>{o.name}</Typography>
                <Typography fontSize={11.5} color={C.muted} noWrap>{o.online ? 'Online' : 'Offline'}</Typography>
              </Box>
              <CountPill n={o.unread} />
            </Stack>
          );
        })}
        {!items.length && <Typography fontSize={13} color={C.muted} textAlign="center" sx={{ py: 3 }}>Outlet tidak ditemukan.</Typography>}
      </Box>
    </Paper>
  );
}
