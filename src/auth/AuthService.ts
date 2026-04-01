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

class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function post<T>(path: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const raw = err.error || err.message || '';
    throw new AuthError(
      friendlyMessage(raw, res.status),
      res.status,
    );
  }
  return res.json();
}

function friendlyMessage(raw: string, status: number): string {
  const lower = raw.toLowerCase();
  if (status === 409 || lower.includes('already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (status === 401 || lower.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (status === 422 || lower.includes('validation')) {
    return 'Please check your email and password format.';
  }
  return raw || `Something went wrong (${status})`;
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
