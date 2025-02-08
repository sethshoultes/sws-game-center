/**
 * Database Type Definitions
 * ------------------------
 * TypeScript type definitions for the Supabase database schema.
 * Provides type safety and autocompletion for database operations.
 * 
 * Purpose:
 * - Defines table structures and relationships
 * - Ensures type safety in database operations
 * - Provides IntelliSense support for queries
 * - Documents database schema for developers
 * 
 * Database Structure:
 * 1. Core Tables:
 *    - profiles: User profiles and roles
 *    - rgc_games: Available games
 *    - rgc_game_settings: Game-specific settings
 *    - rgc_high_scores: Player achievements
 *    - rgc_system_settings: Global configuration
 * 
 * Data Flow:
 * 1. Type Usage:
 *    - Imported by components needing database types
 *    - Used with Supabase client for typed queries
 *    - Provides types for insert/update operations
 * 
 * 2. Type Safety:
 *    - Validates query parameters
 *    - Ensures correct column names
 *    - Types query results automatically
 * 
 * Integration Points:
 * - Supabase Client:
 *   - Used in type parameter for createClient
 *   - Provides typed query methods
 * 
 * - Components:
 *   - Game components for settings
 *   - Admin panel for configuration
 *   - Leaderboard for high scores
 * 
 * @status ACTIVE and REQUIRED
 * - Critical for type safety
 * - Essential for database operations
 */

export interface Database {
  public: {
    Tables: {
      /**
       * User Profiles Table
       * Stores user information and role assignments
       */
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      /**
       * Games Table
       * Stores available games and their metadata
       */
      rgc_games: {
        Row: {
          id: string;
          name: string;
          slug: string;
          active: boolean;
          created_at: string;
          updated_at: string;
          last_accessed: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_accessed?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_accessed?: string | null;
        };
      };
      /**
       * Game Settings Table
       * Stores configurable parameters for each game
       */
      rgc_game_settings: {
        Row: {
          id: string;
          game_id: string;
          key: string;
          value: any;
          description: string | null;
          created_at: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          id?: string;
          game_id: string;
          key: string;
          value: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          id?: string;
          game_id?: string;
          key?: string;
          value?: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
      };
      /**
       * High Scores Table
       * Stores player achievements and rankings
       */
      rgc_high_scores: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          created_at: string;
          username: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          created_at?: string;
          username: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          score?: number;
          created_at?: string;
          username?: string;
        };
      };
      /**
       * System Settings Table
       * Stores global configuration parameters
       */
      rgc_system_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          description: string | null;
          created_at: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
      };
    };
  };
}