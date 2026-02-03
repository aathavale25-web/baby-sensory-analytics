# Baby Sensory Analytics - Verification Checklist

## ✅ Pre-Flight Checks

### 1. MCP Server Build

```bash
cd baby-sensory-analytics
npm run build
```

**Expected**: No errors, `dist/` directory created with compiled JavaScript files.

**Verify**:
- [ ] `dist/index.js` exists
- [ ] `dist/types.js` exists
- [ ] `dist/db/indexeddb.js` exists
- [ ] `dist/resources/sessions.js` exists
- [ ] `dist/resources/insights.js` exists

### 2. Test Data Created

```bash
node test-server.js
```

**Expected**: Creates 5 sample sessions in `~/.baby-sensory-sessions.json`

**Verify**:
- [ ] File exists: `ls -la ~/.baby-sensory-sessions.json`
- [ ] Contains 5 sessions: `cat ~/.baby-sensory-sessions.json | jq 'length'`
- [ ] Valid JSON: `cat ~/.baby-sensory-sessions.json | jq '.'`

### 3. MCP Configuration

```bash
cat ~/.claude/mcp_settings.json
```

**Expected**: Contains `baby-sensory-analytics` server configuration

**Verify**:
- [ ] File exists
- [ ] Contains `"baby-sensory-analytics"` key
- [ ] Points to correct path: `/Users/.../baby-sensory-analytics/dist/index.js`
- [ ] Valid JSON syntax

### 4. React App Integration

```bash
cd baby-sensory-webapplication
grep -r "sessionLogger" src/
grep -r "trackNurseryRhyme" src/
grep -r "nurseryRhymesPlayed" src/
```

**Expected**: Files reference the new session logging functionality

**Verify**:
- [ ] `sessionLogger.js` exists in `src/utils/`
- [ ] `SensoryCanvas.jsx` imports `logSession`
- [ ] `useScoreboard.js` has `trackNurseryRhyme` function
- [ ] `useScoreboard.js` tracks `nurseryRhymesPlayed` and `milestonesHit`

## 🧪 Functional Tests

### Test 1: MCP Server Starts

```bash
cd baby-sensory-analytics
node dist/index.js
```

**Expected**:
```
Baby Sensory Analytics MCP Server running on stdio
Loaded 5 sessions from /Users/.../.baby-sensory-sessions.json
```

**Verify**:
- [ ] No startup errors
- [ ] Loads existing sessions
- [ ] Server stays running (Ctrl+C to stop)

### Test 2: MCP Server Responds (via Inspector)

```bash
cd baby-sensory-analytics
npm run inspector
```

**Expected**: Opens MCP Inspector UI in browser

**Verify**:
- [ ] Inspector loads without errors
- [ ] Lists 7 resources
- [ ] Lists 3 tools
- [ ] Can read `baby-sensory://insights/weekly-summary`

### Test 3: Session Data Integrity

```bash
cat ~/.baby-sensory-sessions.json | jq '.[0]'
```

**Expected**: Shows complete session object with all fields

**Verify**:
- [ ] Has `id` field (UUID)
- [ ] Has `timestamp` (number)
- [ ] Has `theme` (string)
- [ ] Has `duration` (number)
- [ ] Has `touches` (number)
- [ ] Has `colorCounts` (object)
- [ ] Has `objectCounts` (object)
- [ ] Has `nurseryRhymesPlayed` (array)
- [ ] Has `streaks` (number)
- [ ] Has `milestones` (array)
- [ ] Has `completedFull` (boolean)

### Test 4: Analytics Computations

Using the sample data, verify these calculations:

```bash
# Total sessions
cat ~/.baby-sensory-sessions.json | jq 'length'
# Expected: 5

# Total touches
cat ~/.baby-sensory-sessions.json | jq '[.[].touches] | add'
# Expected: 868

# Unique themes
cat ~/.baby-sensory-sessions.json | jq '[.[].theme] | unique'
# Expected: ["Garden", "Ocean", "Rainbow", "Space"]

# Completed sessions
cat ~/.baby-sensory-sessions.json | jq '[.[].completedFull] | map(select(. == true)) | length'
# Expected: 4
```

**Verify**:
- [ ] Session count matches
- [ ] Touch count matches
- [ ] Theme list matches
- [ ] Completion count matches

### Test 5: React App Runs

```bash
cd baby-sensory-webapplication
npm run dev
```

**Expected**: App starts on localhost:5173 (or similar)

**Verify**:
- [ ] No build errors
- [ ] App loads in browser
- [ ] Can start a session
- [ ] Can interact with animations
- [ ] Scoreboard tracks touches
- [ ] Session completes without errors

### Test 6: Browser Storage Works

1. Open Baby Sensory app
2. Complete a short session (can pause early)
3. Open DevTools → Application → IndexedDB
4. Check `BabySensoryDB` → `sessions`

**Verify**:
- [ ] Database exists
- [ ] Session stored with correct schema
- [ ] Data persists on page refresh

### Test 7: localStorage Backup

In browser console:

```javascript
JSON.parse(localStorage.getItem('baby-sensory-sessions'))
```

**Verify**:
- [ ] Returns array of sessions
- [ ] Includes latest session
- [ ] Matches IndexedDB data

## 🔗 Integration Tests

### Test 8: End-to-End Flow

1. **Play Session**
   - Start Baby Sensory app
   - Complete 20-minute session (or pause early)
   - Verify session in browser storage

2. **Export Data**
   - Open DevTools console
   - Run: `copy(localStorage.getItem('baby-sensory-sessions'))`
   - Paste into `~/.baby-sensory-sessions.json`

3. **Query via MCP** (after Claude restart)
   - Ask Claude: "Show baby-sensory://insights/weekly-summary"
   - Verify response includes your session

**Verify**:
- [ ] Session recorded in browser
- [ ] Data exported to file system
- [ ] MCP server reads updated data
- [ ] Insights reflect new session

### Test 9: Analytics Accuracy

Using sample data:

**Favorite Theme** = Space (appears 2x with 367 total touches)
**Favorite Color** = #FFDD00 (yellow, 146 touches)
**Best Time** = Afternoon (based on timestamps)

**Verify**:
- [ ] Weekly summary shows correct favorite theme
- [ ] Weekly summary shows correct favorite color
- [ ] Theme rankings sort by total touches
- [ ] Color engagement aggregates correctly

### Test 10: Error Handling

Test graceful degradation:

```bash
# Remove sessions file
mv ~/.baby-sensory-sessions.json ~/.baby-sensory-sessions.json.bak

# Start MCP server
node baby-sensory-analytics/dist/index.js
```

**Expected**: Server starts with empty sessions array

**Verify**:
- [ ] No crash on missing file
- [ ] Returns "No sessions this week!" message
- [ ] Can still create new sessions

```bash
# Restore file
mv ~/.baby-sensory-sessions.json.bak ~/.baby-sensory-sessions.json
```

## 🎯 Success Criteria

All tests passing means:

✅ **Build System**: TypeScript compiles correctly
✅ **Data Storage**: File-based persistence works
✅ **MCP Protocol**: Server responds to resource/tool requests
✅ **Analytics**: Computations are accurate
✅ **React Integration**: Sessions log from browser
✅ **Error Handling**: Graceful degradation on missing data

## 🐛 Common Issues

### Issue: "Cannot find module"

**Fix**: Run `npm install` in `baby-sensory-analytics/`

### Issue: "Permission denied"

**Fix**: Make scripts executable
```bash
chmod +x baby-sensory-analytics/*.js
```

### Issue: TypeScript compilation errors

**Fix**: Check Node.js version (need v18+)
```bash
node --version
npm run build 2>&1 | tee build.log
```

### Issue: MCP server not found in Claude

**Fix**:
1. Verify config: `cat ~/.claude/mcp_settings.json`
2. Check path is absolute
3. Restart Claude Code completely

### Issue: Empty insights

**Fix**:
1. Verify data file exists and has sessions
2. Check file permissions: `ls -la ~/.baby-sensory-sessions.json`
3. Validate JSON: `jq '.' ~/.baby-sensory-sessions.json`

## 📝 Test Results Log

Date: _____________

| Test | Status | Notes |
|------|--------|-------|
| 1. Build | ⬜ | |
| 2. Test Data | ⬜ | |
| 3. Config | ⬜ | |
| 4. Integration | ⬜ | |
| 5. Server Start | ⬜ | |
| 6. MCP Inspector | ⬜ | |
| 7. Data Integrity | ⬜ | |
| 8. Analytics | ⬜ | |
| 9. React App | ⬜ | |
| 10. Browser Storage | ⬜ | |
| 11. localStorage | ⬜ | |
| 12. End-to-End | ⬜ | |
| 13. Accuracy | ⬜ | |
| 14. Error Handling | ⬜ | |

---

**All tests passing?** → Ready to use with real session data! 🎉

**Some tests failing?** → Check the troubleshooting section or open an issue.
