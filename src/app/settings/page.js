'use client';
import { useEffect, useState } from 'react';
import {
  Box, Button, Chip, Divider, FormControlLabel, Paper, Stack, Switch, TextField, Typography,
} from '@mui/material';
import { Logout, RestartAlt } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, card, primaryBtn } from '@/lib/data';
import { PageHeader } from '@/components/ui';

const Section = ({ title, hint, children }) => (
  <Paper elevation={0} sx={{ ...card, p: 2.5 }}>
    <Typography fontWeight={700}>{title}</Typography>
    {hint && <Typography fontSize={13} color={C.muted} sx={{ mt: .3 }}>{hint}</Typography>}
    <Box sx={{ mt: 2 }}>{children}</Box>
  </Paper>
);

function ProfileForm() {
  const { user, saveProfile } = useApp();
  const [v, setV] = useState({ name: '', email: '' });
  const [busy, setBusy] = useState(false);
  useEffect(() => setV({ name: user?.name || '', email: user?.email || '' }), [user]);
  const dirty = v.name !== (user?.name || '') || v.email !== (user?.email || '');
  const save = async () => { setBusy(true); await saveProfile(v); setBusy(false); };
  return (
    <Section title="Profil" hint="Nama tampil di navbar dan dicatat sebagai pengirim pesan dari dashboard.">
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={13.5} color={C.muted}>Username</Typography>
          <Typography fontSize={13.5} fontWeight={600}>{user?.username}</Typography>
          <Chip size="small" label={user?.role || (user?.is_staff ? 'Admin' : 'Agen')} color={user?.is_staff ? 'success' : 'default'} variant="outlined" />
        </Stack>
        <TextField label="Nama" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        <TextField label="Email" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        <Box><Button variant="contained" sx={primaryBtn} disabled={!dirty || busy} onClick={save}>{busy ? 'Menyimpan...' : 'Simpan profil'}</Button></Box>
      </Stack>
    </Section>
  );
}

function PasswordForm() {
  const { changePassword } = useApp();
  const empty = { old: '', next: '', confirm: '' };
  const [v, setV] = useState(empty);
  const [busy, setBusy] = useState(false);
  const mismatch = v.confirm && v.next !== v.confirm;
  const short = v.next && v.next.length < 8;
  const ok = v.old && v.next && v.next === v.confirm && !short;
  const save = async () => { setBusy(true); if (await changePassword(v.old, v.next)) setV(empty); setBusy(false); };
  const f = (k) => ({ value: v[k], onChange: (e) => setV({ ...v, [k]: e.target.value }), type: 'password', autoComplete: k === 'old' ? 'current-password' : 'new-password' });
  return (
    <Section title="Ganti password" hint="Setelah diganti, perangkat lain yang memakai akun ini otomatis keluar.">
      <Stack spacing={2}>
        <TextField label="Password lama" {...f('old')} />
        <TextField label="Password baru" {...f('next')} error={!!short} helperText={short ? 'Minimal 8 karakter' : undefined} />
        <TextField label="Ulangi password baru" {...f('confirm')} error={!!mismatch} helperText={mismatch ? 'Tidak sama' : undefined} />
        <Box><Button variant="contained" sx={primaryBtn} disabled={!ok || busy} onClick={save}>{busy ? 'Menyimpan...' : 'Ganti password'}</Button></Box>
      </Stack>
    </Section>
  );
}

function Preferences() {
  const { settings, savePreferences } = useApp();
  const toggle = (k) => (e) => savePreferences({ [k]: e.target.checked });
  return (
    <Section title="Notifikasi" hint="Disimpan di akun Anda, berlaku di semua perangkat.">
      <Stack>
        <FormControlLabel control={<Switch color="success" checked={settings.notif} onChange={toggle('notif')} />} label="Tampilkan notifikasi pesan baru" />
        <FormControlLabel control={<Switch color="success" checked={settings.sound} onChange={toggle('sound')} disabled={!settings.notif} />} label="Bunyikan suara saat ada pesan baru" />
      </Stack>
    </Section>
  );
}

function AutoReplyRow({ o, i }) {
  const { updateOutlet, notify } = useApp();
  const [on, setOn] = useState(o.autoReply);
  const [text, setText] = useState(o.autoReplyText);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setOn(o.autoReply); setText(o.autoReplyText); }, [o.autoReply, o.autoReplyText]);
  const dirty = on !== o.autoReply || text !== o.autoReplyText;
  const save = async () => {
    setBusy(true);
    if (await updateOutlet(i, { auto_reply: on, auto_reply_text: text })) notify(`Balasan otomatis ${o.name} disimpan`);
    setBusy(false);
  };
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography fontWeight={600} fontSize={14.5}>{o.name}</Typography>
          <Typography fontSize={12.5} color={C.muted}>{o.phone}</Typography>
        </Box>
        <FormControlLabel control={<Switch color="success" checked={on} onChange={(e) => setOn(e.target.checked)} />} label={on ? 'Aktif' : 'Nonaktif'} />
      </Stack>
      <TextField fullWidth multiline minRows={2} value={text} onChange={(e) => setText(e.target.value)} disabled={!on}
        inputProps={{ maxLength: 1000 }} sx={{ mt: 1 }} />
      {dirty && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button size="small" variant="contained" sx={primaryBtn} disabled={busy || (on && !text.trim())} onClick={save}>Simpan</Button>
          <Button size="small" sx={{ textTransform: 'none' }} onClick={() => { setOn(o.autoReply); setText(o.autoReplyText); }}>Batal</Button>
        </Stack>
      )}
    </Box>
  );
}

function AutoReply() {
  const { outlets } = useApp();
  return (
    <Section title="Balasan otomatis per outlet"
      hint="Dikirim saat pelanggan pertama kali chat, atau chat lagi setelah 12 jam tidak ada pesan. Untuk nomor yang juga aktif di HP, ini menggantikan pesan salam/away aplikasi WhatsApp Business yang nonaktif setelah terhubung.">
      {outlets.length ? (
        <Stack spacing={2} divider={<Divider />}>
          {outlets.map((o, i) => <AutoReplyRow key={o.id} o={o} i={i} />)}
        </Stack>
      ) : <Typography fontSize={13.5} color={C.muted}>Belum ada outlet.</Typography>}
    </Section>
  );
}

export default function SettingsPage() {
  const { user, reset, logout } = useApp();
  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Akun, notifikasi, dan balasan otomatis" />
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <ProfileForm />
        <PasswordForm />
        <Preferences />
        {user?.is_staff && <AutoReply />}
        <Section title="Sesi">
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" color="inherit" startIcon={<RestartAlt />} sx={{ textTransform: 'none' }} onClick={reset}>Muat ulang data</Button>
            <Button variant="outlined" color="error" startIcon={<Logout />} sx={{ textTransform: 'none' }} onClick={logout}>Keluar</Button>
          </Stack>
        </Section>
      </Stack>
    </>
  );
}
