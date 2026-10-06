'use client';
import { useState } from 'react';
import { Box, Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Add, DeleteOutline, EditOutlined } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, card, primaryBtn } from '@/lib/data';
import { PageHeader } from '@/components/ui';
import FormDialog from '@/components/FormDialog';

const STATUS = { approved: ['Disetujui', 'success'], pending: ['Menunggu', 'warning'], rejected: ['Ditolak', 'error'] };

export default function TemplatesPage() {
  const { templates, saveTemplate, removeTemplate, notify } = useApp();
  const [edit, setEdit] = useState(null); // null = tutup, {} = baru
  return (
    <>
      <PageHeader title="Template Pesan" subtitle="Hanya template berstatus Disetujui yang bisa dikirim di luar jendela 24 jam"
        action={<Button variant="contained" startIcon={<Add />} sx={primaryBtn} onClick={() => setEdit({ category: 'Utility', status: 'pending' })}>Template Baru</Button>} />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: 'repeat(3, 1fr)' } }}>
        {templates.map((t) => (
          <Paper key={t.id} elevation={0} sx={{ ...card, p: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography fontWeight={700} sx={{ flex: 1 }}>{t.name}</Typography>
              <Chip size="small" label={STATUS[t.status][0]} color={STATUS[t.status][1]} />
            </Stack>
            <Chip size="small" variant="outlined" label={t.category} sx={{ mb: 1.5 }} />
            <Typography fontSize={14} color={C.muted} sx={{ minHeight: 60 }}>{t.body}</Typography>
            <Stack direction="row" justifyContent="flex-end">
              <IconButton aria-label="Ubah" onClick={() => setEdit(t)}><EditOutlined /></IconButton>
              <IconButton aria-label="Hapus" onClick={() => { removeTemplate(t.id); notify('Template dihapus'); }}><DeleteOutline /></IconButton>
            </Stack>
          </Paper>
        ))}
      </Box>
      <FormDialog open={!!edit} title={edit?.id ? 'Ubah Template' : 'Template Baru'} initial={edit ?? {}} onClose={() => setEdit(null)}
        onSave={(v) => { saveTemplate(v); notify('Template disimpan'); }}
        fields={[{ name: 'name', label: 'Nama template', required: true },
          { name: 'category', label: 'Kategori', options: ['Utility', 'Marketing', 'Authentication'].map((x) => ({ value: x, label: x })) },
          { name: 'body', label: 'Isi pesan', multiline: true, required: true },
          { name: 'status', label: 'Status (simulasi persetujuan Meta)', options: Object.entries(STATUS).map(([value, [label]]) => ({ value, label })) }]} />
    </>
  );
}
