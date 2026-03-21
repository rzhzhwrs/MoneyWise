import type { SQLiteDatabase } from 'expo-sqlite';
import { up as migration001 } from './001_initial';
import { up as migration002 } from './002_indexes';

const MIGRATIONS = [migration001, migration002];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Ensure schema_version table exists first
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL);
  `);

  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1',
  );
  const currentVersion = row?.version ?? -1;

  for (let i = currentVersion + 1; i < MIGRATIONS.length; i++) {
    await MIGRATIONS[i](db);
    if (currentVersion === -1 && i === 0) {
      // First migration inserts schema_version, skip insert
    } else {
      await db.runAsync(
        'INSERT INTO schema_version (version) VALUES (?)',
        i,
      );
    }
  }

  // Ensure we have a version row after first run
  const check = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1',
  );
  if (!check) {
    await db.runAsync(
      'INSERT INTO schema_version (version) VALUES (?)',
      MIGRATIONS.length - 1,
    );
  }
}
