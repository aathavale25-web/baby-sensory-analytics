#!/usr/bin/env node

/**
 * Test script for Baby Sensory Analytics MCP Server
 *
 * Creates sample session data and tests the server's capabilities
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SESSIONS_FILE = path.join(process.env.HOME, '.baby-sensory-sessions.json')

// Sample session data
const sampleSessions = [
  {
    id: 'session-001',
    timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
    theme: 'Ocean',
    duration: 1200,
    touches: 156,
    colorCounts: {
      '#4ECDC4': 45,
      '#0088FF': 38,
      '#AADDFF': 32,
      '#00FFFF': 25,
      '#004488': 16,
    },
    objectCounts: {
      '🐟': 48,
      '🫧': 35,
      '🌊': 28,
    },
    nurseryRhymesPlayed: ['Twinkle Twinkle', 'Row Row Row Your Boat'],
    streaks: 12,
    milestones: [10, 25, 50, 100, 150],
    completedFull: true,
  },
  {
    id: 'session-002',
    timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
    theme: 'Space',
    duration: 1200,
    touches: 189,
    colorCounts: {
      '#8800FF': 52,
      '#0088FF': 45,
      '#FFDD00': 38,
      '#FF00FF': 32,
      '#AADDFF': 22,
    },
    objectCounts: {
      '⭐': 64,
      '🪐': 42,
      '✨': 38,
    },
    nurseryRhymesPlayed: ['Twinkle Twinkle', 'Baa Baa Black Sheep', 'Twinkle Twinkle'],
    streaks: 15,
    milestones: [10, 25, 50, 100, 150],
    completedFull: true,
  },
  {
    id: 'session-003',
    timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
    theme: 'Garden',
    duration: 1200,
    touches: 203,
    colorCounts: {
      '#FF44FF': 58,
      '#FFDD00': 48,
      '#00FF88': 42,
      '#88FF44': 35,
      '#FF88CC': 20,
    },
    objectCounts: {
      '🌸': 72,
      '🦋': 68,
      '✨': 32,
    },
    nurseryRhymesPlayed: ['Mary Had a Little Lamb', 'Baa Baa Black Sheep'],
    streaks: 18,
    milestones: [10, 25, 50, 100, 150, 200],
    completedFull: true,
  },
  {
    id: 'session-004',
    timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
    theme: 'Rainbow',
    duration: 900,
    touches: 142,
    colorCounts: {
      '#FF0000': 28,
      '#FF8800': 26,
      '#FFDD00': 25,
      '#00FF00': 22,
      '#0088FF': 20,
      '#8800FF': 21,
    },
    objectCounts: {
      '🔷': 58,
      '🌊': 42,
      '✨': 35,
    },
    nurseryRhymesPlayed: ['Twinkle Twinkle'],
    streaks: 10,
    milestones: [10, 25, 50, 100],
    completedFull: false,
  },
  {
    id: 'session-005',
    timestamp: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
    theme: 'Space',
    duration: 1200,
    touches: 178,
    colorCounts: {
      '#8800FF': 48,
      '#FF00FF': 42,
      '#FFDD00': 35,
      '#0088FF': 32,
      '#AADDFF': 21,
    },
    objectCounts: {
      '⭐': 68,
      '🪐': 55,
      '✨': 42,
    },
    nurseryRhymesPlayed: ['Twinkle Twinkle', 'Twinkle Twinkle', 'Mary Had a Little Lamb'],
    streaks: 14,
    milestones: [10, 25, 50, 100, 150],
    completedFull: true,
  },
]

async function createTestData() {
  console.log('🧪 Creating test session data...\n')

  try {
    // Write sample sessions to file
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sampleSessions, null, 2), 'utf-8')
    console.log(`✅ Created ${sampleSessions.length} sample sessions`)
    console.log(`📁 Saved to: ${SESSIONS_FILE}\n`)

    // Display summary
    console.log('📊 Test Data Summary:')
    console.log('─'.repeat(50))
    sampleSessions.forEach((session, i) => {
      const date = new Date(session.timestamp)
      console.log(`${i + 1}. ${session.theme} - ${session.touches} touches`)
      console.log(`   ${date.toLocaleString()}`)
      console.log(`   Duration: ${session.duration}s, Completed: ${session.completedFull ? '✅' : '❌'}`)
      console.log()
    })

    // Calculate insights
    console.log('🎯 Expected Insights:')
    console.log('─'.repeat(50))

    const themeCount = {}
    const totalTouches = sampleSessions.reduce((sum, s) => {
      themeCount[s.theme] = (themeCount[s.theme] || 0) + s.touches
      return sum + s.touches
    }, 0)

    const favoriteTheme = Object.entries(themeCount)
      .sort(([, a], [, b]) => b - a)[0][0]

    const allColors = {}
    sampleSessions.forEach(s => {
      Object.entries(s.colorCounts).forEach(([color, count]) => {
        allColors[color] = (allColors[color] || 0) + count
      })
    })
    const favoriteColor = Object.entries(allColors)
      .sort(([, a], [, b]) => b - a)[0][0]

    console.log(`Total Sessions: ${sampleSessions.length}`)
    console.log(`Total Touches: ${totalTouches}`)
    console.log(`Favorite Theme: ${favoriteTheme} (${themeCount[favoriteTheme]} touches)`)
    console.log(`Favorite Color: ${favoriteColor} (${allColors[favoriteColor]} touches)`)
    console.log()

    console.log('✅ Test data created successfully!')
    console.log('\n🚀 Next steps:')
    console.log('1. Test the MCP server: npm run inspector')
    console.log('2. Query insights via Claude or MCP client')
    console.log('3. Try resources like baby-sensory://insights/weekly-summary')

  } catch (error) {
    console.error('❌ Error creating test data:', error)
    process.exit(1)
  }
}

createTestData()

export { sampleSessions }
