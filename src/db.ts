import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export interface MoodleCredentials {
  moodle_api_url: string;
  moodle_api_token: string;
  moodle_course_id: string;
}

let pool: Pool | null = null;

export async function initDB(databaseUrl: string) {
  if (!databaseUrl) return;
  
  pool = new Pool({ connectionString: databaseUrl });
  
  try {
    const schema = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '..', 'db', 'schema.sql'),
      'utf-8'
    );
    await pool.query(schema);
  } catch (error: any) {
    if (!error.message?.includes('already exists')) {
      console.error('DB init error:', error.message);
    }
  }
}

export async function getMoodleCredentials(agentId: string): Promise<MoodleCredentials | null> {
  if (!pool) return null;
  
  try {
    const { rows } = await pool.query(
      'SELECT moodle_api_url, moodle_api_token, moodle_course_id FROM moodle_users WHERE agent_id = $1',
      [agentId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('DB query error:', error);
    return null;
  }
}

