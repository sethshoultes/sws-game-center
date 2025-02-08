/**
 * Header Component
 * ---------------
 * Main navigation header for the Game Center admin interface.
 * 
 * Purpose:
 * - Provides consistent header layout across admin pages
 * - Displays user information and authentication status
 * - Handles user logout functionality
 * 
 * Data Flow:
 * 1. User Information:
 *    - Receives user object from parent component
 *    - Extracts display name from user profile
 *    - Falls back to email if no display name
 * 
 * 2. Authentication:
 *    - Handles logout action
 *    - Propagates logout event to parent
 *    - Cleans up user session
 * 
 * Integration Points:
 * - Parent Components:
 *   - GameCenter: Main admin interface
 *   - Layout: Page structure
 * 
 * - Components:
 *   - Uses Lucide icons for visual elements
 * 
 * Props:
 * @param {Object} user - User object containing profile information
 * @param {Function} onLogout - Callback fired on logout action
 * 
 * Security:
 * - Only displays authorized user information
 * - Handles logout securely
 * - Cleans up session data
 * 
 * @status ACTIVE and REQUIRED
 * - Critical navigation component
 * - Core part of admin interface
 */

import * as React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  // Get display name from profile, username, or fall back to email
  const displayName = user.profile?.display_name || user.profile?.username || user.email;

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Game Center Admin
            </h1>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4">{displayName}</span>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}