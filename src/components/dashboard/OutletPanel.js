'use client';
import { useMemo, useState } from 'react';
import { Avatar, Badge, Box, ButtonBase, InputBase, Stack, Tooltip, Typography } from '@mui/material';
import { AllInbox, PhoneIphone, Search } from '@mui/icons-material';
import { C, initials, outletColor } from '@/lib/data';

// Kolom daftar outlet di kotak masuk. compact = hanya ikon (laptop/tablet), selain itu lengkap.
// value: 'all' | index outlet. unreadBy: { [index]: jumlah belum dibaca }.
export default function OutletPanel({ outlets, value, onChange, unreadBy, compact = false }) {
  const [q, setQ] = useState('');
  const total = Object.values(unreadBy).reduce((a, n) => a + n, 0);
  const rows = useMemo(() => outlets.map((o, i) => ({ ...o, i }))
    .filter((o) => !q || `${o.name} ${o.city} ${o.phone}`.toLowerCase().includes(q.toLowerCase())), [outlets, q]);

  const status = (o) => (o.disconnected ? { c: '#C0392B', t: 'Terputus dari WhatsApp' } : !o.online ? { c: '#9AA8A4', t: 'Nonaktif' } : null);

  const item = ({ id, label, sub, color, n, icon, warn, phone }) => {
    const on = value === id;
    const avatar = (
      <Badge badgeContent={compact ? n : 0} max={99} color="error" overlap="circular">
        <Avatar sx={{ width: compact ? 42 : 38, height: compact ? 42 : 38, fontSize: 13, fontWeight: 700, borderRadius: '12px',
          bgcolor: on ? color : `${color}1F`, color: on ? '#fff' : color, transition: 'background-color .15s' }}>
          {icon || initials(label)}
        </Avatar>
      </Badge>
    );
    const btn = (
      <ButtonBase onClick={() => onChange(id)} aria-pressed={on} aria-label={compact ? label : undefined}
        sx={{
          width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1.4,
          px: compact ? 0 : 1.2, py: 1, borderRadius: '12px', justifyContent: compact ? 'center' : 'flex-start', position: 'relative',
          bgcolor: on && !compact ? `${color}14` : 'transparent', '&:hover': { bgcolor: on && !compact ? `${color}14` : C.chatBg },
        }}>
        {avatar}
        {!compact && (
          <>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={.6}>
                <Typography fontSize={14} fontWeight={n || on ? 700 : 600} noWrap sx={{ color: on ? color : C.text }}>{label}</Typography>
                {phone && <Tooltip title="Juga aktif di aplikasi WhatsApp Business HP"><PhoneIphone sx={{ fontSize: 13, color: C.muted, flexShrink: 0 }} /></Tooltip>}
              </Stack>
              <Stack direction="row" alignItems="center" spacing={.6}>
                {warn && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: warn.c, flexShrink: 0 }} />}
                <Typography fontSize={12} color={warn ? warn.c : C.muted} noWrap>{warn ? warn.t : sub}</Typography>
              </Stack>
            </Box>
            {n > 0 && (
              <Box sx={{ minWidth: 22, height: 22, px: .7, borderRadius: 11, bgcolor: C.green, color: '#fff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{n > 99 ? '99+' : n}</Box>
            )}
          </>
        )}
        {compact && warn && <Box sx={{ position: 'absolute', bottom: 8, right: 14, width: 10, height: 10, borderRadius: '50%', bgcolor: warn.c, border: '2px solid #fff' }} />}
      </ButtonBase>
    );
    return compact
      ? <Tooltip key={id} title={`${label}${n ? ` · ${n} belum dibaca` : ''}${warn ? ` · ${warn.t}` : ''}`} placement="right">{btn}</Tooltip>
      : <Box key={id}>{btn}</Box>;
  };

  return (
    <Box component="nav" aria-label="Pilih outlet"
      sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', borderRight: { md: `1px solid ${C.line}` }, bgcolor: C.surface }}>
      {!compact && (
        <Box sx={{ px: 2, pt: 2, pb: 1.2 }}>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between">
            <Typography component="h1" fontWeight={700} fontSize={20}>Kotak masuk</Typography>
            <Typography fontSize={13} color={C.muted}>{outlets.length} outlet</Typography>
          </Stack>
          {outlets.length > 6 && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.4, bgcolor: C.page, borderRadius: '10px', px: 1.2, height: 36 }}>
              <Search sx={{ fontSize: 18, color: C.muted }} />
              <InputBase fullWidth placeholder="Cari outlet" value={q} onChange={(e) => setQ(e.target.value)} sx={{ fontSize: 13.5 }} inputProps={{ 'aria-label': 'Cari outlet' }} />
            </Stack>
          )}
        </Box>
      )}
      <Stack spacing={.4} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: compact ? 1 : 1.2, pt: compact ? 1.5 : 0, pb: 2 }}>
        {!q && item({ id: 'all', label: 'Semua outlet', sub: 'Gabungan semua chat', color: C.navy, n: total, icon: <AllInbox sx={{ fontSize: 20 }} /> })}
        {!compact && !q && outlets.length > 0 && <Box sx={{ height: '1px', flexShrink: 0, bgcolor: C.lineSoft, mx: 1, my: .6 }} />}
        {rows.map((o) => item({ id: o.i, label: o.name, sub: o.city ? `${o.city} · ${o.phone}` : o.phone,
          color: outletColor(o.i), n: unreadBy[o.i] || 0, warn: status(o), phone: o.mode === 'coexist' }))}
        {!rows.length && (
          <Typography fontSize={13} color={C.muted} sx={{ px: 1.5, py: 2 }}>
            {q ? 'Outlet tidak ditemukan.' : 'Belum ada outlet. Hubungkan nomor WhatsApp di menu Outlet.'}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
