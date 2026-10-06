'use client';
import { useEffect, useState } from 'react';
import { Button, FormControlLabel, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { RestartAlt } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, card, primaryBtn } from '@/lib/data';
import { PageHeader } from '@/components/ui';

export default function SettingsPage() {
  const { settings, saveSettings, reset } = useApp();
  const [s, setS] = useState(settings);
  useEffect(() => setS(settings), [settings]);
  const set = (k) => (e) => setS({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Preferensi akun dan balasan otomatis (simulasi)" />
      <Stack spacing={2} sx={{ maxWidth: 640 }}>
        <Paper elevation={0} sx={{ ...card, p: 2.5 }}>
          <Typography fontWeight={700} sx={{ mb: 2 }}>Profil</Typography>
          <Stack spacing={2}>
            <TextField label="Nama" value={s.name} onChange={set('name')} />
            <TextField label="Email" value={s.email} onChange={set('email')} />
          </Stack>
        </Paper>
        <Paper elevation={0} sx={{ ...card, p: 2.5 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>Notifikasi</Typography>
          <Stack>
            <FormControlLabel control={<Switch color="success" checked={s.notif} onChange={set('notif')} />} label="Tampilkan notifikasi pesan baru" />
            <FormControlLabel control={<Switch color="success" checked={s.sound} onChange={set('sound')} />} label="Suara notifikasi" />
          </Stack>
        </Paper>
        <Paper elevation={0} sx={{ ...card, p: 2.5 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>Balasan otomatis</Typography>
          <Typography fontSize={13} color={C.muted} sx={{ mb: 1 }}>Saat aktif, tombol "Simulasi pesan masuk" juga mengirim balasan otomatis ini.</Typography>
          <FormControlLabel control={<Switch color="success" checked={s.autoReply} onChange={set('autoReply')} />} label="Aktifkan" />
          <TextField fullWidth multiline minRows={2} value={s.autoReplyText} onChange={set('autoReplyText')} disabled={!s.autoReply} sx={{ mt: 1 }} />
        </Paper>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" sx={primaryBtn} onClick={() => saveSettings(s)}>Simpan</Button>
          <Button variant="outlined" color="inherit" startIcon={<RestartAlt />} sx={{ textTransform: 'none' }} onClick={reset}>Reset data demo</Button>
        </Stack>
      </Stack>
    </>
  );
}
