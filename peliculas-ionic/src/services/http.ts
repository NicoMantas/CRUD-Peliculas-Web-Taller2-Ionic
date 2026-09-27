import { Preferences } from '@capacitor/preferences';

export function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL;
  if (configuredUrl) return configuredUrl;

  return 'http://localhost:3000';
}

export const BASE_URL = getApiBaseUrl();
const TOKEN_KEY = 'auth_token';

export async function getToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: TOKEN_KEY });
  return value ?? null;
}

export async function setToken(token: string): Promise<void> {
  await Preferences.set({ key: TOKEN_KEY, value: token });
}

export async function clearToken(): Promise<void> {
  await Preferences.remove({ key: TOKEN_KEY });
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const fullUrl = `${BASE_URL}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(fullUrl, { ...options, headers });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      if (response.status === 401) await clearToken();

      throw new Error(body?.message ?? `Error ${response.status} al solicitar ${path}`);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      throw new Error(`No se pudo conectar con el backend (${BASE_URL}). Verifica que esté corriendo NestJS en http://localhost:3000.`);
    }
    throw err;
  }
}