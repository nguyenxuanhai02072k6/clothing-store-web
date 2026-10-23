import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';

/**
 * OWASP Recommended Argon2id parameters:
 * - type: argon2id (hybrid resistant against side-channel & GPU cracking attacks)
 * - memoryCost: 19456 KiB (~19 MiB memory-hard parameter)
 * - timeCost: 2 iterations
 * - parallelism: 1 thread
 */
export const ARGON2_OPTIONS: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

/**
 * Hashes a plain password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  const result = await argon2.hash(password, ARGON2_OPTIONS);
  return result as string;
}

/**
 * Result of password verification, including auto-upgrade indicator.
 */
export interface PasswordVerifyResult {
  isValid: boolean;
  needsRehash: boolean;
  algorithm: 'argon2id' | 'bcrypt' | 'unknown';
}

/**
 * Verifies a plain password against an Argon2id hash or legacy Bcrypt hash.
 * If verified with legacy bcrypt, flags `needsRehash: true` so the application
 * can transparently upgrade the user's password in the database to Argon2id.
 */
export async function verifyPassword(password: string, hash: string): Promise<PasswordVerifyResult> {
  if (!password || !hash) {
    return { isValid: false, needsRehash: false, algorithm: 'unknown' };
  }

  // 1. Argon2 hash format ($argon2id$, $argon2i$, $argon2d$)
  if (hash.startsWith('$argon2')) {
    try {
      const isValid = await argon2.verify(hash, password);
      const needsRehash = isValid && argon2.needsRehash(hash, ARGON2_OPTIONS);
      return { isValid, needsRehash, algorithm: 'argon2id' };
    } catch {
      return { isValid: false, needsRehash: false, algorithm: 'argon2id' };
    }
  }

  // 2. Legacy Bcrypt format ($2a$, $2b$, $2y$)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    try {
      const isValid = await bcrypt.compare(password, hash);
      // If legacy bcrypt password is valid, flag for automatic migration to Argon2id
      return { isValid, needsRehash: isValid, algorithm: 'bcrypt' };
    } catch {
      return { isValid: false, needsRehash: false, algorithm: 'bcrypt' };
    }
  }

  return { isValid: false, needsRehash: false, algorithm: 'unknown' };
}
