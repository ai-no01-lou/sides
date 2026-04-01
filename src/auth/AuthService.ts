const AUTH_BASE_URL = 'http://api.localhost/auth';

interface AuthResponse {
  user: {id: string; email: string; name?: string};
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

async function post<T>(path: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Auth request failed (${res.status})`);
  }
  return res.json();
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return post<AuthResponse>('/login', {email, password});
}

export async function register(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  const body: Record<string, string> = {email, password};
  if (name) {
    body.name = name;
  }
  return post<AuthResponse>('/register', body);
}

export async function refreshTokens(
  refreshToken: string,
): Promise<RefreshResponse> {
  return post<RefreshResponse>('/refresh', {refreshToken});
}
