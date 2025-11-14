#!/usr/bin/env node
import 'dotenv/config';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { MoodleMcpServer } from './index.js';

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());

const sessions = new Map<string, { transport: SSEServerTransport; server: MoodleMcpServer }>();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'moodle-mcp' });
});

app.get('/sse', async (req, res) => {
  try {
    const transport = new SSEServerTransport('/message', res);
    const moodleServer = new MoodleMcpServer();
    
    await transport.start();
    await moodleServer.server.connect(transport);
    
    sessions.set(transport.sessionId, { transport, server: moodleServer });
    
    console.log('SSE client connected:', transport.sessionId);
    
    transport.onclose = () => {
      sessions.delete(transport.sessionId);
      console.log('SSE client disconnected:', transport.sessionId);
    };
    
    transport.onerror = (error) => {
      console.error('SSE transport error:', error);
      sessions.delete(transport.sessionId);
    };
  } catch (error) {
    console.error('Error setting up SSE:', error);
    res.status(500).json({ error: 'Failed to establish SSE connection' });
  }
});

app.post('/message', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const session = sessions.get(sessionId);
  
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  
  await session.transport.handlePostMessage(req, res);
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Moodle MCP HTTP server running on port ${PORT}`);
  console.log(`Health check available at /health`);
  console.log(`SSE endpoint available at /sse`);
});

