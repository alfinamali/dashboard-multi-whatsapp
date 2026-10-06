'use client';
import { useState } from 'react';
import { Box, Button, Chip, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { CalendarMonthOutlined, KeyboardArrowDown, StorefrontOutlined } from '@mui/icons-material';
import { C, card, primaryBtn } from '@/lib/data';

export default function FilterPanel({ outlets, unread, onApply }) {
  const [d, setD] = useState({ status: 'all', outlet: 'all', range: 'all' });
  const sel = { mb: 1.5, height: 44, fontSize: 14 };
  return (
    <Paper elevation={0} sx={{ ...card, p: 2.5 }}>
      <Typography fontWeight={700} fontSize={16} sx={{ mb: 1.5 }}>Filter Pesan</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {[['all', 'Semua'], ['unread', 'Belum Dibaca'], ['replied', 'Dibalas']].map(([v, l]) => {
          const on = d.status === v;
          return (
            <Chip key={v} onClick={() => setD({ ...d, status: v })} sx={{ flex: v === 'all' ? '0 0 auto' : 1, height: 36, fontWeight: 500, bgcolor: on ? C.green : '#F0F4F3', color: on ? '#fff' : C.text, '&:hover': { bgcolor: on ? C.greenDark : '#E6ECEA' } }}
              label={<Stack direction="row" spacing={.8} alignItems="center"><span>{l}</span>{v === 'unread' && <Box sx={{ px: .8, borderRadius: 2, bgcolor: '#4B5B6B', color: '#fff', fontSize: 11 }}>{unread}</Box>}</Stack>} />
          );
        })}
      </Stack>
      <Select fullWidth size="small" value={d.outlet} onChange={(e) => setD({ ...d, outlet: e.target.value })} IconComponent={KeyboardArrowDown} startAdornment={<StorefrontOutlined sx={{ mr: 1.2, color: C.muted }} />} sx={sel}>
        <MenuItem value="all">Semua Outlet</MenuItem>
        {outlets.map((o, i) => <MenuItem key={o.name} value={i}>{o.name}</MenuItem>)}
      </Select>
      <Select fullWidth size="small" value={d.range} onChange={(e) => setD({ ...d, range: e.target.value })} IconComponent={KeyboardArrowDown} startAdornment={<CalendarMonthOutlined sx={{ mr: 1.2, color: C.muted }} />} sx={{ ...sel, mb: 2 }}>
        <MenuItem value="all">Rentang Waktu</MenuItem><MenuItem value="today">24 jam terakhir</MenuItem><MenuItem value="7d">7 hari terakhir</MenuItem>
      </Select>
      <Button fullWidth variant="contained" onClick={() => onApply(d)} sx={{ ...primaryBtn, height: 46, fontSize: 15 }}>Terapkan Filter</Button>
    </Paper>
  );
}
