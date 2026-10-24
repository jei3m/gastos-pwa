import 'dotenv/config';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { db } from '../lib/db.ts';

const dbDir = import.meta.dir;

const routinesOnly = Bun.argv.includes('--routines-only');

const runFile = async (label: string, path: string) => {
  const sql = await readFile(path, 'utf8');
  if (!sql.trim()) {
    console.log(`- ${label}: empty, skipped`);
    return;
  }
  console.log(`- ${label}: applying...`);
  await db.query(sql);
  console.log(`- ${label}: done`);
};

const runFolder = async (folder: string) => {
  const dir = join(dbDir, folder);
  const files = (await readdir(dir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    await runFile(`${folder}/${file}`, join(dir, file));
  }
};

const main = async () => {
  if (!routinesOnly) {
    await runFile('schema', join(dbDir, 'schema.sql'));
  }

  await runFolder('views');
  await runFolder('procedures');
  await runFolder('triggers');

  console.log(
    routinesOnly
      ? 'Routines applied successfully.'
      : 'Migration applied successfully.'
  );
};

main()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
