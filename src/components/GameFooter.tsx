/**
 * Game Footer Component
 * -------------------
 * Navigation footer for games with home and admin links.
 * 
 * Purpose:
 * - Provides consistent navigation across games
 * - Shows admin link when user is authenticated
 * - Handles navigation actions
 * 
 * Integration Points:
 * - Supabase: Authentication state
 * - App: Navigation handling
 */

import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Home, Settings } from 'lucide-react';

interface GameFooterProps {
  onHome: () => void;
}

export function GameFooter({ onHome }: GameFooterProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  async function checkAdminStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/20 backdrop-blur-sm p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button
          onClick={onHome}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded shadow hover:bg-gray-100 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        {isAdmin && (
          <a
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded shadow hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Admin</span>
          </a>
        )}
      </div>
    </div>
  );
}