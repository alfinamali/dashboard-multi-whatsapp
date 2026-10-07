'use client';

import { useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import {
  Check,
  EmailOutlined,
  WhatsApp,
} from '@mui/icons-material';

import { C } from '@/lib/data';

const CONTACT = 'indoberka@gmail.com';
const DEFAULT_LANG = 'en';

const T = {
  id: {
    title: 'Kebijakan Privasi',
    subtitle:
      'Cara WhatsApp Multi Outlet memproses dan melindungi data Anda.',
    updated: 'Terakhir diperbarui: 7 Oktober 2026',
    contactTitle: 'Kontak',
    contactText:
      'Pertanyaan tentang kebijakan ini atau permintaan data? Hubungi kami:',
    contactBtn: 'Kirim Email',

    sections: [
      {
        title: 'Tentang Aplikasi',
        p: [
          'WhatsApp Multi Outlet adalah dasbor yang membantu bisnis mengelola percakapan WhatsApp pelanggan dari satu atau beberapa outlet menggunakan WhatsApp Business Platform (Cloud API) dari Meta. Kebijakan ini menjelaskan data apa yang kami proses dan bagaimana kami memperlakukannya.',
        ],
      },
      {
        title: 'Data yang Kami Proses',
        items: [
          'Nomor WhatsApp dan nama profil pelanggan yang menghubungi atau dihubungi oleh bisnis.',
          'Isi pesan, template pesan, waktu kirim, dan status pengiriman (terkirim/dibaca).',
          'Catatan internal yang ditulis staf bisnis.',
          'Data akun staf/admin dasbor (nama pengguna dan token sesi masuk).',
          'Data outlet (nama outlet dan nomor WhatsApp Business yang terhubung).',
        ],
      },
      {
        title: 'Tujuan Penggunaan',
        items: [
          'Menerima, menampilkan, dan membalas pesan pelanggan.',
          'Mengirim pesan template yang telah disetujui Meta.',
          'Mengelola kontak, percakapan, dan template pesan bisnis.',
          'Menjaga keamanan dan fungsi layanan.',
        ],
        after:
          'Kami tidak menjual data pribadi dan tidak menggunakannya untuk iklan.',
      },
      {
        title: 'Berbagi Data',
        p: [
          'Pesan dikirim dan diterima melalui WhatsApp Business Platform milik Meta Platforms, Inc., sehingga data tersebut juga tunduk pada kebijakan Meta/WhatsApp. Selain itu, data hanya dapat diakses oleh staf bisnis yang berwenang dan penyedia infrastruktur server yang kami gunakan untuk menjalankan layanan. Kami dapat mengungkapkan data bila diwajibkan oleh hukum.',
        ],
      },
      {
        title: 'Penyimpanan dan Keamanan',
        p: [
          'Data disimpan di server layanan dan diakses melalui koneksi terenkripsi (HTTPS) dengan autentikasi pengguna. Kami menyimpan data selama diperlukan untuk menjalankan layanan atau selama bisnis pemilik outlet menggunakannya, lalu menghapusnya atas permintaan yang sah.',
        ],
      },
      {
        title: 'Hak Anda dan Penghapusan Data',
        p: [
          `Anda dapat meminta akses, koreksi, atau penghapusan data pribadi Anda dengan mengirim email ke ${CONTACT} beserta nomor WhatsApp yang bersangkutan. Kami akan memprosesnya dalam waktu yang wajar.`,
        ],
      },
      {
        title: 'Perubahan Kebijakan',
        p: [
          'Kebijakan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan terakhir tercantum di bagian atas halaman ini.',
        ],
      },
    ],
  },

  en: {
    title: 'Privacy Policy',
    subtitle:
      'How WhatsApp Multi Outlet processes and protects your data.',
    updated: 'Last updated: October 7, 2026',
    contactTitle: 'Contact',
    contactText:
      'Questions about this policy or a data request? Reach us at:',
    contactBtn: 'Send Email',

    sections: [
      {
        title: 'About the App',
        p: [
          "WhatsApp Multi Outlet is a dashboard that helps businesses manage customer WhatsApp conversations for one or more outlets using Meta's WhatsApp Business Platform (Cloud API). This policy explains what data we process and how we handle it.",
        ],
      },
      {
        title: 'Data We Process',
        items: [
          'WhatsApp phone numbers and profile names of customers who contact or are contacted by the business.',
          'Message content, message templates, timestamps, and delivery/read status.',
          'Internal notes written by business staff.',
          'Dashboard staff/admin account data (username and login session token).',
          'Outlet data (outlet name and the connected WhatsApp Business number).',
        ],
      },
      {
        title: 'How We Use Data',
        items: [
          'To receive, display, and reply to customer messages.',
          'To send message templates approved by Meta.',
          'To manage contacts, conversations, and business message templates.',
          'To keep the service secure and working.',
        ],
        after:
          'We do not sell personal data and do not use it for advertising.',
      },
      {
        title: 'Data Sharing',
        p: [
          'Messages are sent and received through the WhatsApp Business Platform operated by Meta Platforms, Inc., so that data is also subject to Meta/WhatsApp policies. Otherwise, data is accessible only to authorized business staff and the server infrastructure providers we use to run the service. We may disclose data when required by law.',
        ],
      },
      {
        title: 'Storage and Security',
        p: [
          "Data is stored on the service's servers and accessed over encrypted connections (HTTPS) with user authentication. We retain data as long as needed to operate the service or while the outlet's business uses it, and delete it upon a valid request.",
        ],
      },
      {
        title: 'Your Rights and Data Deletion',
        p: [
          `You may request access, correction, or deletion of your personal data by emailing ${CONTACT} with the relevant WhatsApp number. We will process the request within a reasonable time.`,
        ],
      },
      {
        title: 'Changes to This Policy',
        p: [
          'We may update this policy from time to time. The latest update date is shown at the top of this page.',
        ],
      },
    ],
  },
};

const panel = {
  border: `1px solid ${C.line}`,
  borderRadius: 3,
  p: { xs: 2.5, sm: 3.5 },
};

function Section({ n, title, p = [], items = [], after }) {
  return (
    <Paper elevation={0} sx={panel}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        <Avatar
          sx={{
            bgcolor: C.green,
            width: 30,
            height: 30,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {n}
        </Avatar>

        <Typography component="h2" fontWeight={700} fontSize={18}>
          {title}
        </Typography>
      </Stack>

      {p.map((text, i) => (
        <Typography
          key={i}
          fontSize={15}
          lineHeight={1.8}
          sx={{ mb: 1 }}
        >
          {text}
        </Typography>
      ))}

      {!!items.length && (
        <List dense disablePadding>
          {items.map((text, i) => (
            <ListItem
              key={i}
              disableGutters
              alignItems="flex-start"
              sx={{ py: 0.4 }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 30,
                  mt: 0.5,
                }}
              >
                <Check
                  sx={{
                    fontSize: 18,
                    color: C.green,
                  }}
                />
              </ListItemIcon>

              <ListItemText
                primary={text}
                primaryTypographyProps={{
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              />
            </ListItem>
          ))}
        </List>
      )}

      {after && (
        <Typography
          fontSize={15}
          lineHeight={1.8}
          fontWeight={600}
          sx={{ mt: 1.5 }}
        >
          {after}
        </Typography>
      )}
    </Paper>
  );
}

export default function PrivacyPolicy() {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const t = T[lang];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAF9',
      }}
    >
      <Box
        sx={{
          bgcolor: '#fff',
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <Container maxWidth="md" sx={{ py: 1.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
          >
            <Avatar
              sx={{
                bgcolor: C.green,
                width: 38,
                height: 38,
              }}
            >
              <WhatsApp />
            </Avatar>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography fontWeight={700} noWrap>
                WhatsApp Multi Outlet
              </Typography>

              <Typography
                fontSize={12}
                color={C.muted}
                noWrap
              >
                Kelola Outlet, Satu Dashboard
              </Typography>
            </Box>

            <ToggleButtonGroup
              size="small"
              exclusive
              value={lang}
              onChange={(_, value) => {
                if (value) setLang(value);
              }}
              aria-label="language"
            >
              <ToggleButton
                value="id"
                sx={{
                  px: 1.5,
                  textTransform: 'none',
                }}
              >
                ID
              </ToggleButton>

              <ToggleButton
                value="en"
                sx={{
                  px: 1.5,
                  textTransform: 'none',
                }}
              >
                EN
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth="md"
        sx={{
          py: { xs: 3, sm: 5 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            ...panel,
            mb: 2.5,
            bgcolor: C.green,
            color: '#fff',
            border: 'none',
          }}
        >
          <Typography
            component="h1"
            fontWeight={800}
            fontSize={{
              xs: 26,
              sm: 32,
            }}
          >
            {t.title}
          </Typography>

          <Typography sx={{ mt: 0.5, opacity: 0.92 }}>
            {t.subtitle}
          </Typography>

          <Chip
            label={t.updated}
            size="small"
            sx={{
              mt: 2,
              bgcolor: 'rgba(255,255,255,.18)',
              color: '#fff',
            }}
          />
        </Paper>

        <Stack spacing={2}>
          {t.sections.map((section, i) => (
            <Section
              key={i}
              n={i + 1}
              {...section}
            />
          ))}

          <Paper
            elevation={0}
            sx={{
              ...panel,
              bgcolor: C.bubbleOut,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Avatar
                sx={{
                  bgcolor: C.green,
                  width: 30,
                  height: 30,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {t.sections.length + 1}
              </Avatar>

              <Typography
                component="h2"
                fontWeight={700}
                fontSize={18}
              >
                {t.contactTitle}
              </Typography>
            </Stack>

            <Typography
              fontSize={15}
              sx={{ mb: 2 }}
            >
              {t.contactText}
            </Typography>

            <Button
              variant="contained"
              href={`mailto:${CONTACT}`}
              startIcon={<EmailOutlined />}
              sx={{
                textTransform: 'none',
                bgcolor: C.green,
                '&:hover': {
                  bgcolor: C.greenDark,
                },
              }}
            >
              {CONTACT}
            </Button>
          </Paper>
        </Stack>

        <Typography
          fontSize={12.5}
          color={C.muted}
          textAlign="center"
          sx={{ mt: 4 }}
        >
          © {new Date().getFullYear()} WhatsApp Multi Outlet
        </Typography>
      </Container>
    </Box>
  );
}