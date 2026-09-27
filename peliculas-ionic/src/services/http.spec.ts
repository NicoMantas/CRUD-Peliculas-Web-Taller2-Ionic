import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { apiFetch, clearToken, getToken, setToken } from './http';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('http auth utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists the JWT token with Capacitor Preferences', async () => {
    await setToken('jwt-token-123');

    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'auth_token',
      value: 'jwt-token-123',
    });
  });

  it('reads the JWT token from Capacitor Preferences', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({ value: 'jwt-token-123' } as any);

    await expect(getToken()).resolves.toBe('jwt-token-123');
    expect(Preferences.get).toHaveBeenCalledWith({ key: 'auth_token' });
  });

  it('adds the Authorization header in the shared fetch wrapper', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({ value: 'jwt-token-123' } as any);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/pelicula');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/pelicula',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-123',
        }),
      }),
    );

    vi.unstubAllGlobals();
  });

  it('clears the JWT token when logout is requested', async () => {
    await clearToken();

    expect(Preferences.remove).toHaveBeenCalledWith({ key: 'auth_token' });
  });
});
