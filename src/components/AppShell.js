'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Alert, Avatar, Badge, Box, ButtonBase, Chip, Divider, InputBase, ListItemIcon, Menu, MenuItem, Snackbar, Stack, Typography,
} from '@mui/material';
import {
  ChatBubbleOutline, DescriptionOutlined, HomeRounded, KeyboardArrowDown, Logout, NotificationsNone,
  PeopleAltOutlined, Search, SendOutlined, SettingsOutlined, StorefrontOutlined, WhatsApp,
} from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, initials } from '@/lib/data';

const NAV = [
  ['Dashboard', <HomeRounded key="a" />, '/'], ['Pesan Masuk', <ChatBubbleOutline key="b" />, '/inbox'],
  ['Semua Outlet', <StorefrontOutlined key="c" />, '/outlets'], ['Kontak', <PeopleAltOutlined key="d" />, '/contacts'],
  ['Pesan Terkirim', <SendOutlined key="e" />, '/sent'], ['Template Pesan', <DescriptionOutlined key="f" />, '/templates'],
  ['Pengaturan', <SettingsOutlined key="g" />, '/settings'],
];

export default function AppShell({ children }) {
  const path = usePathname(), router = useRouter();
  const { outlets, totalUnread, user, query, setQuery, toast, clearToast, logout } = useApp();
  const [menu, setMenu] = useState(null);
  const name = user?.name || user?.username || '';
  const go = (href) => { setMenu(null); router.push(href); };
  const online = outlets.filter((o) => o.online).length;
  const badge = { '/inbox': totalUnread, '/outlets': outlets.length };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '282px 1fr' }, minHeight: '100dvh', bgcolor: C.page, color: C.text }}>
      <Box sx={{ bgcolor: C.navy, color: '#fff', display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', p: 2.5, position: 'sticky', top: 0, height: '100dvh' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pb: 2.5, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <Avatar variant="rounded" sx={{ bgcolor: '#22C55E', width: 38, height: 38 }}><WhatsApp /></Avatar>
          <Box><Typography fontWeight={700} fontSize={16}>WhatsApp Multi Outlet</Typography>
            <Typography fontSize={12} sx={{ opacity: .75 }}>Kelola {outlets.length} Outlet, Satu Dashboard</Typography></Box>
        </Stack>
        <Stack spacing={0.5} sx={{ mt: 2.5 }}>
          {NAV.map(([label, icon, href]) => {
            const on = path === href;
            return (
              <Stack key={href} component={Link} href={href} direction="row" alignItems="center" spacing={1.8}
                sx={{ px: 1.8, py: 1.3, borderRadius: 2, textDecoration: 'none', bgcolor: on ? C.green : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.82)', '&:hover': { bgcolor: on ? C.green : 'rgba(255,255,255,.06)' } }}>
                {icon}<Typography sx={{ flex: 1, fontSize: 15 }}>{label}</Typography>
                {badge[href] > 0 && <Box sx={{ px: 1, py: .2, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,.12)', fontSize: 12.5 }}>{badge[href]}</Box>}
              </Stack>
            );
          })}
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: online === outlets.length ? '#22C55E' : '#F59E0B' }} />
          <Box><Typography fontSize={12.5} fontWeight={600}>{online === outlets.length ? 'Semua Outlet Online' : 'Ada Outlet Offline'}</Typography>
            <Typography fontSize={12} sx={{ opacity: .7 }}>{online} / {outlets.length} aktif</Typography></Box>
        </Stack>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ bgcolor: '#fff', px: 3, height: 72, borderBottom: `1px solid ${C.line}` }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, maxWidth: 470, border: `1px solid ${C.line}`, borderRadius: 2, px: 1.5, height: 40, bgcolor: '#FAFCFB' }}>
            <Search sx={{ color: C.muted }} />
            <InputBase fullWidth placeholder="Cari pesan atau nama kontak lalu Enter..." value={query} sx={{ fontSize: 14 }}
              onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && router.push('/inbox')} />
          </Stack>
          <Box sx={{ flex: 1 }} />
          <Link href="/inbox" aria-label="Pesan belum dibaca"><Badge badgeContent={totalUnread} max={99} color="error"><NotificationsNone sx={{ color: C.text }} /></Badge></Link>
          <ButtonBase onClick={(e) => setMenu(e.currentTarget)} aria-haspopup="menu" aria-label="Menu akun"
            sx={{ borderRadius: 2, px: 1, py: .5, gap: 1.2, textAlign: 'left', '&:hover': { bgcolor: '#F3F6F5' } }}>
            <Avatar sx={{ bgcolor: '#2B4AA8', width: 40, height: 40, fontSize: 14 }}>{name ? initials(name) : '?'}</Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}><Typography fontWeight={600} fontSize={14} lineHeight={1.2}>{name}</Typography>
              <Typography fontSize={12} color={C.muted}>{user?.role || (user?.is_staff ? 'Admin' : 'Agen')}</Typography></Box>
            <KeyboardArrowDown sx={{ color: C.muted, transform: menu ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
          </ButtonBase>
          <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 2 } } }}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography fontWeight={600} fontSize={14}>{name}</Typography>
              <Typography fontSize={12.5} color={C.muted}>{user?.email || `@${user?.username || ''}`}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => go('/settings')}><ListItemIcon><SettingsOutlined fontSize="small" /></ListItemIcon>Pengaturan akun</MenuItem>
            <MenuItem onClick={() => { setMenu(null); logout(); }} sx={{ color: 'error.main' }}>
              <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>Keluar
            </MenuItem>
          </Menu>
        </Stack>

        {/* Navigasi mobile */}
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'flex', lg: 'none' }, overflowX: 'auto', p: 1.5, bgcolor: '#fff', borderBottom: `1px solid ${C.line}` }}>
          {NAV.map(([label, , href]) => <Chip key={href} component={Link} href={href} clickable label={label} color={path === href ? 'primary' : 'default'} />)}
        </Stack>

        <Box sx={{ p: { xs: 2, md: 2.5 } }}>{children}</Box>
      </Box>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={clearToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" onClose={clearToast} sx={{ bgcolor: C.green }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
