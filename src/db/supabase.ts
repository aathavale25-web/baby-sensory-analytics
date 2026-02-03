/**
 * Supabase-based session storage
 * Replaces local file storage with cloud database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session } from '../types.js';
import { supabaseConfig } from './supabase.config.js';
import { ISessionDatabase } from './interface.js';

// Database row type (matches SQL schema with snake_case)
interface SessionRow {
  id: string;
  timestamp: number;
  theme: string;
  duration: number;
  touches: number;
  color_counts: Record<string, number>;
  object_counts: Record<string, number>;
  nursery_rhymes_played: string[];
  streaks: number;
  milestones: number[];
  completed_full: boolean;
  created_at?: string;
}

export class SupabaseSessionDatabase implements ISessionDatabase {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    console.error('Supabase database initialized');
  }

  /**
   * Convert Session (camelCase) to SessionRow (snake_case)
   */
  private toRow(session: Session): Omit<SessionRow, 'created_at'> {
    return {
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
      completed_full: session.completedFull,
    };
  }

  /**
   * Convert SessionRow (snake_case) to Session (camelCase)
   */
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
      completedFull: row.completed_full,
    };
  }

  async load(): Promise<void> {
    // No-op for Supabase (data is always in cloud)
    // Kept for API compatibility with file-based version
  }

  async save(): Promise<void> {
    // No-op for Supabase (writes happen immediately)
    // Kept for API compatibility with file-based version
  }

  async createSession(session: Session): Promise<Session> {
    const row = this.toRow(session);

    const { data, error } = await this.client
      .from('sessions')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw new Error(`Failed to create session: ${error.message}`);
    }

    console.error(`Created session ${session.id} in Supabase`);
    return this.fromRow(data);
  }

  async getSession(id: string): Promise<Session | null> {
    const { data, error } = await this.client
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error getting session:', error);
      throw new Error(`Failed to get session: ${error.message}`);
    }

    return data ? this.fromRow(data) : null;
  }

  async getAllSessions(): Promise<Session[]> {
    const { data, error } = await this.client
      .from('sessions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error getting all sessions:', error);
      throw new Error(`Failed to get sessions: ${error.message}`);
    }

    return data.map(row => this.fromRow(row));
  }

  async getSessionsSince(timestamp: number): Promise<Session[]> {
    const { data, error } = await this.client
      .from('sessions')
      .select('*')
      .gte('timestamp', timestamp)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error getting sessions since:', error);
      throw new Error(`Failed to get sessions: ${error.message}`);
    }

    return data.map(row => this.fromRow(row));
  }

  async getRecentSessions(limit: number = 10): Promise<Session[]> {
    const { data, error } = await this.client
      .from('sessions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting recent sessions:', error);
      throw new Error(`Failed to get sessions: ${error.message}`);
    }

    return data.map(row => this.fromRow(row));
  }

  async deleteSession(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      throw new Error(`Failed to delete session: ${error.message}`);
    }

    console.error(`Deleted session ${id} from Supabase`);
    return true;
  }

  async clearAllSessions(): Promise<void> {
    const { error } = await this.client
      .from('sessions')
      .delete()
      .neq('id', ''); // Delete all rows

    if (error) {
      console.error('Error clearing sessions:', error);
      throw new Error(`Failed to clear sessions: ${error.message}`);
    }

    console.error('Cleared all sessions from Supabase');
  }
}
