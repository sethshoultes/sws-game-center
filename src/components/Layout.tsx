/**
 * Layout Component
 * ---------------
 * Core layout component that provides consistent structure and branding across the application.
 * 
 * Purpose:
 * - Provides consistent page structure (header, main content, footer)
 * - Manages and applies system-wide branding settings
 * - Handles dynamic branding updates through Supabase
 * 
 * Data Flow:
 * 1. Branding Settings:
 *    - Loads system settings from Supabase on mount
 *    - Applies branding configuration (logo, colors, name)
 *    - Updates UI when settings change
 * 
 * 2. Layout Structure:
 *    - Wraps child components in consistent layout
 *    - Provides responsive container widths
 *    - Maintains proper spacing and alignment
 * 
 * Integration Points:
 * - Supabase:
 *   - rgc_system_settings table for branding configuration
 *   - Real-time updates when settings change
 * 
 * - Components:
 *   - App: Main application wrapper
 *   - GameCenter: Admin interface structure
 *   - Game components: Game interface structure
 * 
 * Props:
 * @param {React.ReactNode} children - Child components to render in layout
 * 
 * Database Integration:
 * - Table: rgc_system_settings
 * - Keys:
 *   - logoUrl: Brand logo image URL
 *   - brandName: System name
 *   - primaryColor: Main brand color
 *   - secondaryColor: Accent brand color
 * 
 * @status ACTIVE and REQUIRED
 * - Core layout component
 * - Used across entire application
 */

import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Home, Settings, Github, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface BrandingSettings {
  logoUrl: string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
}

export function Layout({ children }: LayoutProps) {
  // Initialize with default branding settings
  const [settings, setSettings] = useState<BrandingSettings>({
    logoUrl: 'https://adventurebuildrstorage.storage.googleapis.com/wp-content/uploads/2024/10/11185818/AdventureBuildr-Logo-e1731351627826.png',
    brandName: 'Game Center',
    primaryColor: '#4f46e5',
    secondaryColor: '#6366f1'
  });

  // Load branding settings on component mount
  useEffect(() => {
    loadBrandingSettings();
  }, []);

  /**
   * Loads branding settings from Supabase
   * Updates local state with fetched settings
   */
  async function loadBrandingSettings() {
    try {
      const { data: settingsData } = await supabase
        .from('rgc_system_settings')
        .select('*');

      if (settingsData) {
        const newSettings = { ...settings };
        settingsData.forEach(setting => {
          const value = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
          newSettings[setting.key as keyof BrandingSettings] = value.value;
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error loading branding settings:', error);
      // Keep using default settings on error
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with branding */}
      <header className="bg-white shadow relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-36 items-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img
                src={settings.logoUrl}
                alt={settings.brandName}
                className="h-24 w-auto mt-2"
              />
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded shadow hover:bg-gray-200 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              {window.location.pathname !== '/admin' && (
                <a
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded shadow hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Admin</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main>{children}</main>

      {/* Footer with copyright */}
      <footer className="bg-white shadow mt-auto fixed bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Current Path: {window.location.pathname}
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://adventurebuildr.com/sws-gc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <img
                  src="https://adventurebuildrstorage.storage.googleapis.com/wp-content/uploads/2024/11/15233239/SethSquatch-AdventureBuildr-Icon-1.png"
                  alt="AdventureBuildr"
                  className="w-8 h-8"
                />
              </a>
              <a
                href="https://github.com/sethshoultes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://bolt.new/?rid=ec8szn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Zap className="w-5 h-5" />
              </a>
            </div>
          </div>
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
          </p>
        </div>
      </footer>
      <div className="h-24" /> {/* Spacer for fixed footer */}
    </div>
  );
}