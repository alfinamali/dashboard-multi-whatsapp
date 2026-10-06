'use client';
import { useState } from 'react';
import { Avatar, Button, Switch, Stack, Typography } from '@mui/material';
import { Add, StorefrontOutlined } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, primaryBtn } from '@/lib/data';
import { CountPill, DataTable, PageHeader } from '@/components/ui';
import FormDialog from '@/components/FormDialog';

export default function OutletsPage() {
  const { outlets, toggleOutlet, addOutlet, notify } = useApp();
  const [open, setOpen] = useState(false);
  const rows = outlets.map((o, i) => ({ ...o, id: i }));
  return (
    <>
      <PageHeader title="Semua Outlet" subtitle={`${outlets.length} outlet terdaftar`}
        action={<Button variant="contained" startIcon={<Add />} sx={primaryBtn} onClick={() => setOpen(true)}>Tambah Outlet</Button>} />
      <DataTable rows={rows} cols={[
        { h: 'Outlet', r: (o) => <Stack direction="row" spacing={1.5} alignItems="center"><Avatar sx={{ bgcolor: o.online ? C.green : '#9CA3AF', width: 36, height: 36 }}><StorefrontOutlined fontSize="small" /></Avatar><Typography fontWeight={500}>{o.name}</Typography></Stack> },
        { h: 'Nomor WhatsApp', r: (o) => o.phone },
        { h: 'Belum dibaca', r: (o) => <CountPill n={o.unread} color={o.unread ? C.green : '#9CA3AF'} /> },
        { h: 'Online', r: (o) => <Switch checked={o.online} color="success" onChange={() => toggleOutlet(o.id)} /> },
      ]} />
      <FormDialog open={open} title="Tambah Outlet" onClose={() => setOpen(false)} onSave={(v) => { addOutlet(v); notify(`${v.name} ditambahkan`); }}
        fields={[{ name: 'name', label: 'Nama outlet', required: true }, { name: 'phone', label: 'Nomor WhatsApp', required: true }]} />
    </>
  );
}
