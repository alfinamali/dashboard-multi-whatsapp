'use client';
import { useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useApp } from '@/store/AppContext';
import ChatPanel from '@/components/chat/ChatPanel';
import ConversationList from '@/components/dashboard/ConversationList';
import OutletPanel from '@/components/dashboard/OutletPanel';
import { C } from '@/lib/data';

const KEY = 'wa_inbox_outlet'; // outlet terakhir dipilih (kenyamanan per browser)

// Kotak masuk: [daftar outlet] -> [daftar chat outlet tsb] -> [percakapan].
// Desktop besar: tiga kolom. Laptop/tablet: kolom outlet berupa ikon. HP: bertahap dengan tombol kembali.
export default function Inbox() {
  const { ready, convs, outlets, activeId, openConv, closeConv, query, setQuery } = useApp();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const compactOutlets = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const [outlet, setOutletState] = useState('all');
  const [pickedOnMobile, setPickedOnMobile] = useState(false);
  const active = useMemo(() => convs.find((c) => c.id === activeId) || null, [convs, activeId]);
  const unreadBy = useMemo(() => convs.reduce((m, c) => ({ ...m, [c.outlet]: (m[c.outlet] || 0) + c.unread }), {}), [convs]);

  // pulihkan pilihan outlet terakhir (disimpan sebagai ID outlet, karena urutan outlet bisa bergeser)
  useEffect(() => {
    if (!outlets.length) return;
    try {
      const v = localStorage.getItem(KEY);
      if (v && v !== 'all') {
        const i = outlets.findIndex((o) => String(o.id) === v);
        if (i >= 0) setOutletState(i);
      }
    } catch { /* storage tidak tersedia */ }
  }, [outlets.length]); // eslint-disable-line react-hooks/exhaustive-deps
  // index outlet di luar jangkauan (outlet dihapus) -> kembali ke semua
  useEffect(() => { if (outlet !== 'all' && !outlets[outlet]) setOutletState('all'); }, [outlet, outlets]);

  const setOutlet = (v) => {
    setOutletState(v);
    setPickedOnMobile(true);
    try { localStorage.setItem(KEY, v === 'all' ? 'all' : String(outlets[v]?.id ?? 'all')); } catch { /* abaikan */ }
    // chat yang terbuka milik outlet lain -> tutup agar kolom kanan sesuai pilihan
    if (active && v !== 'all' && active.outlet !== v) closeConv();
  };

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

  const outletsCol = <OutletPanel outlets={outlets} value={outlet} onChange={setOutlet} unreadBy={unreadBy} compact={compactOutlets} />;
  const listCol = (
    <ConversationList convs={convs} outlets={outlets} activeId={activeId} onPick={(c) => openConv(c.id)}
      outlet={outlet} query={query} onClearQuery={() => setQuery('')}
      onBack={mobile ? () => setPickedOnMobile(false) : undefined} />
  );
  const chatCol = <ChatPanel conv={active} onClose={closeConv} mobile={mobile} />;

  if (mobile) {
    // HP: percakapan > daftar chat > daftar outlet. Pencarian langsung menampilkan hasil chat.
    const view = active ? chatCol : (pickedOnMobile || query) ? listCol : outletsCol;
    return <Box sx={{ height: '100%', bgcolor: C.surface }}>{view}</Box>;
  }

  return (
    <Box sx={{
      height: '100%', bgcolor: C.surface, display: 'grid',
      gridTemplateColumns: { md: '76px 320px minmax(0,1fr)', lg: '264px 340px minmax(0,1fr)', xl: '280px 380px minmax(0,1fr)' },
    }}>
      {outletsCol}
      {listCol}
      {chatCol}
    </Box>
  );
}
