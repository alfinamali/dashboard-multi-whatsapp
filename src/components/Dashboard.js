'use client';
import { useMemo, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { ChatBubbleOutline, Groups, Send, WhatsApp } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, DAY, lastOf } from '@/lib/data';
import { StatCard } from '@/components/ui';
import ChatPanel from '@/components/chat/ChatPanel';
import OutletList from '@/components/dashboard/OutletList';
import FilterPanel from '@/components/dashboard/FilterPanel';
import RecentContacts from '@/components/dashboard/RecentContacts';

export default function Dashboard() {
  const { ready, convs, outlets, contacts, totalUnread, activeId, openConv } = useApp();
  const [outlet, setOutlet] = useState(0);
  const [filter, setFilter] = useState({ status: 'all', outlet: 'all', range: 'all' });

  const recent = useMemo(() => convs
    .filter((c) => (filter.status === 'unread' ? c.unread > 0 : filter.status === 'replied' ? lastOf(c).dir === 'out' : true))
    .filter((c) => filter.outlet === 'all' || c.outlet === filter.outlet)
    .filter((c) => filter.range === 'all' || Date.now() - lastOf(c).at < (filter.range === 'today' ? DAY : 7 * DAY))
    .sort((a, b) => lastOf(b).at - lastOf(a).at).slice(0, 5), [convs, filter]);

  if (!ready) return null;
  const today = (dir) => convs.flatMap((c) => c.msgs).filter((m) => m.dir === dir && Date.now() - m.at < DAY).length;
  const online = outlets.filter((o) => o.online).length;
  const pickOutlet = (i) => { setOutlet(i); const c = convs.find((x) => x.outlet === i); if (c) openConv(c.id); };

  return (
    <>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' } }}>
        <StatCard icon={<WhatsApp sx={{ fontSize: 30 }} />} color="#22C55E" label="Total Outlet" value={outlets.length} sub={`${online} outlet online`} />
        <StatCard icon={<ChatBubbleOutline />} color={C.blue} label="Pesan Masuk" hint="(24 jam)" value={today('in')} sub={`${totalUnread} belum dibaca`} />
        <StatCard icon={<Send />} color={C.blue} label="Pesan Terkirim" hint="(24 jam)" value={today('out')} sub="dari semua outlet" />
        <StatCard icon={<Groups />} color="#5B6FD6" label="Total Kontak" value={contacts.length} sub="dari semua outlet" />
      </Box>
      <Box sx={{ display: 'grid', gap: 2, mt: 2, gridTemplateColumns: { xs: '1fr', xl: '320px minmax(0,1fr) 360px' }, alignItems: 'start' }}>
        <OutletList outlets={outlets} active={outlet} onPick={pickOutlet} />
        <ChatPanel conv={convs.find((c) => c.id === activeId)} height={{ xs: 680, xl: 730 }} />
        <Stack spacing={2}>
          <FilterPanel outlets={outlets} unread={totalUnread} onApply={setFilter} />
          <RecentContacts items={recent} outlets={outlets} onPick={(c) => { setOutlet(c.outlet); openConv(c.id); }} />
        </Stack>
      </Box>
    </>
  );
}
