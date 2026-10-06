'use client';
import { useMemo, useState } from 'react';
import { Avatar, Box, InputBase, Paper, Stack, Typography } from '@mui/material';
import { ChevronRight, Search, StorefrontOutlined } from '@mui/icons-material';
import { CountPill } from '@/components/ui';
import { C, card } from '@/lib/data';

export default function OutletList({ outlets, active, onPick }) {
  const [q, setQ] = useState('');
  const [showAll, setShowAll] = useState(false);
  const items = useMemo(() => {
    const l = outlets.map((o, i) => ({ ...o, i })).filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));
    return showAll || q ? l : l.slice(0, 10);
  }, [outlets, q, showAll]);

  return (
    <Paper elevation={0} sx={{ ...card, p: 2, height: { xl: 730 }, display: 'flex', flexDirection: 'column' }}>
      <Typography fontWeight={700} fontSize={16} sx={{ mb: 1.5 }}>Daftar Outlet ({outlets.length})</Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ border: `1px solid ${C.line}`, borderRadius: 2, px: 1.5, height: 42, mb: 1 }}>
        <Search sx={{ color: C.muted }} />
        <InputBase fullWidth placeholder="Cari outlet..." value={q} onChange={(e) => setQ(e.target.value)} sx={{ fontSize: 14 }} />
      </Stack>
      <Box sx={{ flex: 1, overflow: 'auto', mx: -2, minHeight: 0 }}>
        {items.map((o) => (
          <Stack key={o.i} direction="row" alignItems="center" spacing={1.5} onClick={() => onPick(o.i)}
            sx={{ px: 2, py: 1.3, cursor: 'pointer', bgcolor: active === o.i ? C.greenSoft : 'transparent', '&:hover': { bgcolor: active === o.i ? C.greenSoft : '#F7FAF9' } }}>
            <Avatar sx={{ bgcolor: o.online ? C.green : '#9CA3AF', width: 38, height: 38 }}><StorefrontOutlined fontSize="small" /></Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontSize={14} fontWeight={500} noWrap>{o.name}</Typography>
              <Typography fontSize={12} color={C.muted} noWrap><span style={{ color: o.online ? C.green : C.muted }}>{o.online ? 'Online' : 'Offline'}</span> • {o.unread} pesan belum dibaca</Typography>
            </Box>
            <CountPill n={o.unread} />
          </Stack>
        ))}
      </Box>
      {!q && outlets.length > 10 && (
        <Stack direction="row" alignItems="center" onClick={() => setShowAll((v) => !v)} sx={{ pt: 1.5, mt: 1, borderTop: `1px solid ${C.line}`, cursor: 'pointer' }}>
          <Typography fontSize={13.5} sx={{ flex: 1 }}>{showAll ? 'Tampilkan lebih sedikit' : `${outlets.length - 10} outlet lainnya`}</Typography>
          <ChevronRight fontSize="small" sx={{ transform: showAll ? 'rotate(-90deg)' : 'none' }} />
        </Stack>
      )}
    </Paper>
  );
}
