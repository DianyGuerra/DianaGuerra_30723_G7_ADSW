const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('fastkote_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de comunicación con API.' }));
    throw new ApiError(response.status, error.message ?? 'Error de comunicación con API.');
  }

  if (response.headers.get('content-type')?.includes('application/pdf')) {
    return response.blob() as Promise<T>;
  }

  return response.json() as Promise<T>;
}
