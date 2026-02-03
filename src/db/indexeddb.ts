/**
 * IndexedDB wrapper for local-first session storage
 * Note: This will be used via a browser context, but we provide
 * a file-based fallback for the MCP server running in Node.js
 */

import fs from 'fs/promises';
import path from 'path';
import { Session } from '../types.js';

const DB_FILE_PATH = path.join(process.env.HOME || '.', '.baby-sensory-sessions.json');

export class SessionDatabase {
  private sessions: Session[] = [];
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;

    try {
      const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
      this.sessions = JSON.parse(data);
      console.error(`Loaded ${this.sessions.length} sessions from ${DB_FILE_PATH}`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.error('No existing sessions file, starting fresh');
        this.sessions = [];
      } else {
        console.error('Error loading sessions:', error);
        throw error;
      }
    }

    this.loaded = true;
  }

  async save(): Promise<void> {
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(this.sessions, null, 2), 'utf-8');
    console.error(`Saved ${this.sessions.length} sessions to ${DB_FILE_PATH}`);
  }

  async createSession(session: Session): Promise<Session> {
    await this.load();
    this.sessions.push(session);
    await this.save();
    return session;
  }

  async getSession(id: string): Promise<Session | null> {
    await this.load();
    return this.sessions.find(s => s.id === id) || null;
  }

  async getAllSessions(): Promise<Session[]> {
    await this.load();
    return [...this.sessions].sort((a, b) => b.timestamp - a.timestamp);
  }

  async getSessionsSince(timestamp: number): Promise<Session[]> {
    await this.load();
    return this.sessions
      .filter(s => s.timestamp >= timestamp)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async getRecentSessions(limit: number = 10): Promise<Session[]> {
    await this.load();
    return [...this.sessions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async deleteSession(id: string): Promise<boolean> {
    await this.load();
    const initialLength = this.sessions.length;
    this.sessions = this.sessions.filter(s => s.id !== id);

    if (this.sessions.length < initialLength) {
      await this.save();
      return true;
    }

    return false;
  }

  async clearAllSessions(): Promise<void> {
    this.sessions = [];
    await this.save();
  }
}
