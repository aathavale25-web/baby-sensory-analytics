#!/usr/bin/env node

/**
 * Browser Session Sync Script
 *
 * This script extracts session data from the browser's localStorage
 * and syncs it to the file that the MCP server reads.
 *
 * Run this periodically or integrate with the web app to keep data in sync.
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

const SESSIONS_FILE = path.join(process.env.HOME, '.baby-sensory-sessions.json')

/**
 * Extract localStorage data from Chrome/Edge using osascript (macOS)
 */
async function extractFromChrome() {
  try {
    console.log('Attempting to extract localStorage from Chrome...')

    // Find Chrome localStorage database
    const chromeProfilePath = path.join(
      process.env.HOME,
      'Library/Application Support/Google/Chrome/Default'
    )

    const localStoragePath = path.join(chromeProfilePath, 'Local Storage/leveldb')

    if (!fs.existsSync(localStoragePath)) {
      console.log('Chrome localStorage not found')
      return null
    }

    // For now, instruct user to export manually
    console.log('\n⚠️  Automated extraction from Chrome requires additional setup.')
    console.log('Please copy session data manually from browser console:')
    console.log('\n  JSON.parse(localStorage.getItem("baby-sensory-sessions"))')
    console.log(`\nThen save it to: ${SESSIONS_FILE}\n`)

    return null
  } catch (error) {
    console.error('Error extracting from Chrome:', error.message)
    return null
  }
}

/**
 * Read existing sessions from file
 */
function readExistingSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading existing sessions:', error.message)
  }
  return []
}

/**
 * Write sessions to file
 */
function writeSessions(sessions) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8')
    console.log(`✅ Wrote ${sessions.length} sessions to ${SESSIONS_FILE}`)
  } catch (error) {
    console.error('Error writing sessions:', error.message)
  }
}

/**
 * Main sync function
 */
async function sync() {
  console.log('🔄 Syncing browser sessions to MCP server...\n')

  // Try to extract from browser (manual for now)
  const browserSessions = await extractFromChrome()

  if (!browserSessions) {
    console.log('ℹ️  No new sessions to sync.')
    console.log(`Current sessions file: ${SESSIONS_FILE}`)

    const existing = readExistingSessions()
    console.log(`Total sessions in file: ${existing.length}`)

    if (existing.length > 0) {
      const latest = existing[existing.length - 1]
      const date = new Date(latest.timestamp)
      console.log(`Latest session: ${latest.theme} at ${date.toLocaleString()}`)
    }

    return
  }

  // Merge with existing
  const existing = readExistingSessions()
  const existingIds = new Set(existing.map(s => s.id))

  const newSessions = browserSessions.filter(s => !existingIds.has(s.id))

  if (newSessions.length > 0) {
    const merged = [...existing, ...newSessions]
    writeSessions(merged)
    console.log(`✅ Added ${newSessions.length} new sessions`)
  } else {
    console.log('ℹ️  No new sessions to add')
  }
}

// Run sync
if (require.main === module) {
  sync().catch(error => {
    console.error('Sync failed:', error)
    process.exit(1)
  })
}

module.exports = { sync }
