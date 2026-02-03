#!/usr/bin/env node

/**
 * Baby Sensory Analytics MCP Server
 * Provides local-first analytics for Baby Sensory World app
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

import { SupabaseSessionDatabase } from './db/supabase.js';
import { CreateSessionRequest } from './types.js';
import {
  createSession,
  getSession,
  listSessions,
  getRecentSessions,
  exportAllSessions
} from './resources/sessions.js';
import {
  computeWeeklySummary,
  computeThemeRankings,
  computeColorEngagement,
  computeTimingPatterns
} from './resources/insights.js';

// Initialize database (now using Supabase instead of local file)
const db = new SupabaseSessionDatabase();

// Create server instance
const server = new Server(
  {
    name: 'baby-sensory-analytics',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'baby-sensory://sessions/list',
        name: 'All Sessions',
        description: 'Get all recorded sessions',
        mimeType: 'application/json',
      },
      {
        uri: 'baby-sensory://sessions/recent',
        name: 'Recent Sessions',
        description: 'Get sessions from the last 7 days',
        mimeType: 'application/json',
      },
      {
        uri: 'baby-sensory://insights/weekly-summary',
        name: 'Weekly Summary',
        description: 'Get weekly engagement summary and insights',
        mimeType: 'application/json',
      },
      {
        uri: 'baby-sensory://insights/themes',
        name: 'Theme Rankings',
        description: 'Get theme preference rankings by engagement',
        mimeType: 'application/json',
      },
      {
        uri: 'baby-sensory://insights/colors',
        name: 'Color Engagement',
        description: 'Get color preference statistics',
        mimeType: 'application/json',
      },
      {
        uri: 'baby-sensory://insights/timing',
        name: 'Timing Patterns',
        description: 'Get best times for engagement',
        mimeType: 'application/json',
      },
      {
        uri: 'baby-sensory://export/all',
        name: 'Export All Data',
        description: 'Export all sessions as JSON',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resource handler
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  try {
    if (uri === 'baby-sensory://sessions/list') {
      const sessions = await listSessions(db);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(sessions, null, 2),
          },
        ],
      };
    }

    if (uri === 'baby-sensory://sessions/recent') {
      const sessions = await getRecentSessions(db, 7);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(sessions, null, 2),
          },
        ],
      };
    }

    if (uri.startsWith('baby-sensory://sessions/')) {
      const id = uri.replace('baby-sensory://sessions/', '');
      const session = await getSession(db, id);

      if (!session) {
        throw new McpError(ErrorCode.InvalidRequest, `Session not found: ${id}`);
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(session, null, 2),
          },
        ],
      };
    }

    if (uri === 'baby-sensory://insights/weekly-summary') {
      const sessions = await listSessions(db);
      const summary = computeWeeklySummary(sessions);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    }

    if (uri === 'baby-sensory://insights/themes') {
      const sessions = await listSessions(db);
      const rankings = computeThemeRankings(sessions);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(rankings, null, 2),
          },
        ],
      };
    }

    if (uri === 'baby-sensory://insights/colors') {
      const sessions = await listSessions(db);
      const colors = computeColorEngagement(sessions);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(colors, null, 2),
          },
        ],
      };
    }

    if (uri === 'baby-sensory://insights/timing') {
      const sessions = await listSessions(db);
      const timing = computeTimingPatterns(sessions);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(timing, null, 2),
          },
        ],
      };
    }

    if (uri === 'baby-sensory://export/all') {
      const exportData = await exportAllSessions(db);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: exportData,
          },
        ],
      };
    }

    throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(
      ErrorCode.InternalError,
      `Error reading resource: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_session',
        description: 'Create a new session record',
        inputSchema: {
          type: 'object',
          properties: {
            theme: { type: 'string', description: 'Theme name (Ocean, Space, etc.)' },
            duration: { type: 'number', description: 'Session duration in seconds' },
            touches: { type: 'number', description: 'Total number of touches' },
            colorCounts: {
              type: 'object',
              description: 'Color engagement map (hex color -> count)',
              additionalProperties: { type: 'number' },
            },
            objectCounts: {
              type: 'object',
              description: 'Object engagement map (emoji -> count)',
              additionalProperties: { type: 'number' },
            },
            nurseryRhymesPlayed: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of nursery rhymes played',
            },
            streaks: { type: 'number', description: 'Longest streak achieved' },
            milestones: {
              type: 'array',
              items: { type: 'number' },
              description: 'Milestones reached',
            },
            completedFull: { type: 'boolean', description: 'Did session complete 20 minutes?' },
          },
          required: [
            'theme',
            'duration',
            'touches',
            'colorCounts',
            'objectCounts',
            'nurseryRhymesPlayed',
            'streaks',
            'milestones',
            'completedFull',
          ],
        },
      },
      {
        name: 'get_session',
        description: 'Get a specific session by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Session ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'list_sessions',
        description: 'List sessions with optional limit',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of sessions to return' },
          },
        },
      },
    ],
  };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'create_session') {
      const sessionData = args as unknown as CreateSessionRequest;
      const session = await createSession(db, sessionData);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, session }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_session') {
      const { id } = args as { id: string };
      const session = await getSession(db, id);

      if (!session) {
        throw new McpError(ErrorCode.InvalidRequest, `Session not found: ${id}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(session, null, 2),
          },
        ],
      };
    }

    if (name === 'list_sessions') {
      const { limit } = args as { limit?: number };
      const sessions = await listSessions(db, limit);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(sessions, null, 2),
          },
        ],
      };
    }

    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Baby Sensory Analytics MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
