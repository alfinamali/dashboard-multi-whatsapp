'use client';
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material';
import { primaryBtn } from '@/lib/data';
import { useApp } from '@/store/AppContext';

// Pemakaian: <TemplateDialog open={open} onClose={() => setOpen(false)} />
export default function TemplateDialog({ open, onClose }) {
  const { saveTemplate } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('UTILITY');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const ok = await saveTemplate({ name, category, body });
    setBusy(false);
    if (ok) { setName(''); setBody(''); onClose(); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Buat Template Baru</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
        <TextField label="Nama template" value={name} onChange={(e) => setName(e.target.value)}
          helperText="Otomatis diubah ke huruf kecil dan garis bawah, mis. tes_kirim_1. Nama unik, tidak bisa dipakai ulang." />
        <TextField select label="Kategori" value={category} onChange={(e) => setCategory(e.target.value)}>
          <MenuItem value="UTILITY">Utility (transaksi, konfirmasi)</MenuItem>
          <MenuItem value="MARKETING">Marketing (promo)</MenuItem>
        </TextField>
        <TextField label="Isi pesan" value={body} onChange={(e) => setBody(e.target.value)} multiline minRows={4}
          inputProps={{ maxLength: 1024 }} helperText={`${body.length}/1024 • tanpa variabel {{1}}`} />
        <Typography fontSize={12.5} color="text.secondary">
          Template dikirim ke Meta dengan status pending. Setelah disetujui, klik Sinkronkan agar statusnya berubah.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Batal</Button>
        <Button variant="contained" onClick={submit} disabled={busy || !name.trim() || !body.trim()} sx={primaryBtn}>
          {busy ? 'Mengirim...' : 'Ajukan ke Meta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
