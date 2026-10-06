'use client';
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { primaryBtn } from '@/lib/data';

// fields: [{ name, label, required?, multiline?, options?: [{ value, label }] }]
export default function FormDialog({ open, title, fields, initial = {}, onSave, onClose }) {
  const [v, setV] = useState(initial);
  const ok = fields.every((f) => !f.required || String(v[f.name] ?? '').trim());
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ transition: { onEnter: () => setV(initial) } }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {fields.map((f) => (
            <TextField key={f.name} label={f.label} value={v[f.name] ?? ''} select={!!f.options} multiline={!!f.multiline} minRows={f.multiline ? 3 : undefined}
              onChange={(e) => setV({ ...v, [f.name]: e.target.value })}>
              {f.options?.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Batal</Button>
        <Button variant="contained" disabled={!ok} sx={primaryBtn} onClick={() => { onSave(v); onClose(); }}>Simpan</Button>
      </DialogActions>
    </Dialog>
  );
}
