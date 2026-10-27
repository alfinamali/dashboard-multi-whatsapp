'use client';
import { createTheme } from '@mui/material/styles';
import { C, FONT } from '@/lib/data';

export default createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: { light: true },
  palette: {
    primary: { main: C.green, dark: C.greenDark, contrastText: '#fff' },
    text: { primary: C.text, secondary: C.muted },
    background: { default: C.page, paper: C.surface },
    divider: C.line,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: FONT,
    fontSize: 14,
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 10 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 14 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: 12, backgroundColor: C.navy } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: C.page, WebkitFontSmoothing: 'antialiased' },
        '*:focus-visible': { outline: `2px solid ${C.green}`, outlineOffset: 2 },
        '@media (prefers-reduced-motion: reduce)': { '*': { transition: 'none !important', animation: 'none !important' } },
      },
    },
  },
});
