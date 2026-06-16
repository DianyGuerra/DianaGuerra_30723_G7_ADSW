import { apiFetch } from './http';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    employeeId: string;
    fullName: string;
    roles: string[];
  };
}

export function login(username: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
