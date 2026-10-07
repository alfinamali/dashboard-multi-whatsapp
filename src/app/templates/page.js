'use client';
import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Add, Sync } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { primaryBtn } from '@/lib/data';
import TemplateDialog from '@/components/TemplateDialog';

export default function TemplatesPage() {
  const { templates, syncTemplates } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <Typography fontWeight={700} fontSize={18} sx={{ flex: 1 }}>Template Pesan</Typography>
        <Button startIcon={<Sync />} variant="outlined" onClick={syncTemplates} sx={{ textTransform: 'none' }}>
          Sinkronkan
        </Button>
        <Button startIcon={<Add />} variant="contained" onClick={() => setOpen(true)} sx={primaryBtn}>
          Template Baru
        </Button>
      </Stack>

      {/* daftar template Anda yang sudah ada */}
      {templates.map((t) => (
        <Box key={t.id}>{t.name} • {t.status}</Box>
      ))}

      <TemplateDialog open={open} onClose={() => setOpen(false)} />
    </Box>
  );
}