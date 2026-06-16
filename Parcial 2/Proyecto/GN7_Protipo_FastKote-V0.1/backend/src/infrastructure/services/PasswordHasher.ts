import bcrypt from 'bcryptjs';

export class PasswordHasher {
  async hash(password: string) {
    return bcrypt.hash(password, 10);
  }

  async compare(password: string, storedHash: string) {
    // Solo para semillas locales académicas: evita depender de generar bcrypt manualmente desde SQL.
    if (storedHash.startsWith('plain:')) return storedHash.slice(6) === password;
    return bcrypt.compare(password, storedHash);
  }
}
