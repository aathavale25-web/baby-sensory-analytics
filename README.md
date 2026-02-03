# Baby Sensory Analytics MCP Server

Cloud-powered analytics server for Baby Sensory World application. Tracks engagement patterns, favorite themes, colors, and provides AI-powered insights to optimize your baby's sensory experience.

📖 **[Read HOW_IT_WORKS.md](./HOW_IT_WORKS.md)** for a comprehensive guide with diagrams explaining the full system architecture and how the MCP server integrates with the web application.

## Features

- **☁️ Cloud Storage** - Supabase PostgreSQL database for reliable, accessible data
- **📊 Session Tracking** - Records every 20-minute play session with full engagement metrics
- **🧠 Smart Insights** - AI analyzes favorite themes, colors, objects, and best play times
- **🤖 MCP Integration** - Accessible via Model Context Protocol for Claude and other AI assistants
- **🔒 Privacy First** - Your data, your database, full control

## Setup

### 1. Install Dependencies

```bash
cd baby-sensory-analytics
npm install
npm run build
```

### 2. Set Up Supabase Database

The MCP server uses Supabase for cloud storage. If you haven't already:

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the table creation SQL (in `supabase/migrations/001_create_sessions_table.sql`)
4. Get your project URL and anon key from Project Settings > API

The database credentials are configured in `src/db/supabase.config.ts` or can be set via environment variables:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key-here"
```

### 3. Configure MCP Server

Add to `~/.claude/mcp_settings.json`:

```json
{
  "mcpServers": {
    "baby-sensory-analytics": {
      "command": "node",
      "args": ["/Users/your-username/path/to/baby-sensory-analytics/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  }
}
```

**Note:** The keys in `env` override the defaults in `supabase.config.ts`.

## Usage

### 1. Web App Integration

Your Baby Sensory World web app needs to write sessions directly to Supabase. Add the Supabase client to your web app:

```bash
npm install @supabase/supabase-js
```

Then configure it to save sessions after each play session:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// After a session completes
await supabase.from('sessions').insert({
  id: sessionId,
  timestamp: Date.now(),
  theme: 'Ocean',
  duration: 1200,
  touches: 156,
  color_counts: { "#4ECDC4": 45, "#0088FF": 38 },
  object_counts: { "🐟": 48, "🫧": 35 },
  nursery_rhymes_played: ["Twinkle Twinkle"],
  streaks: 12,
  milestones: [10, 25, 50, 100, 150],
  completed_full: true
});
```

### 2. Query Insights via MCP

Once data is synced, you can query insights using Claude or any MCP client:

```
"Show me my baby's weekly summary"
"What is my baby's favorite theme?"
"What colors does my baby interact with most?"
"When is the best time to play?"
```

## MCP Resources

The server exposes these resources:

- `baby-sensory://sessions/list` - All recorded sessions
- `baby-sensory://sessions/recent` - Last 7 days of sessions
- `baby-sensory://sessions/{id}` - Specific session details
- `baby-sensory://insights/weekly-summary` - Weekly engagement report
- `baby-sensory://insights/themes` - Theme preference rankings
- `baby-sensory://insights/colors` - Color engagement stats
- `baby-sensory://insights/timing` - Best times for play
- `baby-sensory://export/all` - Export all data as JSON

## MCP Tools

The server provides these tools:

- `create_session` - Log a new play session
- `get_session` - Retrieve session by ID
- `list_sessions` - List sessions with optional limit

## Data Schema

### Session Object

```typescript
{
  id: string              // UUID
  timestamp: number       // Unix timestamp (ms)
  theme: string           // "Ocean", "Space", etc.
  duration: number        // Seconds
  touches: number         // Total touches
  colorCounts: {          // Color engagement
    "#FF6B6B": 15,
    "#4ECDC4": 23
  },
  objectCounts: {         // Object type engagement
    "🐠": 8,
    "⭐": 12
  },
  nurseryRhymesPlayed: [  // Rhymes played during session
    "Twinkle Twinkle",
    "Baa Baa Black Sheep"
  ],
  streaks: number         // Longest streak
  milestones: [10, 25, 50], // Milestones achieved
  completedFull: boolean  // Finished 20 minutes?
}
```

## Development

### Run in Development Mode

```bash
npm run watch  # Auto-rebuild on changes
```

### Test with MCP Inspector

```bash
npm run inspector
```

This opens the MCP Inspector tool to test resources and tools.

### Debugging

Server logs to stderr for debugging:
```bash
node dist/index.js 2> debug.log
```

## Architecture

```
┌─────────────────────────┐
│  Baby Sensory Web App   │
│  (React + Vite)         │
│  - Netlify hosted       │
└────────────┬────────────┘
             │
             │ HTTP/REST API
             │ (Supabase Client)
             ▼
┌─────────────────────────┐
│     Supabase Cloud      │
│  - PostgreSQL Database  │
│  - Real-time sync       │
│  - Row Level Security   │
└────────────┬────────────┘
             │
             │ Read (Supabase Client)
             ▼
┌─────────────────────────┐
│  Baby Sensory Analytics │
│  MCP Server (Local)     │
│  (Node.js)              │
└────────────┬────────────┘
             │
             │ MCP Protocol (stdio)
             ▼
┌─────────────────────────┐
│  Claude Code / AI       │
│  (MCP Clients)          │
└─────────────────────────┘
```

**Data Flow:**
1. Web app → Supabase (sessions written after play)
2. MCP Server → Supabase (reads sessions for analytics)
3. Claude Code → MCP Server (queries insights via MCP protocol)

## Future Enhancements

1. **Direct Browser Integration** - WebSocket bridge for real-time sync
2. **Dashboard UI** - Visual charts and graphs in the web app
3. **Insights Widget** - Show favorite theme on main screen
4. **Export Features** - Download reports as PDF
5. **Trend Analysis** - Track changes in preferences over time

## Privacy

- All data stored locally on your machine
- No network requests to external servers
- No telemetry or analytics collection
- You own your data, delete anytime

## License

MIT
