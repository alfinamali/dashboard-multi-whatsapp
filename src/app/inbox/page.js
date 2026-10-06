'use client';
import { useMemo, useState } from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { Bolt } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, card, hhmm, lastOf, primaryBtn } from '@/lib/data';
import { CountPill, OnlineAvatar, PageHeader } from '@/components/ui';
import ChatPanel from '@/components/chat/ChatPanel';

export default function InboxPage() {
  const { ready, convs, outlets, activeId, openConv, query, setQuery, simulateIncoming } = useApp();
  const [status, setStatus] = useState('all');
  const list = useMemo(() => convs
    .filter((c) => (status === 'unread' ? c.unread > 0 : status === 'replied' ? lastOf(c).dir === 'out' : true))
    .filter((c) => !query || `${c.name} ${c.phone} ${c.msgs.map((m) => m.text).join(' ')}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => lastOf(b).at - lastOf(a).at), [convs, status, query]);
  if (!ready) return null;

  return (
    <>
      <PageHeader title="Pesan Masuk" subtitle="Semua percakapan dari seluruh outlet"
        action={<Button variant="contained" startIcon={<Bolt />} sx={primaryBtn} onClick={simulateIncoming}>Simulasi pesan masuk</Button>} />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '380px minmax(0,1fr)' }, alignItems: 'start' }}>
        <Paper elevation={0} sx={{ ...card, p: 1.5, height: { lg: 700 }, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            {[['all', 'Semua'], ['unread', 'Belum dibaca'], ['replied', 'Dibalas']].map(([v, l]) => (
              <Chip key={v} label={l} onClick={() => setStatus(v)} color={status === v ? 'primary' : 'default'} />
            ))}
            {query && <Chip label={`"${query}"`} onDelete={() => setQuery('')} />}
          </Stack>
          <Box sx={{ overflow: 'auto', flex: 1 }}>
            {!list.length && <Typography color={C.muted} sx={{ p: 3, textAlign: 'center' }}>Tidak ada percakapan.</Typography>}
            {list.map((c, i) => (
              <Stack key={c.id} direction="row" spacing={1.5} onClick={() => openConv(c.id)}
                sx={{ p: 1.5, cursor: 'pointer', borderRadius: 2, bgcolor: c.id === activeId ? C.greenSoft : 'transparent', '&:hover': { bgcolor: c.id === activeId ? C.greenSoft : '#F7FAF9' } }}>
                <OnlineAvatar name={c.name} i={i} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontSize={14} fontWeight={600} noWrap>{c.name}</Typography>
                  <Typography fontSize={12} color={C.muted} noWrap>{outlets[c.outlet].name}</Typography>
                  <Typography fontSize={12.5} noWrap>{lastOf(c).text}</Typography>
                </Box>
                <Stack alignItems="flex-end" justifyContent="space-between">
                  <Typography fontSize={12} color={C.muted}>{hhmm(lastOf(c).at)}</Typography>
                  {c.unread > 0 && <CountPill n={c.unread} />}
                </Stack>
              </Stack>
            ))}
          </Box>
        </Paper>
        <ChatPanel conv={convs.find((c) => c.id === activeId)} height={{ xs: 680, lg: 700 }} />
      </Box>
    </>
  );
}
