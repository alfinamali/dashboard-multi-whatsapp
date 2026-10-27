'use client';
import { useMemo, useState } from 'react';
import { Box, Button, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import { Add, Sync } from '@mui/icons-material';
import { useApp } from '@/store/AppContext';
import { C, card, outletColor } from '@/lib/data';
import { PageHeader } from '@/components/ui';
import TemplateDialog from '@/components/TemplateDialog';

const STATUS = {
  approved: { label: 'Disetujui', bg: '#E3F2EA', fg: '#0E6E49' },
  pending: { label: 'Menunggu review', bg: '#FDF1DC', fg: '#8A5A12' },
  rejected: { label: 'Ditolak', bg: '#FBE4E2', fg: '#9B231B' },
};
const FILTERS = [['all', 'Semua'], ['approved', 'Disetujui'], ['pending', 'Menunggu'], ['rejected', 'Ditolak']];

export default function TemplatesPage() {
  const { templates, outlets, user, syncTemplates } = useApp();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState('all');
  const [busy, setBusy] = useState(false);
  const staff = !!user?.is_staff;

  // nama outlet pemilik tiap WABA, untuk menunjukkan template ini bisa dipakai di outlet mana
  const owners = useMemo(() => {
    const m = {};
    outlets.forEach((o, i) => { (m[o.wabaId || ''] ||= []).push({ name: o.name, i }); });
    return m;
  }, [outlets]);
  const rows = templates.filter((t) => f === 'all' || t.status === f);

  const sync = async () => { setBusy(true); await syncTemplates(); setBusy(false); };

  return (
    <>
      <PageHeader title="Template pesan" subtitle="Dipakai untuk menghubungi pelanggan setelah lewat 24 jam. Setiap template harus disetujui Meta."
        action={staff && <>
          <Button variant="outlined" startIcon={<Sync />} onClick={sync} disabled={busy}>{busy ? 'Menyinkronkan…' : 'Sinkronkan dari Meta'}</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Template baru</Button>
        </>} />

      <Stack direction="row" spacing={.8} sx={{ mb: 2, overflowX: 'auto' }}>
        {FILTERS.map(([v, l]) => {
          const n = v === 'all' ? templates.length : templates.filter((t) => t.status === v).length;
          const on = f === v;
          return (
            <ButtonBase key={v} onClick={() => setF(v)} aria-pressed={on}
              sx={{ height: 34, px: 1.6, borderRadius: 17, fontSize: 13, fontWeight: on ? 600 : 500, flexShrink: 0,
                bgcolor: on ? C.navy : C.surface, color: on ? '#fff' : C.text, border: `1px solid ${on ? C.navy : C.line}` }}>
              {l}<Box component="span" sx={{ ml: .8, opacity: .7 }}>{n}</Box>
            </ButtonBase>
          );
        })}
      </Stack>

      {!rows.length ? (
        <Paper elevation={0} sx={{ ...card, p: 5, textAlign: 'center' }}>
          <Typography fontWeight={600}>{templates.length ? 'Tidak ada template dengan status ini' : 'Belum ada template'}</Typography>
          <Typography fontSize={13.5} color={C.muted} sx={{ mt: .5 }}>
            {templates.length ? 'Pilih filter lain.' : staff ? 'Buat template baru, atau sinkronkan template yang sudah ada di WhatsApp Manager.' : 'Minta admin membuat template.'}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0,1fr))', xl: 'repeat(3, minmax(0,1fr))' } }}>
          {rows.map((t) => {
            const st = STATUS[t.status] || { label: t.status, bg: C.lineSoft, fg: C.muted };
            const who = owners[t.waba_id || ''] || [];
            return (
              <Paper key={t.id} elevation={0} sx={{ ...card, p: 2, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={14.5} sx={{ overflowWrap: 'anywhere' }}>{t.name}</Typography>
                    <Typography fontSize={12.5} color={C.muted}>{t.category ? t.category.charAt(0) + t.category.slice(1).toLowerCase() : 'Tanpa kategori'}, bahasa {t.language}</Typography>
                  </Box>
                  <Box sx={{ px: 1.1, py: .3, borderRadius: 10, bgcolor: st.bg, color: st.fg, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{st.label}</Box>
                </Stack>
                <Box sx={{ p: 1.4, borderRadius: '10px', bgcolor: C.bubbleOut, fontSize: 13.5, lineHeight: 1.55, whiteSpace: 'pre-wrap', flex: 1 }}>{t.body || <i>(isi tidak tersedia)</i>}</Box>
                {who.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                    {who.map((o) => (
                      <Stack key={o.i} direction="row" alignItems="center" spacing={.5}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: outletColor(o.i) }} />
                        <Typography fontSize={12} color={C.muted}>{o.name}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      <TemplateDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
