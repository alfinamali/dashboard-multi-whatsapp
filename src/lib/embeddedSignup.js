// WhatsApp Embedded Signup (Facebook Login for Business) untuk menghubungkan nomor outlet.
//
// Mode coexistence: pelanggan memilih "hubungkan aplikasi WhatsApp Business yang sudah ada",
// memindai QR di HP, lalu nomor itu tetap bisa dipakai di HP SEKALIGUS lewat Cloud API (dashboard).
//
// .env:
//   NEXT_PUBLIC_FB_APP_ID=1830542244934147
//   NEXT_PUBLIC_WA_CONFIG_ID=<Configuration ID dari Facebook Login for Business>
//   NEXT_PUBLIC_WA_ES_VERSION=v5   (v5: onboarding aplikasi WhatsApp Business aktif secara default)

const APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID || '';
const CONFIG_ID = process.env.NEXT_PUBLIC_WA_CONFIG_ID || '';
const ES_VERSION = process.env.NEXT_PUBLIC_WA_ES_VERSION || 'v5';
const GRAPH_VERSION = process.env.NEXT_PUBLIC_GRAPH_VERSION || 'v26.0';

export const signupConfigured = () => Boolean(APP_ID && CONFIG_ID);

let sdkPromise;
function loadSdk() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Hanya di browser'));
  if (window.FB) return Promise.resolve(window.FB);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({ appId: APP_ID, autoLogAppEvents: true, xfbml: false, version: GRAPH_VERSION });
      resolve(window.FB);
    };
    const s = document.createElement('script');
    s.src = 'https://connect.facebook.net/en_US/sdk.js';
    s.async = true; s.defer = true; s.crossOrigin = 'anonymous';
    s.onerror = () => { sdkPromise = null; reject(new Error('Gagal memuat Facebook SDK (cek adblock / koneksi).')); };
    document.body.appendChild(s);
  });
  return sdkPromise;
}

// Mengembalikan { code, event, waba_id, phone_number_id, business_id }.
// Data datang dari dua jalur: callback FB.login (code) dan postMessage WA_EMBEDDED_SIGNUP (ID aset).
export async function launchEmbeddedSignup() {
  if (!signupConfigured()) throw new Error('Isi NEXT_PUBLIC_FB_APP_ID dan NEXT_PUBLIC_WA_CONFIG_ID di .env frontend.');
  // Facebook menolak FB.login dari halaman http://
  if (window.location.protocol !== 'https:') {
    throw new Error('Hubungkan WhatsApp wajib lewat HTTPS. Lokal: jalankan "npm run dev:https" lalu buka https://localhost:3000');
  }
  const FB = await loadSdk();

  return new Promise((resolve, reject) => {
    let session = null;
    let code = null;
    let done = false;

    const finish = (err, val) => {
      if (done) return;
      done = true;
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      err ? reject(err) : resolve(val);
    };
    const tryResolve = () => {
      if (code && session) finish(null, { code, ...session });
    };

    const onMessage = (e) => {
      if (!String(e.origin).endsWith('facebook.com')) return;
      let d;
      try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch { return; }
      if (d?.type !== 'WA_EMBEDDED_SIGNUP') return;
      if (String(d.event).startsWith('FINISH')) {
        const x = d.data || {};
        // Bentuk data beda antar versi. Kalau ID kosong, backend mencarinya dari token (debug_token).
        console.info('[WA_EMBEDDED_SIGNUP]', d);
        const first = (v) => (Array.isArray(v) ? v[0] : v) || '';
        const pick = (...keys) => keys.map((k) => first(x[k])).find(Boolean) || '';
        session = {
          event: d.event,
          waba_id: String(pick('waba_id', 'waba_ids', 'whatsapp_business_account_id')),
          phone_number_id: String(pick('phone_number_id', 'phone_number_ids')),
          business_id: String(pick('business_id')),
        };
        tryResolve();
      } else if (d.event === 'CANCEL' || d.event === 'ERROR') {
        const x = d.data || {};
        finish(new Error(x.error_message ? `Meta: ${x.error_message}` : `Pendaftaran dibatalkan${x.current_step ? ` (langkah: ${x.current_step})` : ''}.`));
      }
    };
    window.addEventListener('message', onMessage);
    const timer = setTimeout(() => finish(new Error('Waktu habis menunggu Meta. Coba lagi.')), 15 * 60 * 1000);

    // callback FB.login tidak boleh async
    FB.login((response) => {
      code = response?.authResponse?.code || null;
      if (!code) { finish(new Error('Jendela Meta ditutup sebelum selesai.')); return; }
      tryResolve();
      // event FINISH biasanya datang lebih dulu; beri jeda jika belum
      setTimeout(() => { if (!session) finish(new Error('Meta tidak mengirim data nomor. Pastikan domain ini terdaftar di pengaturan Facebook Login for Business.')); }, 10000);
    }, {
      config_id: CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: { setup: {}, version: ES_VERSION },
    });
  });
}
