/**
 * Game Center Admin Panel
 * ----------------------
 * Main administrative interface for managing game and system settings.
 * 
 * Purpose:
 * - Provides authenticated access to game configuration
 * - Manages system-wide and game-specific settings
 * - Handles user authentication and authorization
 * 
 * Data Flow:
 * 1. Authentication:
 *    - Checks user authentication status via Supabase
 *    - Verifies admin role in profiles table
 *    - Maintains user session state
 * 
 * 2. Settings Management:
 *    - Loads system settings by default
 *    - Loads game-specific settings when game is selected
 *    - Updates settings in real-time
 *    - Maintains version control for settings
 * 
 * 3. State Management:
 *    - User authentication state
 *    - Selected game state
 *    - Settings state
 *    - Loading states
 * 
 * Integration Points:
 * - Supabase:
 *   - Auth: User authentication and session management
 *   - Database: Settings and game data storage
 * 
 * - Components:
 *   - Layout: Page structure and branding
 *   - Header: Navigation and user info
 *   - Settings: Settings form interface
 *   - Login: Authentication form
 * 
 * Security:
 * - Requires authentication
 * - Enforces admin role check
 * - Uses Row Level Security (RLS)
 * - Implements proper error handling
 * 
 * @status ACTIVE and REQUIRED
 * - Critical admin interface
 * - Core functionality for game configuration
 */

import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Login } from '../components/Login';
import { Settings } from '../components/Settings';
import { Header } from '../components/Header';
import { Layout } from '../components/Layout';

type Game = Database['public']['Tables']['rgc_games']['Row'];
type GameSetting = Database['public']['Tables']['rgc_game_settings']['Row'];

export function GameCenter() {
  // Authentication and authorization state
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Data state
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [settings, setSettings] = useState<GameSetting[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);

  // Initialize component and check authentication
  useEffect(() => {
    checkUser();
  }, []);
  
  // Load system settings by default for admin users
  useEffect(() => {
    if (user && isAdmin) {
      loadSystemSettings();
    }
  }, [user, isAdmin]);

  /**
   * Verifies user authentication and admin status
   * Loads games list if user is admin
   */
  async function checkUser() {
    try {
      setIsLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Get profile with role information
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setIsAdmin(false);
        } else {
          const isUserAdmin = profile?.role === 'admin';
          setIsAdmin(isUserAdmin);
          setUser({ ...authUser, profile });
          if (isUserAdmin) {
            loadGames();
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Loads available games from database
   */
  async function loadGames() {
    try {
      const { data, error } = await supabase
        .from('rgc_games')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setGames(data);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  }

  /**
   * Loads system-wide settings
   */
  async function loadSystemSettings() {
    try {
      const { data, error } = await supabase
        .from('rgc_system_settings')
        .select('*')
        .order('key');
      
      if (error) throw error;
      setSettings(data);
      setSelectedGame(''); // Ensure dropdown shows System Settings
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  }

  /**
   * Loads settings for a specific game
   * @param gameSlug - Unique identifier for the game
   */
  async function loadGameSettings(gameSlug: string) {
    try {
      const { data, error } = await supabase
        .from('rgc_game_settings')
        .select(`
          *,
          rgc_games!inner(*)
        `)
        .eq('rgc_games.slug', gameSlug);
      
      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Handles game selection change
   * Loads appropriate settings based on selection
   */
  async function handleGameChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const gameSlug = e.target.value;
    setSelectedGame(gameSlug);

    if (!gameSlug) {
      await loadSystemSettings();
    } else {
      await loadGameSettings(gameSlug);
    }
  }

  /**
   * Updates a setting value
   * Handles both system and game settings
   */
  async function handleSettingUpdate(gameId: string, key: string, value: any) {
    try {
      const isSystemSetting = !selectedGame;
      const table = isSystemSetting ? 'rgc_system_settings' : 'rgc_game_settings';
      const query = supabase.from(table).update({
        value: JSON.stringify(value),
        version: settings.find(s => s.key === key)?.version! + 1
      });
      
      if (isSystemSetting) {
        query.eq('key', key);
      } else {
        query.eq('game_id', gameId).eq('key', key);
      }
      
      const { error } = await query;

      if (error) throw error;
      
      if (isSystemSetting) {
        await loadSystemSettings();
      } else {
        await loadGameSettings(selectedGame);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  // Authentication required
  if (!user) {
    return <Login onLogin={checkUser} />;
  }

  // Admin access required
  if (isAdmin === false || user.profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to access the admin panel.</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setUser(null);
              setIsAdmin(false);
            }}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Main admin interface
  return (
    <Layout>
      <Header user={user} onLogout={async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
      }} />
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <select
            aria-label="Select settings category"
            value={selectedGame}
            onChange={handleGameChange}
            className="w-full p-2 border rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">System Settings</option>
            {games.map(game => (
              <option key={game.id} value={game.slug}>{game.name}</option>
            ))}
          </select>
        </div>

        {settings.length > 0 && (
          <Settings 
            settings={settings}
            onUpdate={handleSettingUpdate}
          />
        )}
      </main>
    </Layout>
  );
}