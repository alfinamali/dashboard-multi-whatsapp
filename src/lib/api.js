// .env.local:  NEXT_PUBLIC_API_URL=http://localhost:8000/api   (sesuaikan prefix dengan urls.py proyek Anda)
export const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const KEY = 'wa_token';

export const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem(KEY));
export const setToken = (t) => (t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY));

// endpoint DRF bisa mengembalikan array atau {results: []} (jika pagination aktif)
export const list = (d) => (Array.isArray(d) ? d : d?.results ?? []);

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const errorText = (d, status) =>
  d?.detail || (d && typeof d === 'object' ? Object.values(d).flat().join(' ') : '') || `Error ${status}`;

export async function api(path, { method = 'GET', body, params } = {}) {
  const clean = params ? Object.entries(params).filter(([, v]) => v != null && v !== '') : [];
  const qs = clean.length ? `?${new URLSearchParams(clean)}` : '';
  const token = getToken();
  const res = await fetch(`${BASE}${path}${qs}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Token ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401) window.dispatchEvent(new Event('wa-logout'));
  if (!res.ok) throw new ApiError(res.status, errorText(data, res.status));
  return data;
}