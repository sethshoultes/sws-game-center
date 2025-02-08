/**
 * Settings Component
 * -----------------
 * A reusable component for rendering and managing both game-specific and system-wide settings.
 * 
 * Purpose:
 * - Provides a unified interface for managing configuration settings
 * - Handles different setting types (number, color, text)
 * - Maintains consistent UI across the application
 * 
 * Data Flow:
 * 1. Settings Loading:
 *    - Receives settings array from parent component
 *    - Parses JSON values into appropriate format
 *    - Sorts settings alphabetically by key
 * 
 * 2. Settings Updates:
 *    - Captures user input changes
 *    - Validates input based on setting type
 *    - Propagates changes to parent through onUpdate callback
 *    - Maintains version control through parent component
 * 
 * Integration Points:
 * - GameCenter: Main admin interface
 * - Supabase: Settings storage and retrieval
 * - Database Types: Shared type definitions
 * 
 * Props:
 * @param {GameSetting[]} settings - Array of settings to render
 * @param {Function} onUpdate - Callback for setting updates
 * 
 * Setting Types Supported:
 * - number: Numeric inputs with min/max/step
 * - color: Color picker with preview
 * - text: Text input with optional preview (e.g., logo URL)
 * 
 * @status ACTIVE and REQUIRED
 * - Core component for settings management
 * - Used by both game and system settings
 */

import * as React from 'react';
import type { Database } from '../lib/database.types';

type GameSetting = Database['public']['Tables']['rgc_game_settings']['Row'] | Database['public']['Tables']['rgc_system_settings']['Row'];

interface SettingsProps {
  settings: GameSetting[];
  onUpdate: (gameId: string, key: string, value: any) => void;
}

export function Settings({ settings, onUpdate }: SettingsProps) {
  // Sort settings by key to maintain consistent order
  const sortedSettings = React.useMemo(() => {
    return [...settings].sort((a, b) => a.key.localeCompare(b.key));
  }, [settings]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">
        {!('game_id' in settings[0]) ? 'System Settings' : 'Game Settings'}
      </h2>
      <div className="space-y-6">
        {sortedSettings.map(setting => renderSetting(setting))}
      </div>
    </div>
  );

  /**
   * Renders an individual setting based on its type
   * Handles different input types and their specific requirements
   * 
   * @param {GameSetting} setting - The setting to render
   * @returns {JSX.Element} The rendered setting input and metadata
   */
  function renderSetting(setting: GameSetting) {
    // Parse setting value from JSON if needed
    const value = typeof setting.value === 'string'
      ? JSON.parse(setting.value)
      : setting.value;

    // Determine input type and styling
    const inputType = value.type === 'text' ? 'text' : value.type;
    const baseInputClass = "p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500";
    const inputClass = value.type === 'color'
      ? `${baseInputClass} h-12 w-24 cursor-pointer`
      : `${baseInputClass} w-full`;

    return (
      <div key={`${setting.key}-${setting.id}`} className="border-b pb-6">
        <label className="block font-medium mb-2">
          {setting.key}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type={inputType}
              value={value.value}
              min={value.min}
              max={value.max}
              step={value.step}
              onChange={(e) => onUpdate(
                setting.game_id,
                setting.key,
                {
                  ...value,
                  value: value.type === 'number'
                    ? parseFloat(e.target.value)
                    : e.target.value
                }
              )}
              className={inputClass}
            />
          </div>
          <div className="w-32 flex items-center justify-end">
            {/* Preview for color settings */}
            {value.type === 'color' && (
              <div 
                className="w-8 h-8 rounded border shadow-sm"
                style={{ backgroundColor: value.value }}
                title={value.value}
              />
            )}
            {/* Preview for logo URLs */}
            {value.type === 'text' && value.key === 'logoUrl' && value.value && (
              <img
                src={value.value}
                alt="Logo preview"
                className="h-8 w-auto ml-2"
              />
            )}
            {/* Range display for number inputs */}
            {value.type === 'number' && (
              <div className="text-sm text-gray-500">
                {value.min} - {value.max}
              </div>
            )}
          </div>
        </div>
        {/* Setting description */}
        {setting.description && (
          <p className="text-sm text-gray-500 mt-2">
            {setting.description}
          </p>
        )}
      </div>
    );
  }
}