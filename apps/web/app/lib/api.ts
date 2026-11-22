const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiCall<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const isFormData =
    typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body && typeof body.error === 'string') {
        message = body.error;
      }
    } catch {
      // ignore non-JSON error bodies
    }

    if (response.status === 401 && !skipAuth) {
      clearAuthToken();
      clearStoredUser();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function apiDownload(endpoint: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body && typeof body.error === 'string') message = body.error;
    } catch {
      // The response may not contain JSON.
    }

    if (response.status === 401) {
      clearAuthToken();
      clearStoredUser();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    throw new Error(message);
  }
  return response.blob();
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

export function getStoredUser(): unknown | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: unknown): void {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem('auth_user');
}

export default apiCall;
