#!/usr/bin/env bun
/**
 * mac-falcon custom migration runner
 *
 * Why not drizzle-kit migrate?  On the first run it tries to apply 0000_init.sql
 * against a DB that already has those tables (they were created before this runner
 * was set up), so it crashes.  This runner uses a simple `_applied_migrations`
 * tracking table and seeds 0000_init as pre-applied so only genuinely new
 * migrations are executed.
 *
 * Usage:  bun run db:migrate
 */

import { Pool } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "fs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const pool = new Pool({ connectionString: DATABASE_URL });
const client = await pool.connect();

try {
  // 1. Create tracking table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_applied_migrations" (
      tag TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // 2. Seed 0000_init as already applied — those tables pre-exist in the DB
  await client.query(`
    INSERT INTO "_applied_migrations" (tag)
    VALUES ('0000_init')
    ON CONFLICT (tag) DO NOTHING
  `);

  // 3. Get applied set
  const { rows } = await client.query(
    `SELECT tag FROM "_applied_migrations"`
  );
  const applied = new Set(rows.map((r: { tag: string }) => r.tag));

  // 4. Collect SQL files in alphabetical order
  const files = readdirSync("./drizzle")
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let applied_count = 0;
  for (const file of files) {
    const tag = file.replace(".sql", "");

    if (applied.has(tag)) {
      console.log(`✓  ${tag}  (already applied)`);
      continue;
    }

    console.log(`→  Applying ${tag}…`);
    const content = readFileSync(`./drizzle/${file}`, "utf-8");

    // Drizzle uses "-->statement-breakpoint" as a delimiter; fall back to ";"
    const statements = content
      .split(/-->.*(\n|$)/)
      .flatMap((chunk) => chunk.split(";"))
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    await client.query("BEGIN");
    try {
      for (const stmt of statements) {
        await client.query(stmt);
      }
      await client.query(
        `INSERT INTO "_applied_migrations" (tag) VALUES ($1)`,
        [tag]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }

    console.log(`✓  ${tag}  applied`);
    applied_count++;
  }

  if (applied_count === 0) {
    console.log("✓  No pending migrations — DB is up to date.");
  } else {
    console.log(`✓  Applied ${applied_count} migration(s).`);
  }
} finally {
  client.release();
  await pool.end();
}
