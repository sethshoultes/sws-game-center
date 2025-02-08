/**
 * Login Component
 * --------------
 * Authentication interface for the Game Center admin panel.
 * 
 * Purpose:
 * - Provides secure authentication for admin users
 * - Handles login form submission and validation
 * - Manages authentication state and error handling
 * 
 * Data Flow:
 * 1. Authentication:
 *    - User enters credentials
 *    - Credentials sent to Supabase auth
 *    - JWT token received and stored
 *    - User session established
 * 
 * 2. Error Handling:
 *    - Validates input fields
 *    - Displays authentication errors
 *    - Manages loading states
 * 
 * Integration Points:
 * - Supabase:
 *   - Auth: signInWithPassword
 *   - Session management
 * 
 * - Components:
 *   - GameCenter: Parent component managing auth state
 *   - Layout: Page structure (when used standalone)
 * 
 * Props:
 * @param {Function} onLogin - Callback fired on successful authentication
 * 
 * Security:
 * - Uses Supabase's secure authentication
 * - Implements proper error handling
 * - Manages sensitive data appropriately
 * 
 * @status ACTIVE and REQUIRED
 * - Critical for admin access
 * - Core authentication component
 */

import * as React from 'react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles form submission and authentication
   * @param {React.FormEvent} e - Form submission event
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Attempt authentication
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Notify parent of successful login
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Game Center Admin
          </h2>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}