'use client';
import { useEffect, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Switch,
  TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, LinkOutlined, PhoneIphone, StorefrontOutlined, Sync, WhatsApp } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, outletColor, primaryBtn } from '@/lib/data';
import { CountPill, DataTable, PageHeader } from '@/components/ui';
import FormDialog from '@/components/FormDialog';
import { signupConfigured } from '@/lib/embeddedSignup';

const DAY = 24 * 3600 * 1000;
const REASONS = {
  PRIMARY_INACTIVITY: 'Aplikasi WhatsApp Business di HP tidak dibuka terlalu lama',
  PARTNER_REMOVED: 'Diputus dari HP (Pengaturan > Akun > Business Platform)',
  ACCOUNT_OFFBOARDED: 'Akun dilepas dari platform',
};

function ModeChip({ o }) {
  if (o.disconnected) {
    return <Tooltip title={REASONS[o.disconnected] || o.disconnected}><Chip size="small" color="error" variant="outlined" label="Terputus" /></Tooltip>;
  }
  if (o.mode === 'coexist') {
    return <Chip size="small" color="success" variant="outlined" icon={<PhoneIphone sx={{ fontSize: 16 }} />} label="HP + Dashboard" />;
  }
  return <Chip size="small" variant="outlined" label={o.phoneNumberId ? 'Dashboard saja' : 'Belum terhubung'} />;
}

function SyncInfo({ o, i, onRetry }) {
  if (o.mode !== 'coexist') return <Typography fontSize={12.5} color={C.muted}>—</Typography>;
  const pending = !o.contactsSynced || !o.historySynced;
  const canRetry = pending && !!o.connectedAt && Date.now() - o.connectedAt < DAY;
  return (
    <Stack spacing={0.3}>
      <Typography fontSize={12.5}>Kontak: {o.contactsSynced ? 'diminta' : 'belum'} · Riwayat: {o.historySynced ? `${o.historyProgress}%` : 'belum'}</Typography>
      {canRetry && <Button size="small" startIcon={<Sync />} onClick={() => onRetry(i)} sx={{ textTransform: 'none', alignSelf: 'flex-start', p: 0 }}>Ulangi sinkron</Button>}
      {pending && !canRetry && <Typography fontSize={11.5} color="warning.main">Batas 24 jam lewat; hubungkan ulang untuk sinkron.</Typography>}
    </Stack>
  );
}

export default function OutletsPage() {
  const { outlets, user, toggleOutlet, addOutlet, connectWhatsApp, retrySync, reloadOutlets } = useApp();
  const staff = !!user?.is_staff;
  const [manual, setManual] = useState(false);
  const [connect, setConnect] = useState(null); // { outletIndex, name, city }
  const [busy, setBusy] = useState(false);
  const rows = outlets.map((o, i) => ({ ...o, idx: i }));

  // progres sinkron riwayat datang lewat webhook; segarkan saat halaman dibuka & tiap 15 detik
  useEffect(() => {
    reloadOutlets().catch(() => {});
    const t = setInterval(() => { if (!document.hidden) reloadOutlets().catch(() => {}); }, 15000);
    return () => clearInterval(t);
  }, [reloadOutlets]);

  const startConnect = async () => {
    setBusy(true);
    const res = await connectWhatsApp(connect);
    setBusy(false);
    if (res) setConnect(null);
  };

  return (
    <>
      <PageHeader title="Outlet" subtitle={`${outlets.length} nomor WhatsApp outlet terhubung ke dashboard`}
        action={staff && (
          <>
            <Button variant="outlined" startIcon={<Add />} onClick={() => setManual(true)}>Tambah manual</Button>
            <Button variant="contained" startIcon={<WhatsApp />} sx={primaryBtn} onClick={() => setConnect({ outletIndex: '', name: '', city: '' })}>Hubungkan nomor WhatsApp</Button>
          </>
        )} />

      <DataTable rows={rows} cols={[
        { h: 'Outlet', r: (o) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: o.online ? `${outletColor(o.idx)}1F` : C.lineSoft, color: o.online ? outletColor(o.idx) : C.muted, width: 38, height: 38 }}><StorefrontOutlined fontSize="small" /></Avatar>
            <Box>
              <Typography fontWeight={500}>{o.name}</Typography>
              <Typography fontSize={12} color={C.muted}>{[o.city, o.verifiedName].filter(Boolean).join(' · ')}</Typography>
            </Box>
          </Stack>
        ) },
        { h: 'Nomor WhatsApp', r: (o) => o.phone },
        { h: 'Mode', r: (o) => <ModeChip o={o} /> },
        { h: 'Sinkron HP', r: (o) => <SyncInfo o={o} i={o.idx} onRetry={retrySync} /> },
        { h: 'Belum dibaca', r: (o) => <CountPill n={o.unread} color={o.unread ? C.green : '#9CA3AF'} /> },
        { h: 'Aktif', r: (o) => <Switch checked={o.online} color="success" disabled={!staff} onChange={() => toggleOutlet(o.idx)} /> },
        ...(staff ? [{ h: ' ', r: (o) => (
          <Button size="small" startIcon={<LinkOutlined />} sx={{ textTransform: 'none' }}
            onClick={() => setConnect({ outletIndex: o.idx, name: '', city: '' })}>
            {o.mode === 'coexist' && !o.disconnected ? 'Hubungkan ulang' : 'Hubungkan'}
          </Button>
        ) }] : []),
      ]} />

      <Dialog open={!!connect} onClose={() => !busy && setConnect(null)} fullWidth maxWidth="sm">
        <DialogTitle>Hubungkan nomor WhatsApp outlet</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {!signupConfigured() && <Alert severity="error">NEXT_PUBLIC_FB_APP_ID / NEXT_PUBLIC_WA_CONFIG_ID belum diisi di .env frontend.</Alert>}
            {typeof window !== 'undefined' && window.location.protocol !== 'https:' && (
              <Alert severity="warning">Meta hanya mengizinkan dari HTTPS. Jalankan <b>npm run dev:https</b> lalu buka <b>https://localhost:3000</b>.</Alert>
            )}
            <TextField select label="Untuk outlet" value={connect?.outletIndex ?? ''}
              slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
              onChange={(e) => setConnect({ ...connect, outletIndex: e.target.value })}>
              <MenuItem value="">+ Buat outlet baru</MenuItem>
              {outlets.map((o, i) => <MenuItem key={o.id} value={i}>{o.name} ({o.phone})</MenuItem>)}
            </TextField>
            {connect?.outletIndex === '' && (
              <Stack direction="row" spacing={2}>
                <TextField fullWidth label="Nama outlet" value={connect.name} onChange={(e) => setConnect({ ...connect, name: e.target.value })}
                  helperText="Kosongkan = pakai nama bisnis di WhatsApp" />
                <TextField fullWidth label="Kota" value={connect.city} onChange={(e) => setConnect({ ...connect, city: e.target.value })} />
              </Stack>
            )}
            <Alert severity="info" icon={<PhoneIphone />}>
              <Typography fontSize={13.5} fontWeight={600} gutterBottom>Agar nomor tetap bisa dipakai di HP dan di dashboard:</Typography>
              <Typography component="ol" fontSize={13} sx={{ pl: 2, m: 0, '& li': { mb: .4 } }}>
                <li>Nomor harus sudah aktif di <b>aplikasi WhatsApp Business</b> (bukan WhatsApp biasa), versi terbaru.</li>
                <li>Di jendela Meta, pilih <b>hubungkan aplikasi WhatsApp Business yang sudah ada</b>, lalu masukkan nomornya.</li>
                <li>Buka WhatsApp Business di HP outlet dan <b>pindai QR</b> / setujui permintaan yang muncul. Izinkan berbagi riwayat chat agar chat lama ikut masuk dashboard.</li>
                <li>Setelah terhubung, buka aplikasi di HP secara rutin. Jika lama tidak dibuka, Meta memutus koneksi.</li>
              </Typography>
            </Alert>
            <Typography fontSize={12.5} color={C.muted}>
              Pesan yang dibalas dari HP otomatis ikut tampil di dashboard (label &quot;dari HP&quot;). Grup, panggilan, siaran, dan pesan sekali lihat tidak tersedia setelah terhubung.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConnect(null)} disabled={busy} sx={{ textTransform: 'none' }}>Batal</Button>
          <Button variant="contained" startIcon={<WhatsApp />} sx={primaryBtn} disabled={busy || !signupConfigured()} onClick={startConnect}>
            {busy ? 'Menunggu Meta...' : 'Lanjut ke Meta'}
          </Button>
        </DialogActions>
      </Dialog>

      <FormDialog open={manual} title="Tambah Outlet Manual" onClose={() => setManual(false)} onSave={(v) => addOutlet(v)}
        fields={[
          { name: 'name', label: 'Nama outlet', required: true },
          { name: 'city', label: 'Kota' },
          { name: 'phone', label: 'Nomor WhatsApp (tampilan), mis. +62 812-xxxx', required: true },
          { name: 'phoneNumberId', label: 'Phone number ID dari Meta (WhatsApp Manager)', required: true },
        ]} />
    </>
  );
}
