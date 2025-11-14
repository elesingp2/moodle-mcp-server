# Moodle MCP Server

MCP server for Moodle LMS integration. Multi-tenant support via PostgreSQL.

## Tools

- `list_students` - Get enrolled students
- `get_assignments` - Get course assignments
- `get_student_submissions` - Get student submissions
- `provide_assignment_feedback` - Grade assignments
- `get_quizzes` - Get course quizzes
- `get_quiz_attempts` - Get quiz attempts
- `provide_quiz_feedback` - Provide quiz feedback

## Setup

```bash
npm install
npm run build
```

## Environment

Railway auto-detects PostgreSQL. Or set:
```
DATABASE_URL=postgresql://user:pass@host:5432/db
```

## Add User

```sql
INSERT INTO moodle_users (agent_id, moodle_api_url, moodle_api_token, moodle_course_id)
VALUES ('agent-xxx', 'https://moodle.org/webservice/rest/server.php', 'token', '1');
```

## Usage

Send `x-agent-id` header with requests to `/sse`

## License

MIT
