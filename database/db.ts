import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrismaInstance = () => {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db';

  // Configured with 5000ms busy_timeout for concurrency resilience
  const adapter = new PrismaBetterSqlite3({
    url,
    timeout: 5000
  });

  return new PrismaClient({ adapter });
};

export const prisma =
  globalForPrisma.prisma ??
  getPrismaInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Executes a database operation with exponential backoff retry
 * to transparently resolve any transient concurrency lock (SQLITE_BUSY / deadlock)
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 150
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;
      const isLockError =
        err?.message?.includes('SQLITE_BUSY') ||
        err?.message?.includes('database is locked') ||
        err?.code === 'P2034'; // Prisma write conflict

      if (isLockError && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt - 1)));
        continue;
      }
      throw err;
    }
  }
}
