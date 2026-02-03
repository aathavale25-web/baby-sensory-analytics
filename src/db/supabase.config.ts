/**
 * Supabase configuration
 * Uses environment variables with fallback to direct values
 */

export const supabaseConfig = {
  url: process.env.SUPABASE_URL || 'https://lljqyvtudhjvoalmnouv.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsanF5dnR1ZGhqdm9hbG1ub3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDM5MjUsImV4cCI6MjA4NTcxOTkyNX0.xe8eFsnPEczLClNqfT70Jixcpm8HhC9PrEQhXepoKWo',
};
