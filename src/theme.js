'use client';
import { createTheme } from '@mui/material/styles';

export default createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: { light: true },
  palette: { primary: { main: '#0f7b6c' } },
  shape: { borderRadius: 8 },
  typography: { fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
});