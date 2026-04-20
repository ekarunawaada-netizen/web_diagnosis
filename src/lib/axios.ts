import axios from 'axios';

// ─── Token Store ────────────────────────────────────────────
// Disimpan di memory namun juga disinkronisasi ke localStorage dan cookie
// agar ketika halaman direfresh, token yang masih aktif tidak hilang.
let _accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('accessToken', token);
      document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      localStorage.removeItem('accessToken');
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }
};

export const getAccessToken = () => {
  if (_accessToken) return _accessToken;
  if (typeof window !== 'undefined') {
    // Coba ambil dari localstorage jika memori sedang kosong (misal setelah refresh)
    return localStorage.getItem('accessToken');
  }
  return null;
};

// ─── Axios Instance ───────────────────────────────────────────────────────────
// baseURL is empty — all /api/* calls go to Next.js which proxies them to the
// real backend via the rewrites in next.config.ts (no CORS issues).
const apiClient = axios.create({
  baseURL: 'https://hztapp.com/',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send cookies (refresh token) on same-origin proxied requests
  timeout: 15000,
});

// ─── Request Interceptor: attach Bearer token ─────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: auto-retry on 401 with token refresh ───────────────
let isRefreshing = false;
let failedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, not on the refresh or login endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh') &&
      !originalRequest.url?.includes('/api/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post('/api/auth/refresh');
        const newToken: string = data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
