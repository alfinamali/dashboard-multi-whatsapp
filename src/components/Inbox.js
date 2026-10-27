'use client';
import { useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useApp } from '@/store/AppContext';
import ChatPanel from '@/components/chat/ChatPanel';
import ConversationList from '@/components/dashboard/ConversationList';
import { C } from '@/lib/data';

// Kotak masuk gabungan semua outlet: daftar percakapan + panel chat.
// Desktop: dua kolom. HP: daftar ATAU chat (chat menutupi daftar, tombol kembali menutupnya).
export default function Inbox() {
  const { ready, convs, outlets, activeId, openConv, closeConv, query, setQuery } = useApp();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [outlet, setOutlet] = useState('all'); // 'all' | index outlet
  const active = useMemo(() => convs.find((c) => c.id === activeId) || null, [convs, activeId]);

  // Esc menutup percakapan (kecuali sedang ada dialog terbuka)
  useEffect(() => {
    if (!activeId) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape' || document.querySelector('.MuiDialog-root, .MuiPopover-root')) return;
      closeConv();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId, closeConv]);

  if (!ready) return null;
  const showList = !mobile || !active;
  const showChat = !mobile || !!active;

  return (
    <Box sx={{ height: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '340px minmax(0,1fr)', xl: '380px minmax(0,1fr)' }, bgcolor: C.surface }}>
      {showList && (
        <ConversationList convs={convs} outlets={outlets} activeId={activeId} onPick={(c) => openConv(c.id)}
          outlet={outlet} onOutlet={setOutlet} query={query} onClearQuery={() => setQuery('')} />
      )}
      {showChat && <ChatPanel conv={active} onClose={closeConv} mobile={mobile} />}
    </Box>
  );
}
