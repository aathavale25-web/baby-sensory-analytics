/**
 * Common interface for session database implementations
 */

import { Session } from '../types.js';

export interface ISessionDatabase {
  load(): Promise<void>;
  save(): Promise<void>;
  createSession(session: Session): Promise<Session>;
  getSession(id: string): Promise<Session | null>;
  getAllSessions(): Promise<Session[]>;
  getSessionsSince(timestamp: number): Promise<Session[]>;
  getRecentSessions(limit?: number): Promise<Session[]>;
  deleteSession(id: string): Promise<boolean>;
  clearAllSessions(): Promise<void>;
}
