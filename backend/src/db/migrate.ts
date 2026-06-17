import { query } from "./pool.js";

export async function migrate(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY,
      title VARCHAR(500) NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      tags TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes (created_at DESC)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes (updated_at DESC)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_notes_title ON notes (title)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN (tags)
  `);

  console.log("Database migration completed");
}
