'use client';
import { useState } from 'react';
import { Alert, Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff, WhatsApp } from '@mui/icons-material';
import { C } from '@/lib/data';

export default function LoginForm({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await onLogin(u, p); }
    catch (x) { setErr(x.status === 400 ? 'Username atau password salah.' : x.message); setBusy(false); }
  };

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, bgcolor: C.surface }}>
      <Stack justifyContent="space-between" sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: C.navy, color: '#fff', p: 6 }}>
        <Stack direction="row" spacing={1.4} alignItems="center">
          <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#25D366', display: 'grid', placeItems: 'center' }}><WhatsApp sx={{ color: '#0B3B22' }} /></Box>
          <Typography fontWeight={700} fontSize={17}>Multi Outlet</Typography>
        </Stack>
        <Box sx={{ maxWidth: 440 }}>
          <Typography sx={{ fontSize: 38, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            Semua chat WhatsApp outlet, satu kotak masuk.
          </Typography>
          <Typography sx={{ mt: 2, fontSize: 16, color: 'rgba(255,255,255,.7)', lineHeight: 1.6 }}>
            Balas pelanggan dari dashboard atau tetap dari HP outlet. Semua percakapan tercatat di tempat yang sama.
          </Typography>
        </Box>
        <Typography fontSize={13} color="rgba(255,255,255,.5)">Hanya untuk tim internal.</Typography>
      </Stack>

      <Stack justifyContent="center" alignItems="center" sx={{ p: { xs: 3, sm: 6 } }}>
        <Box component="form" onSubmit={submit} sx={{ width: '100%', maxWidth: 380, display: 'grid', gap: 2.2 }}>
          <Stack direction="row" spacing={1.4} alignItems="center" sx={{ display: { md: 'none' }, mb: 1 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#25D366', display: 'grid', placeItems: 'center' }}><WhatsApp sx={{ color: '#0B3B22' }} /></Box>
            <Typography fontWeight={700} fontSize={17}>Multi Outlet</Typography>
          </Stack>
          <Box>
            <Typography component="h1" fontWeight={700} fontSize={26}>Masuk</Typography>
            <Typography fontSize={14} color={C.muted} sx={{ mt: .5 }}>Gunakan akun yang dibuat oleh admin.</Typography>
          </Box>
          {err && <Alert severity="error">{err}</Alert>}
          <TextField label="Username" value={u} onChange={(e) => setU(e.target.value)} autoFocus required autoComplete="username" />
          <TextField label="Password" type={show ? 'text' : 'password'} value={p} onChange={(e) => setP(e.target.value)} required autoComplete="current-password"
            slotProps={{ input: { endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'} onClick={() => setShow(!show)} edge="end">{show ? <VisibilityOff /> : <Visibility />}</IconButton>
              </InputAdornment>
            ) } }} />
          <Button type="submit" variant="contained" size="large" disabled={busy || !u || !p} sx={{ height: 48, fontSize: 15 }}>
            {busy ? 'Memeriksa…' : 'Masuk'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
