# How the Baby Sensory Analytics System Works

A comprehensive guide to understanding the Model Context Protocol (MCP) server and its integration with the web application.

---

## 📚 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Breakdown](#component-breakdown)
4. [Data Flow](#data-flow)
5. [MCP Protocol Explained](#mcp-protocol-explained)
6. [Analytics Pipeline](#analytics-pipeline)
7. [Code Examples](#code-examples)

---

## System Overview

The Baby Sensory Analytics system consists of three main components working together to provide AI-powered insights into baby engagement patterns:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Web App       │ ───▶ │   Supabase      │ ◀─── │  MCP Server     │
│   (Browser)     │      │   (Cloud DB)    │      │  (Local Node)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
      User                     Storage                   Analytics
    Interface                                          ↓
                                                  Claude AI
                                                  Insights
```

### What Each Component Does:

- **Web App**: Interactive sensory experience for babies, tracks engagement
- **Supabase**: Cloud PostgreSQL database storing all session data
- **MCP Server**: Local analytics engine that Claude AI queries for insights
- **Claude AI**: Interprets data and provides natural language insights

---

## Architecture Diagram

### Full System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         USER'S DEVICE                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    WEB BROWSER                               │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────┐    │ │
│  │  │  Baby Sensory Web App (React + Vite)                │    │ │
│  │  │  https://your-app.netlify.app                       │    │ │
│  │  │                                                      │    │ │
│  │  │  Features:                                          │    │ │
│  │  │  • Interactive themes (Ocean, Space, Garden, etc.) │    │ │
│  │  │  • Touch tracking                                   │    │ │
│  │  │  • 20-minute sessions                              │    │ │
│  │  │  • Nursery rhyme playback                          │    │ │
│  │  │  • Session summary                                  │    │ │
│  │  │                                                      │    │ │
│  │  │  On Session Complete/Stop:                         │    │ │
│  │  │  └─▶ Saves to IndexedDB (local)                   │    │ │
│  │  │      └─▶ Saves to localStorage (backup)           │    │ │
│  │  │          └─▶ Saves to Supabase (cloud) ────────┐  │    │ │
│  │  └─────────────────────────────────────────────────┘  │    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   TERMINAL / CLAUDE CODE                     │ │
│  │                                                               │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │  MCP Server (Node.js)                                │   │ │
│  │  │  Local analytics engine                              │   │ │
│  │  │                                                       │   │ │
│  │  │  Reads from: Supabase ◀────────────────────────────┐ │   │ │
│  │  │  Provides:                                          │ │   │ │
│  │  │  • Weekly summaries                                 │ │   │ │
│  │  │  • Theme rankings                                   │ │   │ │
│  │  │  • Color preferences                                │ │   │ │
│  │  │  • Engagement trends                                │ │   │ │
│  │  │  • Week-over-week comparisons                       │ │   │ │
│  │  │                                                       │ │   │ │
│  │  │  Connects to: Claude AI via stdio ───────────────┐  │ │   │ │
│  │  └───────────────────────────────────────────────────┘  │ │   │ │
│  │                                                           │ │   │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │   │ │
│  │  │  Claude AI (You!)                                 │  │ │   │ │
│  │  │  • Queries MCP server for data                    │  │ │   │ │
│  │  │  • Generates insights                             │  │ │   │ │
│  │  │  • Answers analytics questions                    │  │ │   │ │
│  │  └───────────────────────────────────────────────────┘  │ │   │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
                    ┌───────────────────────────────┐
                    │    SUPABASE CLOUD             │
                    │    PostgreSQL Database        │
                    │                               │
                    │  ┌─────────────────────────┐  │
                    │  │  sessions table         │  │
                    │  │  ├─ id (PK)            │  │
                    │  │  ├─ timestamp          │  │
                    │  │  ├─ theme              │  │
                    │  │  ├─ duration           │  │
                    │  │  ├─ touches            │  │
                    │  │  ├─ color_counts       │  │
                    │  │  ├─ object_counts      │  │
                    │  │  ├─ nursery_rhymes     │  │
                    │  │  ├─ streaks            │  │
                    │  │  ├─ milestones         │  │
                    │  │  └─ completed_full     │  │
                    │  └─────────────────────────┘  │
                    └───────────────────────────────┘
                           Centralized Storage
```

---

## Component Breakdown

### 1. Web Application (Frontend)

**Technology**: React + Vite, deployed on Netlify
**Location**: `baby-sensory-webapplication/`

**Key Files**:
```
src/
├── components/
│   └── SensoryCanvas.jsx    # Main session logic
├── hooks/
│   └── useScoreboard.js      # Tracks touches, streaks, milestones
├── utils/
│   └── sessionLogger.js      # Saves sessions to storage
└── lib/
    └── supabase.js           # Supabase client & save functions
```

**What It Does**:
1. Renders interactive sensory objects (fish, stars, flowers, etc.)
2. Tracks every touch/interaction
3. Records:
   - Which colors were touched
   - Which objects were interacted with
   - Which nursery rhymes played
   - Streaks of consecutive touches
   - Milestones reached (10, 25, 50, 100, 150, 200 touches)
4. After 20 minutes OR when manually stopped:
   - Saves to IndexedDB (instant, local)
   - Saves to localStorage (backup)
   - **Saves to Supabase** (cloud, for analytics)

**Code Flow**:
```javascript
// When session completes or stops
const sessionData = {
  id: generateUniqueId(),
  timestamp: Date.now(),
  theme: "Ocean",
  duration: 1200,  // seconds played
  touches: 156,
  colorCounts: { "#4ECDC4": 45, "#0088FF": 38 },
  objectCounts: { "🐟": 48, "🫧": 35 },
  nurseryRhymesPlayed: ["Twinkle Twinkle"],
  streaks: 12,
  milestones: [10, 25, 50, 100, 150],
  completedFull: true  // or false if stopped early
};

// Save to Supabase
await saveSessionToSupabase(sessionData);
```

---

### 2. Supabase (Cloud Database)

**Technology**: PostgreSQL with REST API
**Location**: Cloud (https://lljqyvtudhjvoalmnouv.supabase.co)

**Database Schema**:
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,              -- "session-123" or UUID
  timestamp BIGINT NOT NULL,        -- Unix timestamp (ms)
  theme TEXT NOT NULL,              -- "Ocean", "Space", etc.
  duration INTEGER NOT NULL,        -- Seconds played
  touches INTEGER NOT NULL,         -- Total touch count
  color_counts JSONB NOT NULL,      -- {"#FF0000": 10, "#00FF00": 15}
  object_counts JSONB NOT NULL,     -- {"⭐": 20, "🌸": 15}
  nursery_rhymes_played TEXT[],     -- ["Twinkle Twinkle"]
  streaks INTEGER NOT NULL,         -- Longest streak
  milestones INTEGER[],             -- [10, 25, 50, 100]
  completed_full BOOLEAN NOT NULL,  -- true if 20 min completed
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Why Supabase?**
- ✅ **Cloud Storage**: Data accessible from any device
- ✅ **Real-time Sync**: Instant updates across devices
- ✅ **PostgreSQL**: Powerful JSON queries for analytics
- ✅ **Free Tier**: 500MB database space
- ✅ **REST API**: Easy integration from web app and MCP server

**Data Access**:
```javascript
// From Web App (insert)
await supabase.from('sessions').insert(sessionData);

// From MCP Server (query)
const { data } = await supabase
  .from('sessions')
  .select('*')
  .order('timestamp', { ascending: false });
```

---

### 3. MCP Server (Analytics Engine)

**Technology**: Node.js + TypeScript
**Location**: `baby-sensory-analytics/`

**Key Files**:
```
src/
├── index.ts                 # MCP server entry point
├── db/
│   ├── interface.ts         # Database interface
│   ├── supabase.ts          # Supabase implementation
│   └── supabase.config.ts   # Supabase credentials
└── resources/
    ├── sessions.ts          # Session CRUD operations
    └── insights.ts          # Analytics computations
```

**What It Does**:
1. **Connects to Supabase** to read session data
2. **Computes analytics**:
   - Weekly summaries
   - Theme rankings
   - Color preferences
   - Engagement trends
   - Week-over-week comparisons
3. **Exposes MCP resources** that Claude AI can query

**MCP Resources Available**:
```
baby-sensory://sessions/list              - All sessions
baby-sensory://sessions/recent            - Last 7 days
baby-sensory://insights/weekly-summary    - Weekly report
baby-sensory://insights/themes            - Theme rankings
baby-sensory://insights/colors            - Color preferences
baby-sensory://insights/timing            - Best play times
baby-sensory://insights/engagement-trends - Progression over time
baby-sensory://insights/week-over-week    - Week comparison
baby-sensory://export/all                 - Export all data
```

**How Claude Queries It**:
```javascript
// Claude asks: "Show me weekly summary"
// → MCP server receives request for:
//   baby-sensory://insights/weekly-summary

// Server processes:
const sessions = await db.getAllSessions();
const summary = computeWeeklySummary(sessions);

// Returns JSON to Claude:
{
  "totalSessions": 10,
  "totalTouches": 1500,
  "favoriteTheme": "Space",
  "topObjects": [...],
  ...
}

// Claude translates to natural language:
"Your baby had 10 sessions this week with 1500 total
 touches! Space is the favorite theme..."
```

---

## Data Flow

### Session Creation Flow

```
1. USER PLAYS SESSION
   │
   ├─ Baby/Parent opens app
   ├─ Selects theme (Ocean, Space, etc.)
   ├─ Taps on objects for up to 20 minutes
   └─ Session completes or user stops

2. SESSION DATA COLLECTION
   │
   ├─ Touch tracking: Count every tap
   ├─ Color analysis: Track which colors touched
   ├─ Object tracking: Track which objects interacted
   ├─ Streak detection: Consecutive touches
   ├─ Milestone tracking: 10, 25, 50, 100, 150, 200
   └─ Music tracking: Which rhymes played

3. TRIPLE STORAGE (Redundancy + Cloud)
   │
   ├─ IndexedDB (Browser)
   │  └─ Fast local access
   │
   ├─ localStorage (Browser)
   │  └─ Backup if IndexedDB fails
   │
   └─ Supabase (Cloud) ✨
      └─ Persistent, accessible everywhere

4. ANALYTICS READY
   └─ MCP server can now query this data
```

### Analytics Query Flow

```
1. USER ASKS CLAUDE
   │
   └─ "Show me my baby's weekly summary"

2. CLAUDE INTERPRETS REQUEST
   │
   ├─ Identifies: Need weekly analytics
   └─ Maps to: baby-sensory://insights/weekly-summary

3. MCP SERVER RECEIVES REQUEST
   │
   ├─ Connects to Supabase
   ├─ Fetches all sessions
   ├─ Filters last 7 days
   ├─ Computes:
   │  ├─ Total sessions
   │  ├─ Total touches
   │  ├─ Favorite theme
   │  ├─ Top colors
   │  ├─ Top objects
   │  └─ Best time of day
   └─ Returns JSON

4. CLAUDE FORMATS RESPONSE
   │
   └─ Translates JSON to natural language

5. USER SEES INSIGHTS
   │
   └─ "You had 8 sessions this week with 1,200 touches!
       Space is the favorite theme..."
```

---

## MCP Protocol Explained

### What is MCP?

**Model Context Protocol (MCP)** is a standard for connecting AI assistants to external data sources and tools.

**Key Concepts**:

1. **Server**: Provides resources and tools (your analytics engine)
2. **Client**: AI assistant that queries the server (Claude)
3. **Resources**: Data endpoints (sessions, insights)
4. **Tools**: Actions the server can perform (create session, export data)
5. **Transport**: Communication channel (stdio - standard input/output)

### How MCP Works in This System

```
┌────────────────┐                        ┌────────────────┐
│  Claude Code   │ ◀─── stdio ────────▶  │  MCP Server    │
│  (MCP Client)  │                        │  (Your Code)   │
└────────────────┘                        └────────────────┘
       │                                          │
       │ 1. User: "Show weekly summary"          │
       ├─────────────────────────────────────────▶
       │                                          │
       │ 2. Request: GET baby-sensory://         │
       │    insights/weekly-summary               │
       ├─────────────────────────────────────────▶
       │                                          │
       │                                   3. Query Supabase
       │                                   4. Compute analytics
       │                                   5. Format JSON
       │                                          │
       │ 6. Response: { "totalSessions": 10, ... }
       │◀─────────────────────────────────────────┤
       │                                          │
       │ 7. Format natural language               │
       │ 8. Show user results                     │
```

### MCP Configuration

Located in `~/.claude/mcp_settings.json`:

```json
{
  "mcpServers": {
    "baby-sensory-analytics": {
      "command": "node",
      "args": [
        "/path/to/baby-sensory-analytics/dist/index.js"
      ],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  }
}
```

When Claude Code starts, it:
1. Launches the MCP server as a subprocess
2. Establishes stdio communication
3. Discovers available resources
4. Can now query for data

---

## Analytics Pipeline

### How Analytics are Computed

**Example: Weekly Summary**

```typescript
// 1. Fetch all sessions from Supabase
const sessions = await db.getAllSessions();

// 2. Filter to last 7 days
const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
const recentSessions = sessions.filter(s => s.timestamp >= weekAgo);

// 3. Aggregate data
const totalSessions = recentSessions.length;
const totalTouches = recentSessions.reduce((sum, s) => sum + s.touches, 0);

// 4. Find favorites
const favoriteTheme = getMostFrequent(recentSessions.map(s => s.theme));
const favoriteColor = getMostTouchedColor(recentSessions);

// 5. Return structured data
return {
  totalSessions,
  totalTouches,
  averageDuration: Math.round(totalDuration / totalSessions),
  favoriteTheme,
  favoriteColor,
  topObjects: [...],
  topRhymes: [...]
};
```

### Analytics Available

| Analytics | Description | Use Case |
|-----------|-------------|----------|
| **Weekly Summary** | Overview of last 7 days | "How did this week go?" |
| **Theme Rankings** | Most engaging themes | "Which theme should we play?" |
| **Color Preferences** | Most touched colors | "What colors does baby like?" |
| **Timing Patterns** | Best times for play | "When should we play?" |
| **Engagement Trends** | Progression over time | "Is baby improving?" |
| **Week-over-Week** | Compare weeks | "Better or worse than last week?" |

---

## Code Examples

### Example 1: Web App Saves Session

```javascript
// src/components/SensoryCanvas.jsx

// When session completes
const sessionData = {
  theme: theme.name,
  duration: Math.floor(sessionTime / 1000),
  touches: summary.totalTouches,
  colorCounts: summary.colorCounts,
  objectCounts: summary.objectCounts,
  nurseryRhymesPlayed: summary.nurseryRhymesPlayed,
  streaks: summary.bestStreak,
  milestones: summary.milestonesHit,
  completedFull: true
};

// Save to all storage layers
await logSession(sessionData);
```

```javascript
// src/utils/sessionLogger.js

export async function logSession(sessionData) {
  const session = {
    id: generateId(),
    timestamp: Date.now(),
    ...sessionData
  };

  // 1. IndexedDB (local)
  await saveToIndexedDB(session);

  // 2. localStorage (backup)
  saveToLocalStorage(session);

  // 3. Supabase (cloud)
  await saveSessionToSupabase(session);
}
```

```javascript
// src/lib/supabase.js

export async function saveSessionToSupabase(session) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      id: session.id,
      timestamp: session.timestamp,
      theme: session.theme,
      duration: session.duration,
      touches: session.touches,
      color_counts: session.colorCounts,
      object_counts: session.objectCounts,
      nursery_rhymes_played: session.nurseryRhymesPlayed,
      streaks: session.streaks,
      milestones: session.milestones,
      completed_full: session.completedFull
    });

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }

  console.log('✅ Session saved to Supabase:', session.id);
  return data;
}
```

### Example 2: MCP Server Provides Analytics

```typescript
// src/index.ts

// Register MCP resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'baby-sensory://insights/weekly-summary') {
    // 1. Get all sessions from Supabase
    const sessions = await db.getAllSessions();

    // 2. Compute summary
    const summary = computeWeeklySummary(sessions);

    // 3. Return as JSON
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(summary, null, 2)
      }]
    };
  }
});
```

```typescript
// src/resources/insights.ts

export function computeWeeklySummary(sessions: Session[]) {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentSessions = sessions.filter(s => s.timestamp >= weekAgo);

  return {
    totalSessions: recentSessions.length,
    totalTouches: recentSessions.reduce((sum, s) => sum + s.touches, 0),
    averageDuration: Math.round(
      recentSessions.reduce((sum, s) => sum + s.duration, 0) /
      recentSessions.length
    ),
    favoriteTheme: getMostFrequent(recentSessions.map(s => s.theme)),
    favoriteColor: getMostTouchedColor(recentSessions),
    topObjects: getTopObjects(recentSessions, 5),
    topRhymes: getTopRhymes(recentSessions, 3),
    bestTimeOfDay: getBestTimeOfDay(recentSessions)
  };
}
```

### Example 3: Supabase Database Layer

```typescript
// src/db/supabase.ts

export class SupabaseSessionDatabase implements ISessionDatabase {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(supabaseUrl, supabaseAnonKey);
  }

  async getAllSessions(): Promise<Session[]> {
    const { data, error } = await this.client
      .from('sessions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw new Error(`Failed to get sessions: ${error.message}`);

    // Convert snake_case to camelCase
    return data.map(row => this.fromRow(row));
  }

  private fromRow(row: SessionRow): Session {
    return {
      id: row.id,
      timestamp: row.timestamp,
      theme: row.theme,
      duration: row.duration,
      touches: row.touches,
      colorCounts: row.color_counts,
      objectCounts: row.object_counts,
      nurseryRhymesPlayed: row.nursery_rhymes_played,
      streaks: row.streaks,
      milestones: row.milestones,
      completedFull: row.completed_full
    };
  }
}
```

---

## Summary

### The Complete Picture

1. **Baby plays** with the web app
2. **Every interaction** is tracked (touches, colors, objects)
3. **Session completes** after 20 minutes or manual stop
4. **Data is saved** to three places:
   - IndexedDB (instant local access)
   - localStorage (backup)
   - Supabase (cloud storage)
5. **MCP server** connects to Supabase
6. **Claude AI** queries MCP server for insights
7. **You get** natural language analytics

### Key Insights

- **No manual data entry**: Everything automatic
- **Cloud-powered**: Data accessible from any device
- **Privacy-first**: You control your Supabase instance
- **AI-enhanced**: Claude translates data into actionable insights
- **Extensible**: Easy to add new analytics

### Next Steps

- **Add more analytics**: Custom insights based on your needs
- **Build dashboard**: Visual charts in the web app
- **Export reports**: PDF summaries for record-keeping
- **Trend analysis**: Track development over months
- **Recommendations**: AI suggests optimal play patterns

---

**Questions?** This system is designed to grow with your needs. You can add new analytics, customize insights, and extend functionality as you discover new patterns in baby engagement!
