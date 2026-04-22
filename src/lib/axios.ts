import axios from 'axios';

// ─── In-memory access token store ────────────────────────────────────────────
// Stored in memory (not localStorage) to reduce XSS attack surface.
let _accessToken: string | null = null;

export const setAccessToken = (token: string | null) => { _accessToken = token; };
export const getAccessToken = () => _accessToken;

// ─── Axios Instance ───────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: 'https://db.hztapp.com/spakar/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,   // send httpOnly cookies (refresh token) on every request
  timeout: 60000,
});

// ─── Request Interceptor: attach Bearer token if available ────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: smart token recovery ───────────────────────────────
//
// Strategy when a 401 is received:
//   Step 1 → call GET /api/auth/me
//             • If the cookie session is still valid, the server returns
//               a fresh access token. Use it and retry the original request.
//   Step 2 → only if /me also fails, call POST /api/auth/refresh
//             • Uses the httpOnly refresh-token cookie to mint a new pair.
//             • On success, store new access token and retry.
//   Fail   → clear token; reject all queued requests.
//
// Concurrent 401 handling: all requests that 401 while a refresh is in progress
// are queued and replayed once the token is resolved.

let isRecovering = false;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let failedQueue: QueueEntry[] = [];

function flushQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

// Endpoints that must never trigger a recovery loop
const AUTH_URLS = ['/api/auth/login', '/api/auth/me', '/api/auth/refresh', '/api/auth/logout'];

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status: number = error.response?.status;

    // Only handle 401; skip auth endpoints and already-retried requests
    const isAuthUrl = AUTH_URLS.some((u) => originalRequest.url?.includes(u));
    if (status !== 401 || isAuthUrl || originalRequest._authRetry) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while a recovery is already in progress
    if (isRecovering) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._authRetry = true;
    isRecovering = true;

    try {
      // ── Step 1: try /me ──────────────────────────────────────────────────
      //   If the cookie is still alive, /me returns the current user + token.
      let newToken: string | null = null;

      try {
        const meRes = await apiClient.get('/api/auth/me');
        // Backend may return token either at root or inside .data
        newToken = meRes.data?.accessToken ?? meRes.data?.data?.accessToken ?? null;
      } catch {
        newToken = null; // /me failed → fall through to /refresh
      }

      // ── Step 2: try /refresh only if /me didn't give us a token ─────────
      if (!newToken) {
        const refreshRes = await apiClient.post('/api/auth/refresh');
        newToken = refreshRes.data?.accessToken ?? refreshRes.data?.data?.accessToken ?? null;
      }

      if (!newToken) throw new Error('No token returned from recovery flow');

      // ── Success: store token, flush queue, retry original request ────────
      setAccessToken(newToken);
      flushQueue(null, newToken);
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return apiClient(originalRequest);

    } catch (recoveryError) {
      // Both /me and /refresh failed — session is truly expired
      setAccessToken(null);
      flushQueue(recoveryError, null);

      // Optionally redirect to login (only in browser context)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      return Promise.reject(recoveryError);
    } finally {
      isRecovering = false;
    }
  }
);

// ─── initialiseAuth ──────────────────────────────────────────────────────────
// Call this once on app startup (e.g., in layout.tsx / AuthProvider).
// Attempts to restore the access token from the server session via /me.
// Falls back to /refresh if /me returns no token.
export async function initialiseAuth(): Promise<boolean> {
  try {
    const meRes = await apiClient.get('/api/auth/me');
    const token = meRes.data?.accessToken ?? meRes.data?.data?.accessToken ?? null;
    if (token) { setAccessToken(token); return true; }

    // /me didn't return a token — try refresh
    const refreshRes = await apiClient.post('/api/auth/refresh');
    const refreshToken = refreshRes.data?.accessToken ?? refreshRes.data?.data?.accessToken ?? null;
    if (refreshToken) { setAccessToken(refreshToken); return true; }

    return false;
  } catch {
    return false; // not logged in
  }
}

export default apiClient;
