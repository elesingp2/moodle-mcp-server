import { Pool } from 'pg';

export interface MoodleCredentials {
  moodle_api_url: string;
  moodle_api_token: string;
  moodle_course_id: string;
}

let pool: Pool | null = null;

export function initDB(databaseUrl: string) {
  if (!databaseUrl) {
    console.warn('⚠️  DATABASE_URL not provided, running without database');
    return;
  }
  
  pool = new Pool({ connectionString: databaseUrl });
  console.log('✅ Database pool initialized');
}

export async function getMoodleCredentials(agentId: string): Promise<MoodleCredentials | null> {
  if (!pool) {
    console.warn('⚠️  Database not initialized');
    return null;
  }

  try {
    const result = await pool.query(
      'SELECT moodle_api_url, moodle_api_token, moodle_course_id FROM moodle_users WHERE agent_id = $1',
      [agentId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Database query error:', error);
    return null;
  }
}

export async function closeDB() {
  if (pool) {
    await pool.end();
    console.log('✅ Database connection closed');
  }
}

