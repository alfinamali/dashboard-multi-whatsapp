'use client';
import { Avatar, Box, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AVATAR_COLORS, C, card, initials } from '@/lib/data';

export const CountPill = ({ n, color = C.green }) => (
  <Box sx={{ minWidth: 24, height: 22, px: 0.8, borderRadius: 11, bgcolor: n ? color : C.lineSoft, color: n ? '#fff' : C.muted, fontSize: 12, fontWeight: 700, display: 'inline-grid', placeItems: 'center' }}>{n}</Box>
);

// Avatar inisial. Nama lama dipertahankan; titik "online" palsu dihapus.
export const OnlineAvatar = ({ name, i = 0, size = 40 }) => {
  const col = AVATAR_COLORS[Math.abs(Number(i) || 0) % AVATAR_COLORS.length];
  return <Avatar sx={{ width: size, height: size, bgcolor: `${col}22`, color: col, fontSize: size > 38 ? 14 : 13, fontWeight: 600 }}>{initials(name)}</Avatar>;
};

export const StatCard = ({ icon, color, label, value, sub }) => (
  <Paper elevation={0} sx={{ ...card, p: 2.5, display: 'flex', gap: 2, alignItems: 'center' }}>
    <Avatar sx={{ width: 48, height: 48, bgcolor: `${color}1F`, color }}>{icon}</Avatar>
    <Box>
      <Typography fontSize={13.5} color={C.muted}>{label}</Typography>
      <Typography fontSize={26} fontWeight={700} lineHeight={1.25}>{value}</Typography>
      {sub && <Typography fontSize={12.5} color={C.muted}>{sub}</Typography>}
    </Box>
  </Paper>
);

export const PageHeader = ({ title, subtitle, action }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'flex-end' }} spacing={1.5} sx={{ mb: 2.5 }}>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography component="h1" sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 700, lineHeight: 1.2 }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: 14, color: C.muted, mt: .5 }}>{subtitle}</Typography>}
    </Box>
    {action && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, '& > *': { flexShrink: 0 } }}>{action}</Box>}
  </Stack>
);

// cols: [{ h: 'Judul', r: (row) => node, sx? }]
// Di layar kecil tabel berubah menjadi kartu per baris (label di kiri, nilai di kanan) agar tidak perlu geser horizontal.
export function DataTable({ cols, rows, empty = 'Belum ada data.' }) {
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down('md'));

  if (small) {
    const [head, ...rest] = cols;
    const actions = rest.filter((c) => !c.h.trim() || c.h === 'Aksi');
    const fields = rest.filter((c) => !actions.includes(c));
    return (
      <Stack spacing={1.2}>
        {!rows.length && <Paper elevation={0} sx={{ ...card, p: 4, textAlign: 'center', color: C.muted, fontSize: 14 }}>{empty}</Paper>}
        {rows.map((r, i) => (
          <Paper key={r.id ?? i} elevation={0} sx={{ ...card, p: 2 }}>
            <Box sx={{ mb: fields.length ? 1.2 : 0 }}>{head.r(r)}</Box>
            {fields.map((c) => (
              <Stack key={c.h} direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ py: .7, borderTop: `1px solid ${C.lineSoft}` }}>
                <Typography fontSize={12.5} color={C.muted} sx={{ flexShrink: 0 }}>{c.h}</Typography>
                <Box sx={{ fontSize: 13.5, textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{c.r(r)}</Box>
              </Stack>
            ))}
            {actions.length > 0 && <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1, borderTop: `1px solid ${C.lineSoft}` }}>{actions.map((c) => <Box key={c.h}>{c.r(r)}</Box>)}</Stack>}
          </Paper>
        ))}
      </Stack>
    );
  }

  return (
    <Paper elevation={0} sx={{ ...card, overflow: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>{cols.map((c) => <TableCell key={c.h} sx={{ fontWeight: 600, fontSize: 12.5, color: C.muted, bgcolor: C.chatBg, borderColor: C.line, whiteSpace: 'nowrap', ...c.sx }}>{c.h}</TableCell>)}</TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.id ?? i} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
              {cols.map((c) => <TableCell key={c.h} sx={{ borderColor: C.lineSoft, fontSize: 14, ...c.sx }}>{c.r(r)}</TableCell>)}
            </TableRow>
          ))}
          {!rows.length && <TableRow><TableCell colSpan={cols.length} align="center" sx={{ color: C.muted, py: 6, border: 0 }}>{empty}</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Paper>
  );
}
