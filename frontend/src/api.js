// api.js
// Thin wrapper around fetch. Every API call goes through here.
// On 401 it tries to silently refresh the token once, then redirects to login.

const BASE = import.meta.env.VITE_API_URL || "/api";
let isRefreshing = false;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include", // always send cookies
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  // Silent token refresh on 401
  if (res.status === 401 && !isRefreshing && path !== "/auth/refresh") {
    isRefreshing = true;
    try {
      const refresh = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (refresh.ok) {
        isRefreshing = false;
        // Retry the original request
        return request(path, options);
      }
    } catch (_) {}
    isRefreshing = false;
    
    // Prevent infinite redirect loop if already on auth pages
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      window.location.href = "/login";
    }
    throw new Error("Authentication failed");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = body;
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  (path, body)   => request(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: "DELETE" }),
};
