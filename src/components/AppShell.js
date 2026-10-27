'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Alert, Avatar, Badge, Box, ButtonBase, Divider, Drawer, IconButton, InputBase, ListItemIcon, Menu, MenuItem,
  Snackbar, Stack, Tooltip, Typography,
} from '@mui/material';
import {
  ChatBubbleOutline, Close, DescriptionOutlined, KeyboardArrowDown, Logout, Menu as MenuIcon, NotificationsNone,
  PeopleAltOutlined, Search, SendOutlined, SettingsOutlined, StorefrontOutlined, WhatsApp,
} from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, initials } from '@/lib/data';

const NAV = [
  { label: 'Kotak masuk', icon: ChatBubbleOutline, href: '/', match: ['/', '/inbox'] },
  { label: 'Outlet', icon: StorefrontOutlined, href: '/outlets' },
  { label: 'Kontak', icon: PeopleAltOutlined, href: '/contacts' },
  { label: 'Pesan terkirim', icon: SendOutlined, href: '/sent' },
  { label: 'Template pesan', icon: DescriptionOutlined, href: '/templates' },
  { label: 'Pengaturan', icon: SettingsOutlined, href: '/settings' },
];
const FULL_BLEED = ['/', '/inbox']; // halaman kotak masuk mengisi seluruh layar tanpa padding
const norm = (p) => (p || '/').replace(/\.html$/, '').replace(/\/$/, '') || '/';

function Brand({ compact }) {
  return (
    <Stack direction="row" spacing={1.4} alignItems="center" sx={{ px: compact ? 0 : .5, justifyContent: compact ? 'center' : 'flex-start' }}>
      <Box sx={{ width: 36, height: 36, borderRadius: '11px', bgcolor: '#25D366', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <WhatsApp sx={{ color: '#0B3B22', fontSize: 22 }} />
      </Box>
      {!compact && (
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={700} fontSize={15} lineHeight={1.2} color="#fff">Multi Outlet</Typography>
          <Typography fontSize={12} color="rgba(255,255,255,.6)">Kotak masuk WhatsApp</Typography>
        </Box>
      )}
    </Stack>
  );
}

function NavList({ path, compact, badge, onNavigate }) {
  return (
    <Stack component="nav" aria-label="Menu utama" spacing={.4}>
      {NAV.map(({ label, icon: Icon, href, match }) => {
        const on = (match || [href]).includes(path);
        const n = badge[href];
        const item = (
          <Stack key={href} component={Link} href={href} onClick={onNavigate} direction="row" alignItems="center"
            aria-current={on ? 'page' : undefined} spacing={1.6}
            sx={{
              position: 'relative', px: compact ? 0 : 1.5, height: 44, borderRadius: '10px', textDecoration: 'none',
              justifyContent: compact ? 'center' : 'flex-start',
              color: on ? '#fff' : 'rgba(255,255,255,.72)', bgcolor: on ? C.navySoft : 'transparent',
              '&:hover': { bgcolor: C.navySoft, color: '#fff' },
              '&::before': on ? { content: '""', position: 'absolute', left: compact ? -12 : -16, top: 10, bottom: 10, width: 3, borderRadius: 3, bgcolor: '#25D366' } : {},
            }}>
            <Badge badgeContent={compact ? n : 0} color="error" max={99}><Icon sx={{ fontSize: 21 }} /></Badge>
            {!compact && <Typography sx={{ flex: 1, fontSize: 14, fontWeight: on ? 600 : 500 }}>{label}</Typography>}
            {!compact && n > 0 && (
              <Box sx={{ minWidth: 22, px: .8, height: 20, borderRadius: 10, bgcolor: href === '/' ? '#25D366' : 'rgba(255,255,255,.14)', color: href === '/' ? '#0B3B22' : '#fff', fontSize: 11.5, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{n > 99 ? '99+' : n}</Box>
            )}
          </Stack>
        );
        return compact ? <Tooltip key={href} title={label} placement="right">{item}</Tooltip> : item;
      })}
    </Stack>
  );
}

function OutletHealth({ outlets, compact }) {
  const online = outlets.filter((o) => o.online).length;
  const off = outlets.filter((o) => o.disconnected).length;
  const ok = online === outlets.length && !off;
  const dot = <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ok ? '#25D366' : '#F5B544', flexShrink: 0 }} />;
  if (compact) return <Tooltip title={`${online} dari ${outlets.length} outlet aktif`} placement="right"><Box sx={{ display: 'grid', placeItems: 'center', py: 1 }}>{dot}</Box></Tooltip>;
  return (
    <Stack component={Link} href="/outlets" direction="row" spacing={1.4} alignItems="center" sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255,255,255,.05)', textDecoration: 'none' }}>
      {dot}
      <Box>
        <Typography fontSize={13} fontWeight={600} color="#fff">{off ? `${off} outlet terputus` : ok ? 'Semua outlet aktif' : 'Ada outlet nonaktif'}</Typography>
        <Typography fontSize={12} color="rgba(255,255,255,.6)">{online} dari {outlets.length} aktif</Typography>
      </Box>
    </Stack>
  );
}

function Sidebar({ path, compact, outlets, badge, onNavigate }) {
  return (
    <Stack sx={{ height: '100%', p: compact ? 1.5 : 2, gap: 3, bgcolor: C.navy }}>
      <Box sx={{ pt: .5 }}><Brand compact={compact} /></Box>
      <NavList path={path} compact={compact} badge={badge} onNavigate={onNavigate} />
      <Box sx={{ mt: 'auto' }}><OutletHealth outlets={outlets} compact={compact} /></Box>
    </Stack>
  );
}

export default function AppShell({ children }) {
  const path = norm(usePathname());
  const router = useRouter();
  const { outlets, totalUnread, user, query, setQuery, toast, clearToast, logout, live } = useApp();
  const [menu, setMenu] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const name = user?.name || user?.username || '';
  const badge = { '/': totalUnread, '/outlets': outlets.filter((o) => o.disconnected).length };
  const full = FULL_BLEED.includes(path);
  const isError = /gagal|tidak|wajib|error|salah|ditolak|belum|harus|limit/i.test(toast || '');

  useEffect(() => { setDrawer(false); }, [path]);

  const submitSearch = () => { if (!FULL_BLEED.includes(path)) router.push('/'); };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '76px 1fr', lg: '244px 1fr' }, height: '100dvh', bgcolor: C.page, color: C.text, overflow: 'hidden' }}>
      {/* Sidebar: ikon saja di tablet, lengkap di desktop */}
      <Box component="aside" sx={{ display: { xs: 'none', md: 'block', lg: 'none' }, height: '100dvh' }}>
        <Sidebar path={path} compact outlets={outlets} badge={badge} />
      </Box>
      <Box component="aside" sx={{ display: { xs: 'none', lg: 'block' }, height: '100dvh' }}>
        <Sidebar path={path} outlets={outlets} badge={badge} />
      </Box>
      <Drawer open={drawer} onClose={() => setDrawer(false)} slotProps={{ paper: { sx: { width: 280, border: 0 } } }}>
        <Box sx={{ position: 'relative', height: '100%' }}>
          <IconButton aria-label="Tutup menu" onClick={() => setDrawer(false)} sx={{ position: 'absolute', right: 8, top: 10, color: '#fff', zIndex: 1 }}><Close /></IconButton>
          <Sidebar path={path} outlets={outlets} badge={badge} onNavigate={() => setDrawer(false)} />
        </Box>
      </Drawer>

      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', height: '100dvh' }}>
        <Stack component="header" direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}
          sx={{ flexShrink: 0, bgcolor: C.surface, px: { xs: 1, sm: 2.5 }, height: 64, borderBottom: `1px solid ${C.line}` }}>
          <IconButton aria-label="Buka menu" onClick={() => setDrawer(true)} sx={{ display: { md: 'none' } }}>
            <Badge badgeContent={totalUnread} color="error" max={99} variant="dot"><MenuIcon /></Badge>
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1}
            sx={{ flex: 1, maxWidth: 520, bgcolor: C.page, borderRadius: '10px', px: 1.5, height: 40, border: '1px solid transparent', '&:focus-within': { borderColor: C.green, bgcolor: C.surface } }}>
            <Search sx={{ color: C.muted, fontSize: 20 }} />
            <InputBase fullWidth placeholder="Cari nama, nomor, atau isi pesan" value={query} sx={{ fontSize: 14 }}
              inputProps={{ 'aria-label': 'Cari percakapan' }}
              onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitSearch()} />
            {query && <IconButton size="small" aria-label="Hapus pencarian" onClick={() => setQuery('')}><Close sx={{ fontSize: 18 }} /></IconButton>}
          </Stack>
          <Box sx={{ flex: { xs: 0, md: 1 } }} />
          <Tooltip title={live === 'live' ? 'Tersambung langsung: pesan baru muncul seketika' : 'Menyambung ulang ke server… pesan dicek tiap 5 detik'}>
            <Stack direction="row" alignItems="center" spacing={.8} role="status" aria-live="polite"
              sx={{ display: { xs: 'none', sm: 'flex' }, px: 1.2, height: 28, borderRadius: 14, bgcolor: live === 'live' ? C.greenSoft : '#FDF1DC' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: live === 'live' ? '#25A55F' : '#E0A33A',
                animation: live === 'live' ? 'none' : 'waPulse 1.4s ease-in-out infinite',
                '@keyframes waPulse': { '50%': { opacity: .35 } } }} />
              <Typography fontSize={12} fontWeight={600} color={live === 'live' ? C.greenDark : C.amber}>{live === 'live' ? 'Langsung' : 'Menyambung…'}</Typography>
            </Stack>
          </Tooltip>
          <Tooltip title={totalUnread ? `${totalUnread} pesan belum dibaca` : 'Tidak ada pesan baru'}>
            <IconButton component={Link} href="/" aria-label="Pesan belum dibaca">
              <Badge badgeContent={totalUnread} max={99} color="error"><NotificationsNone /></Badge>
            </IconButton>
          </Tooltip>
          <ButtonBase onClick={(e) => setMenu(e.currentTarget)} aria-haspopup="menu" aria-label="Menu akun"
            sx={{ borderRadius: '10px', px: { xs: .5, sm: 1 }, py: .5, gap: 1.2, textAlign: 'left', '&:hover': { bgcolor: C.page } }}>
            <Avatar sx={{ bgcolor: C.navy, width: 36, height: 36, fontSize: 13, fontWeight: 600 }}>{initials(name)}</Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography fontWeight={600} fontSize={14} lineHeight={1.25} noWrap sx={{ maxWidth: 160 }}>{name}</Typography>
              <Typography fontSize={12} color={C.muted}>{user?.role || (user?.is_staff ? 'Admin' : 'Agen')}</Typography>
            </Box>
            <KeyboardArrowDown sx={{ color: C.muted, display: { xs: 'none', sm: 'block' }, transform: menu ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
          </ButtonBase>
          <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 230, borderRadius: '12px', border: `1px solid ${C.line}`, boxShadow: '0 12px 32px rgba(14,42,43,.14)' } } }}>
            <Box sx={{ px: 2, py: 1.2 }}>
              <Typography fontWeight={600} fontSize={14}>{name}</Typography>
              <Typography fontSize={12.5} color={C.muted}>{user?.email || `@${user?.username || ''}`}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setMenu(null); router.push('/settings'); }}><ListItemIcon><SettingsOutlined fontSize="small" /></ListItemIcon>Pengaturan akun</MenuItem>
            <MenuItem onClick={() => { setMenu(null); logout(); }} sx={{ color: 'error.main' }}>
              <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>Keluar
            </MenuItem>
          </Menu>
        </Stack>

        <Box component="main" sx={{ flex: 1, minHeight: 0, overflow: full ? 'hidden' : 'auto', p: full ? 0 : { xs: 2, md: 3 } }}>
          {full ? children : <Box sx={{ maxWidth: 1280, mx: 'auto' }}>{children}</Box>}
        </Box>
      </Box>

      <Snackbar open={!!toast} autoHideDuration={isError ? 6000 : 3000} onClose={clearToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={isError ? 'error' : 'success'} variant="filled" onClose={clearToast}
          sx={{ bgcolor: isError ? '#B3261E' : C.navy, maxWidth: 560, alignItems: 'center' }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
