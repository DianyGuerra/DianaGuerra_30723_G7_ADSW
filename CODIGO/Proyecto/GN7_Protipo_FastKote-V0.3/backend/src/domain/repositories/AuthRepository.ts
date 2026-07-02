export interface AuthUserRecord {
  id: string;
  username: string;
  passwordHash: string;
  failedAttempts: number;
  lockedUntil: Date | null;
  isActive: boolean;
  employee: null | {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    roles: { role: { name: string } }[];
  };
}

export interface AuthRepository {
  findByUsername(username: string): Promise<AuthUserRecord | null>;
  registerFailedAttempt(userId: string, failedAttempts: number, lockedUntil?: Date | null): Promise<void>;
  clearFailedAttempts(userId: string): Promise<void>;
}
