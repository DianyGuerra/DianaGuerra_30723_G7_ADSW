import bcrypt from 'bcryptjs';
export class PasswordHasher {
    async hash(password) {
        return bcrypt.hash(password, 10);
    }
    async compare(password, storedHash) {
        // Solo para semillas locales académicas: evita depender de generar bcrypt manualmente desde SQL.
        if (storedHash.startsWith('plain:'))
            return storedHash.slice(6) === password;
        return bcrypt.compare(password, storedHash);
    }
}
