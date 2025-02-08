/**
 * @fileoverview Supabase Client Configuration
 * 
 * This module initializes and exports the Supabase client instance used throughout
 * the Game Center application. It provides a centralized point for database access
 * and authentication services.
 * 
 * Data Flow Architecture:
 * 1. Authentication:
 *    - Sign In: Client → Supabase Auth → JWT → Local Storage
 *    - Sign Out: Client → Supabase Auth → Clear Local Storage
 * 
 * 2. Database Access:
 *    - Games: Client → Supabase → rgc_games table
 *    - Settings: Client → Supabase → rgc_game_settings table
 *    - High Scores: Client → Supabase → rgc_high_scores table
 *    - Profiles: Client → Supabase → profiles table
 * 
 * Integration Points:
 * - GameCenter component: Main admin interface
 * - Game components: Settings and high score management
 * - Login component: Authentication handling
 * - Settings component: Game configuration
 * 
 * Security:
 * - Uses environment variables for sensitive credentials
 * - Implements Row Level Security through Supabase policies
 * - Supports role-based access control via profiles table
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables must be prefixed with VITE_ to be exposed to the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Configured Supabase client instance with type safety.
 * Uses Database type definition for strong typing of queries and responses.
 * 
 * @example
 * // Fetch games with type safety
 * const { data: games } = await supabase
 *   .from('rgc_games')
 *   .select('*');
 * 
 * // Access typed game properties
 * games?.forEach(game => console.log(game.name));
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);