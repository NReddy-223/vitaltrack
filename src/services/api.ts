// All API calls go through this file - never call Supabase directly from frontend
// If VITE_API_URL is unset, use same-origin /api routes for the built backend.
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// ── helpers ──────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  full_name: string;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
}

// ── personal details ─────────────────────────────────────────────────────────

export interface ProfilePayload {
  full_name: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  health_goal: string;
}

export async function apiGetProfile(userId: string, token: string): Promise<ProfilePayload | null> {
  try {
    return await request<ProfilePayload>(`/api/profile/${userId}`, {}, token);
  } catch {
    return null; // profile may not exist yet
  }
}

export async function apiSaveProfile(
  userId: string,
  profile: ProfilePayload,
  token: string
): Promise<ProfilePayload> {
  return request<ProfilePayload>(`/api/profile/${userId}`, {
    method: 'POST',
    body: JSON.stringify(profile),
  }, token);
}

// ── health logs ───────────────────────────────────────────────────────────────

export interface HealthLogPayload {
  water_intake: number;
  exercise_minutes: number;
  sleep_hours: number;
  mood: string;
  calories: number;
  steps: number;
}

export interface HealthLogRecord extends HealthLogPayload {
  id: string;
  logged_at: string;
}

export async function apiSaveHealthLog(
  userId: string,
  log: HealthLogPayload,
  token: string
): Promise<HealthLogRecord> {
  return request<HealthLogRecord>(`/api/health-logs/${userId}`, {
    method: 'POST',
    body: JSON.stringify(log),
  }, token);
}

export async function apiGetHealthLogs(
  userId: string,
  token: string
): Promise<HealthLogRecord[]> {
  return request<HealthLogRecord[]>(`/api/health-logs/${userId}`, {}, token);
}
