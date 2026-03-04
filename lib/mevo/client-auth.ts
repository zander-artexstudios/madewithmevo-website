export function getStoredMevoToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('mevo_token') || '';
}

export function setStoredMevoToken(token: string) {
  if (typeof window === 'undefined') return;
  if (!token) {
    window.localStorage.removeItem('mevo_token');
    return;
  }
  window.localStorage.setItem('mevo_token', token);
}

export async function mevoFetch(input: RequestInfo | URL, init?: RequestInit) {
  const token = getStoredMevoToken();
  const headers = new Headers(init?.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.get('Content-Type') && init?.body) headers.set('Content-Type', 'application/json');

  return fetch(input, {
    ...init,
    headers
  });
}
