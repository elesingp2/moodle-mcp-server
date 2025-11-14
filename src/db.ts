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
  if (!databaseUrl) {
    console.warn('⚠️  DATABASE_URL not provided, running without database');
    return;
  }
  
  pool = new Pool({ connectionString: databaseUrl });
  console.log('✅ Database pool initialized');
  
  // Автоинициализация схемы
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const schemaPath = join(__dirname, '..', 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    await pool.query(schema);
    console.log('✅ Database schema initialized');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('✅ Database schema already exists');
    } else {
      console.error('⚠️  Failed to initialize schema:', error.message);
    }
  }
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

