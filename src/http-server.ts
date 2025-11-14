#!/usr/bin/env node
import 'dotenv/config';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import cors from 'cors';
import { MoodleMcpServer } from './index.js';

const PORT = process.env.PORT || 8080;
const app = express();

// CORS для Letta
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: false
}));

// НЕ используем express.json() для /message - MCP SDK сам читает body
app.use((req, res, next) => {
  if (req.path === '/message') {
    return next();
  }
  express.json()(req, res, next);
});

// Логирование всех входящих запросов
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🌐 [${timestamp}] ${req.method} ${req.path}`);
  console.log('  Headers:', JSON.stringify(req.headers, null, 2));
  if (Object.keys(req.query).length > 0) {
    console.log('  Query:', JSON.stringify(req.query, null, 2));
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('  Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

const sessions = new Map<string, { transport: SSEServerTransport; server: MoodleMcpServer }>();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'moodle-mcp' });
});

app.get('/sse', async (req, res) => {
  try {
    console.log('New SSE connection request from:', req.headers['user-agent']);
    
    const transport = new SSEServerTransport('/message', res);
    const moodleServer = new MoodleMcpServer();
    
    await moodleServer.server.connect(transport);
    
    sessions.set(transport.sessionId, { transport, server: moodleServer });
    
    console.log('✅ SSE client connected. Session ID:', transport.sessionId);
    console.log('Active sessions:', sessions.size);
    
    transport.onclose = () => {
      sessions.delete(transport.sessionId);
      console.log('❌ SSE client disconnected:', transport.sessionId);
      console.log('Active sessions:', sessions.size);
    };
    
    transport.onerror = (error) => {
      console.error('⚠️  SSE transport error:', error);
      sessions.delete(transport.sessionId);
    };
  } catch (error) {
    console.error('❌ Error setting up SSE:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to establish SSE connection' });
    }
  }
});

app.post('/message', async (req, res) => {
  let sessionId = req.query.sessionId as string;
  
  console.log('📬 POST /message');
  console.log('  Query sessionId:', sessionId || 'NOT PROVIDED');
  console.log('  Full query:', req.query);
  console.log('  Active sessions:', Array.from(sessions.keys()));
  console.log('  User-Agent:', req.headers['user-agent']);
  
  // Fallback: если sessionId не передан, используем единственную активную сессию
  if (!sessionId && sessions.size === 1) {
    sessionId = Array.from(sessions.keys())[0];
    console.log('⚠️  SessionId missing, using single active session:', sessionId);
  }
  
  const session = sessions.get(sessionId);
  
  if (!session) {
    console.error('❌ Session not found. Requested:', sessionId);
    res.status(404).json({ 
      error: 'Session not found',
      sessionId: sessionId || null,
      activeSessions: Array.from(sessions.keys()),
      hint: 'Client should include sessionId in query: /message?sessionId=XXX'
    });
    return;
  }
  
  console.log('✅ Routing to session:', sessionId);
  await session.transport.handlePostMessage(req, res);
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Moodle MCP HTTP server running on port ${PORT}`);
  console.log(`Health check available at /health`);
  console.log(`SSE endpoint available at /sse`);
});

