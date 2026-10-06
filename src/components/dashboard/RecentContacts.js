'use client';
import Link from 'next/link';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { CountPill, OnlineAvatar } from '@/components/ui';
import { C, card, hhmm, lastOf } from '@/lib/data';

export default function RecentContacts({ items, outlets, onPick }) {
  return (
    <Paper elevation={0} sx={{ ...card, p: 2.5 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
        <Typography fontWeight={700} fontSize={16} sx={{ flex: 1 }}>Kontak Terbaru</Typography>
        <Typography component={Link} href="/contacts" fontSize={12.5} fontWeight={500} sx={{ color: C.green, textDecoration: 'none' }}>Lihat Semua</Typography>
      </Stack>
      {!items.length && <Typography fontSize={13} color={C.muted} sx={{ py: 3, textAlign: 'center' }}>Tidak ada kontak yang cocok dengan filter.</Typography>}
      {items.map((c, i) => (
        <Stack key={c.id} direction="row" spacing={1.5} onClick={() => onPick(c)} sx={{ py: 1.6, cursor: 'pointer', borderBottom: i < items.length - 1 ? `1px solid ${C.line}` : 'none' }}>
          <OnlineAvatar name={c.name} i={i} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontSize={14} fontWeight={600} noWrap>{c.name}</Typography>
            <Typography fontSize={12} color={C.muted} noWrap>{outlets[c.outlet].name} • {c.phone}</Typography>
            <Typography fontSize={12.5} noWrap sx={{ mt: .3 }}>{lastOf(c).text}</Typography>
          </Box>
          <Stack alignItems="flex-end" justifyContent="space-between">
            <Typography fontSize={12} color={C.muted}>{hhmm(lastOf(c).at)}</Typography>
            {c.unread > 0 && <CountPill n={c.unread} />}
          </Stack>
        </Stack>
      ))}
    </Paper>
  );
}
