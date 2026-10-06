'use client';
import { useState } from 'react';
import { Chip, MenuItem, Select, Stack } from '@mui/material';
import { DoneAll } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C } from '@/lib/data';
import { DataTable, PageHeader } from '@/components/ui';

export default function SentPage() {
  const { convs, outlets } = useApp();
  const [type, setType] = useState('all');
  const rows = convs
    .flatMap((c) => c.msgs.filter((m) => m.dir === 'out').map((m, i) => ({ ...m, id: `${c.id}-${i}`, to: c.name, outlet: outlets[c.outlet].name })))
    .filter((r) => type === 'all' || (type === 'template' ? r.template : !r.template))
    .sort((a, b) => b.at - a.at);
  return (
    <>
      <PageHeader title="Pesan Terkirim" subtitle={`${rows.length} pesan`}
        action={<Select size="small" value={type} onChange={(e) => setType(e.target.value)} sx={{ bgcolor: '#fff', minWidth: 160 }}>
          <MenuItem value="all">Semua jenis</MenuItem><MenuItem value="template">Template</MenuItem><MenuItem value="text">Teks biasa</MenuItem></Select>} />
      <DataTable rows={rows} empty="Belum ada pesan terkirim." cols={[
        { h: 'Waktu', r: (r) => new Date(r.at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) },
        { h: 'Penerima', r: (r) => r.to }, { h: 'Outlet', r: (r) => r.outlet },
        { h: 'Pesan', sx: { maxWidth: 360 }, r: (r) => r.text },
        { h: 'Jenis', r: (r) => <Chip size="small" label={r.template ? 'Template' : r.auto ? 'Otomatis' : 'Teks'} /> },
        { h: 'Status', r: () => <Stack direction="row" spacing={.5} alignItems="center" sx={{ color: C.blue }}><DoneAll fontSize="small" /><span>Terkirim</span></Stack> },
      ]} />
    </>
  );
}
