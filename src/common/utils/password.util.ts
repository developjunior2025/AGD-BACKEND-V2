import * as bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';

const SALT_ROUNDS = 10;

export async function hashSecret(raw: string): Promise<string> {
  return bcrypt.hash(raw, SALT_ROUNDS);
}

export async function verifySecret(
  raw: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(raw, hash);
}

export function generateTempPassword(): string {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const chars = Array.from({ length: 12 }, () =>
    alphabet.charAt(randomInt(alphabet.length)),
  );
  return chars.join('');
}
