import { apiFetch, setToken } from './http';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  usuario: AuthUser;
}

export async function registerUser(data: { nombre: string; email: string; password: string }): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  await setToken(response.token);
  return response;
}

export async function loginUser(data: { email: string; password: string }): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  await setToken(response.token);
  return response;
}
