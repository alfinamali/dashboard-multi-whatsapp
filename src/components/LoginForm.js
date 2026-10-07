'use client';
import { useState } from 'react';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { C, card, primaryBtn } from '@/lib/data';

export default function LoginForm({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await onLogin(u, p); }
    catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: C.page, p: 2 }}>
      <Paper elevation={0} component="form" onSubmit={submit} sx={{ ...card, p: 3.5, width: 360, display: 'grid', gap: 2 }}>
        <Typography fontWeight={700} fontSize={20}>Masuk</Typography>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField label="Username" value={u} onChange={(e) => setU(e.target.value)} autoFocus required />
        <TextField label="Password" type="password" value={p} onChange={(e) => setP(e.target.value)} required />
        <Button type="submit" variant="contained" disabled={busy} sx={{ ...primaryBtn, height: 44 }}>
          {busy ? 'Memproses...' : 'Masuk'}
        </Button>
      </Paper>
    </Box>
  );
}