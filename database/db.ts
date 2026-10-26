import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // 1. If connected to a PostgreSQL database (Neon, Supabase, Vercel Postgres, etc.)
  if (envUrl && (envUrl.startsWith('postgres://') || envUrl.startsWith('postgresql://'))) {
    return envUrl;
  }

  // 2. Serverless environment (Vercel / AWS Lambda / Netlify)
  // On Vercel, the filesystem at process.cwd() is read-only (/var/task).
  // SQLite fails with SQLITE_CANTOPEN if trying to write/create in a read-only filesystem.
  // We copy the bundled seed database to /tmp which is the only writable directory.
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.NODE_ENV === 'production'
  );

  if (isServerless && (!envUrl || envUrl.includes('dev.db') || envUrl.includes('prod.db') || envUrl.startsWith('file:'))) {
    const tmpDbPath = path.join('/tmp', 'novyn_store.db');

    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'database', 'seed.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(process.cwd(), 'prisma', 'seed.db'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`[DB] Successfully provisioned SQLite database to ${tmpDbPath} from ${candidate}`);
            break;
          } catch (err) {
            console.error(`[DB] Error copying database to /tmp:`, err);
          }
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // 3. Local development fallback
  return envUrl ?? 'file:./dev.db';
}

const getPrismaInstance = () => {
  const url = resolveDatabaseUrl();

  // If connected to a PostgreSQL database (e.g. Neon, Supabase, Vercel Postgres)
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    return new PrismaClient();
  }

  // Configured with 5000ms busy_timeout for SQLite concurrency resilience
  const adapter = new PrismaBetterSqlite3({
    url,
    timeout: 5000,
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
  optionsOrMaxRetries: number | { maxRetries?: number; delayMs?: number; baseDelayMs?: number } = 3,
  delayMsParam = 150
): Promise<T> {
  const maxRetries = typeof optionsOrMaxRetries === 'number'
    ? optionsOrMaxRetries
    : (optionsOrMaxRetries?.maxRetries ?? 3);
  const delayMs = typeof optionsOrMaxRetries === 'object'
    ? (optionsOrMaxRetries?.delayMs ?? optionsOrMaxRetries?.baseDelayMs ?? 150)
    : delayMsParam;

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;
      const isLockError =
        err?.message?.includes('SQLITE_BUSY') ||
        err?.message?.includes('database is locked') ||
        err?.code === 'P2034' ||
        err?.code === 'SQLITE_BUSY';

      if (isLockError && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt - 1)));
        continue;
      }
      throw err;
    }
  }
}
