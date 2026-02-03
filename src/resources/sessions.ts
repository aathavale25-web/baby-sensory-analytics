/**
 * Session resource handlers
 */

import { randomUUID } from 'crypto';
import { Session, CreateSessionRequest } from '../types.js';
import { ISessionDatabase } from '../db/interface.js';

export async function createSession(
  db: ISessionDatabase,
  request: CreateSessionRequest
): Promise<Session> {
  const session: Session = {
    id: randomUUID(),
    timestamp: Date.now(),
    ...request
  };

  return await db.createSession(session);
}

export async function getSession(
  db: ISessionDatabase,
  id: string
): Promise<Session | null> {
  return await db.getSession(id);
}

export async function listSessions(
  db: ISessionDatabase,
  limit?: number
): Promise<Session[]> {
  if (limit) {
    return await db.getRecentSessions(limit);
  }
  return await db.getAllSessions();
}

export async function getRecentSessions(
  db: ISessionDatabase,
  days: number = 7
): Promise<Session[]> {
  const since = Date.now() - (days * 24 * 60 * 60 * 1000);
  return await db.getSessionsSince(since);
}

export async function deleteSession(
  db: ISessionDatabase,
  id: string
): Promise<boolean> {
  return await db.deleteSession(id);
}

export async function exportAllSessions(
  db: ISessionDatabase
): Promise<string> {
  const sessions = await db.getAllSessions();
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    totalSessions: sessions.length,
    sessions
  }, null, 2);
}
