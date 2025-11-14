#!/usr/bin/env node
import 'dotenv/config';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import cors from 'cors';
import { MoodleMcpServer, MoodleConfig } from './index.js';
import { initDB, getMoodleCredentials } from './db.js';

const PORT = process.env.PORT || 8080;
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && process.env.POSTGRES_HOST) {
  DATABASE_URL = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'railway'}`;
}

const app = express();
const sessions = new Map<string, { transport: SSEServerTransport; server: MoodleMcpServer }>();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use((req, res, next) => req.path === '/message' ? next() : express.json()(req, res, next));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/sse', async (req, res) => {
  try {
    const agentId = req.headers['x-agent-id'] as string;
    if (!agentId) return res.status(400).json({ error: 'x-agent-id required' });
    
    const credentials = await getMoodleCredentials(agentId);
    if (!credentials) return res.status(404).json({ error: 'Agent not found' });
    
    const transport = new SSEServerTransport('/message', res);
    const server = new MoodleMcpServer({
      apiUrl: credentials.moodle_api_url,
      apiToken: credentials.moodle_api_token,
      courseId: credentials.moodle_course_id,
    });
    
    await server.server.connect(transport);
    sessions.set(transport.sessionId, { transport, server });
    
    transport.onclose = () => sessions.delete(transport.sessionId);
    transport.onerror = () => sessions.delete(transport.sessionId);
  } catch (error) {
    console.error('SSE error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Connection failed' });
  }
});

app.post('/message', async (req, res) => {
  let sessionId = req.query.sessionId as string;
  if (!sessionId && sessions.size === 1) sessionId = Array.from(sessions.keys())[0];
  
  const session = sessions.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  
  await session.transport.handlePostMessage(req, res);
});

await initDB(DATABASE_URL || '');
app.listen(Number(PORT), '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

