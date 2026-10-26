const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

const prismaDir = path.join(__dirname, '..', 'prisma');
const targetSchema = path.join(prismaDir, 'schema.prisma');
const pgSchema = path.join(prismaDir, 'schema.postgresql.prisma');
const sqliteSchema = path.join(prismaDir, 'schema.sqlite.prisma');

if (isPostgres) {
  console.log('⚡ [Prebuild] Detected PostgreSQL connection string. Activating PostgreSQL schema...');
  if (fs.existsSync(pgSchema)) {
    fs.copyFileSync(pgSchema, targetSchema);
    console.log('✅ [Prebuild] Active schema configured for PostgreSQL.');
  }
} else {
  console.log('⚡ [Prebuild] SQLite detected. Ensuring SQLite schema is active...');
  if (fs.existsSync(sqliteSchema)) {
    fs.copyFileSync(sqliteSchema, targetSchema);
    console.log('✅ [Prebuild] Active schema configured for SQLite.');
  }
}
