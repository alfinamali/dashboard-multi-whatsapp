'use client';
import { useState } from 'react';
import { Box } from '@mui/material';
import { useApp } from '@/store/AppContext';
import ChatPanel from '@/components/chat/ChatPanel';
import OutletList from '@/components/dashboard/OutletList';
import ConversationList from '@/components/dashboard/ConversationList';

const H = { xs: 640, lg: 'calc(100vh - 120px)' };

export default function Dashboard() {
  const { ready, convs, outlets, activeId, openConv } = useApp();
  const [picked, setPicked] = useState(null);

  if (!ready) return null;
  const active = convs.find((c) => c.id === activeId);
  const outlet = picked ?? active?.outlet ?? 0;

  const pickOutlet = (i) => {
    setPicked(i);
    // otomatis buka percakapan terbaru dari outlet tsb (seperti Thunderbird)
    const latest = convs
      .filter((c) => c.outlet === i)
      .sort((a, b) => b.msgs[b.msgs.length - 1].at - a.msgs[a.msgs.length - 1].at)[0];
    if (latest) openConv(latest.id);
  };

  const shown = active && active.outlet === outlet ? active : null;

  return (
    <Box sx={{
      display: 'grid', gap: 2, alignItems: 'start',
      gridTemplateColumns: { xs: '1fr', lg: '260px 340px minmax(0,1fr)' },
    }}>
      <OutletList outlets={outlets} active={outlet} onPick={pickOutlet} height={H} />
      <ConversationList
        convs={convs.filter((c) => c.outlet === outlet)}
        outletName={outlets[outlet]?.name}
        activeId={activeId}
        onPick={(c) => openConv(c.id)}
        height={H}
      />
      <ChatPanel conv={shown} height={H} />
    </Box>
  );
}
