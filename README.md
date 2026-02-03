# Baby Sensory Analytics MCP Server

Local-first analytics server for Baby Sensory World application. Tracks engagement patterns, favorite themes, colors, and provides insights to optimize your baby's sensory experience.

## Features

- **100% Local Storage** - All data stored locally, no cloud, no tracking
- **Session Tracking** - Records every 20-minute play session with full engagement metrics
- **Smart Insights** - Analyzes favorite themes, colors, objects, and best play times
- **MCP Integration** - Accessible via Model Context Protocol for AI assistants
- **Privacy First** - Your baby's data never leaves your machine

## Installation

```bash
cd baby-sensory-analytics
npm install
npm run build
```

## Usage

### 1. Start the MCP Server

The MCP server is automatically started by Claude Code when configured in `~/.claude/mcp_settings.json`:

```json
{
  "mcpServers": {
    "baby-sensory-analytics": {
      "command": "node",
      "args": ["/path/to/baby-sensory-analytics/dist/index.js"],
      "env": {}
    }
  }
}
```

### 2. Play Sessions in the Web App

Open the Baby Sensory World application and complete 20-minute play sessions. Session data is automatically logged to:
- Browser IndexedDB
- Browser localStorage (backup)

### 3. Sync Browser Data to MCP Server

The MCP server reads from `~/.baby-sensory-sessions.json`. To sync browser data:

#### Option A: Manual Sync (Current)

1. Open browser console (F12) on the Baby Sensory World app
2. Run this command:
   ```javascript
   copy(localStorage.getItem('baby-sensory-sessions'))
   ```
3. Save the copied JSON to `~/.baby-sensory-sessions.json`

#### Option B: Automated Sync (Future Enhancement)

Run the sync script periodically:
```bash
node sync-browser-sessions.js
```

Or set up a cron job to sync every hour:
```bash
0 * * * * cd /path/to/baby-sensory-analytics && node sync-browser-sessions.js
```

### 4. Query Insights via MCP

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
│  - IndexedDB            │
│  - localStorage backup  │
└────────────┬────────────┘
             │
             │ Manual sync or
             │ automated script
             ▼
┌─────────────────────────┐
│  ~/.baby-sensory-       │
│  sessions.json          │
│  (Local file)           │
└────────────┬────────────┘
             │
             │ Read/Write
             ▼
┌─────────────────────────┐
│  Baby Sensory Analytics │
│  MCP Server             │
│  (Node.js)              │
└────────────┬────────────┘
             │
             │ MCP Protocol
             ▼
┌─────────────────────────┐
│  Claude / MCP Clients   │
│  (AI Assistants)        │
└─────────────────────────┘
```

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
