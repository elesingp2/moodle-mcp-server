-- Таблица для хранения Moodle креденшалов по agent_id
CREATE TABLE IF NOT EXISTS moodle_users (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) UNIQUE NOT NULL,
    moodle_api_url VARCHAR(512) NOT NULL,
    moodle_api_token VARCHAR(512) NOT NULL,
    moodle_course_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по agent_id
CREATE INDEX IF NOT EXISTS idx_moodle_users_agent_id ON moodle_users(agent_id);

-- Тестовые данные
INSERT INTO moodle_users (agent_id, moodle_api_url, moodle_api_token, moodle_course_id)
VALUES (
    'agent-c08a6883-2334-47f0-a2fa-219cb8ceeb04',
    'https://moodle.org/webservice/rest/server.php',
    '9d96a3002ad121e551d55def06ff09bf',
    '1'
)
ON CONFLICT (agent_id) DO UPDATE SET
    moodle_api_url = EXCLUDED.moodle_api_url,
    moodle_api_token = EXCLUDED.moodle_api_token,
    moodle_course_id = EXCLUDED.moodle_course_id,
    updated_at = CURRENT_TIMESTAMP;

