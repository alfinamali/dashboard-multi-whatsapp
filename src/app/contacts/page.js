'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, IconButton, InputBase, Stack, Typography } from '@mui/material';
import { Add, ChatBubbleOutline, DeleteOutline, Search } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, primaryBtn } from '@/lib/data';
import { DataTable, OnlineAvatar, PageHeader } from '@/components/ui';
import FormDialog from '@/components/FormDialog';

export default function ContactsPage() {
  const { contacts, outlets, addContact, removeContact, startChat, notify } = useApp();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const rows = contacts.filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Kontak" subtitle={`${contacts.length} kontak`}
        action={<Button variant="contained" startIcon={<Add />} sx={primaryBtn} onClick={() => setOpen(true)}>Tambah Kontak</Button>} />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: '#fff', border: `1px solid ${C.line}`, borderRadius: 2, px: 1.5, height: 42, mb: 2, maxWidth: 420 }}>
        <Search sx={{ color: C.muted }} />
        <InputBase fullWidth placeholder="Cari nama atau nomor..." value={q} onChange={(e) => setQ(e.target.value)} />
      </Stack>
      <DataTable rows={rows} empty="Kontak tidak ditemukan." cols={[
        { h: 'Nama', r: (c) => <Stack direction="row" spacing={1.5} alignItems="center"><OnlineAvatar name={c.name} i={c.id} size={36} /><Typography fontWeight={500}>{c.name}</Typography></Stack> },
        { h: 'Telepon', r: (c) => c.phone },
        { h: 'Outlet', r: (c) => outlets[c.outlet]?.name },
        { h: 'Aksi', sx: { width: 140 }, r: (c) => (
          <Stack direction="row">
            <IconButton aria-label="Chat" onClick={() => { startChat(c); router.push('/inbox'); }}><ChatBubbleOutline /></IconButton>
            <IconButton aria-label="Hapus" onClick={() => { removeContact(c.id); notify('Kontak dihapus'); }}><DeleteOutline /></IconButton>
          </Stack>) },
      ]} />
      <FormDialog open={open} title="Tambah Kontak" onClose={() => setOpen(false)} initial={{ outlet: 0 }}
        onSave={(v) => { addContact(v); notify('Kontak ditambahkan'); }}
        fields={[{ name: 'name', label: 'Nama', required: true }, { name: 'phone', label: 'Nomor WhatsApp', required: true },
          { name: 'outlet', label: 'Outlet', options: outlets.map((o, i) => ({ value: i, label: o.name })) }]} />
    </>
  );
}
