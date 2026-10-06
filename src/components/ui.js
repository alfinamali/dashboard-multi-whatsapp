'use client';
import { Avatar, Badge, Box, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { ArrowUpward } from '@mui/icons-material';
import { AVATAR_COLORS, C, card, initials } from '@/lib/data';

export const CountPill = ({ n, color = C.green }) => (
  <Box sx={{ minWidth: 24, height: 24, px: 0.8, borderRadius: 12, bgcolor: color, color: '#fff', fontSize: 12, fontWeight: 600, display: 'grid', placeItems: 'center' }}>{n}</Box>
);

export const OnlineAvatar = ({ name, i = 0, size = 44 }) => (
  <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot"
    sx={{ '& .MuiBadge-badge': { bgcolor: '#22C55E', border: '2px solid #fff', width: 12, height: 12, borderRadius: '50%' } }}>
    <Avatar sx={{ width: size, height: size, bgcolor: AVATAR_COLORS[i % 5], color: '#fff', fontSize: 14, fontWeight: 600 }}>{initials(name)}</Avatar>
  </Badge>
);

export const StatCard = ({ icon, color, label, hint, value, delta, sub }) => (
  <Paper elevation={0} sx={{ ...card, p: 2.5, display: 'flex', gap: 2, alignItems: 'center' }}>
    <Avatar sx={{ width: 56, height: 56, bgcolor: color }}>{icon}</Avatar>
    <Box>
      <Typography sx={{ fontSize: 14 }}>{label} {hint && <span style={{ color: C.muted }}>{hint}</span>}</Typography>
      <Stack direction="row" alignItems="baseline" spacing={1.2}>
        <Typography sx={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3 }}>{value}</Typography>
        {delta && <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.green, display: 'flex', alignItems: 'center' }}><ArrowUpward sx={{ fontSize: 14 }} />{delta}</Typography>}
      </Stack>
      <Typography sx={{ fontSize: 12.5, color: C.muted }}>{sub}</Typography>
    </Box>
  </Paper>
);

export const PageHeader = ({ title, subtitle, action }) => (
  <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: 13.5, color: C.muted }}>{subtitle}</Typography>}
    </Box>
    {action}
  </Stack>
);

// cols: [{ h: 'Judul', r: (row) => node, sx? }]
export function DataTable({ cols, rows, empty = 'Belum ada data.' }) {
  return (
    <Paper elevation={0} sx={{ ...card, overflow: 'auto' }}>
      <Table>
        <TableHead><TableRow>{cols.map((c) => <TableCell key={c.h} sx={{ fontWeight: 600, color: C.muted, ...c.sx }}>{c.h}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {rows.map((r, i) => <TableRow key={r.id ?? i} hover>{cols.map((c) => <TableCell key={c.h}>{c.r(r)}</TableCell>)}</TableRow>)}
          {!rows.length && <TableRow><TableCell colSpan={cols.length} align="center" sx={{ color: C.muted, py: 4 }}>{empty}</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Paper>
  );
}
