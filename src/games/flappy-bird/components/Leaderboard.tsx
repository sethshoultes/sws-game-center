/**
 * Leaderboard Component
 * -------------------
 * Displays high scores for the Flappy Bird game with real-time updates.
 * 
 * Purpose:
 * - Shows top player scores in a ranked list
 * - Provides visual feedback for loading state
 * - Displays empty state when no scores exist
 * - Updates in real-time as new scores are added
 * 
 * Data Flow:
 * 1. Score Data:
 *    - Receives high scores array from parent Game component
 *    - Scores sorted by value in descending order
 *    - Limited to top 3 scores
 *    - Updates when new high scores are submitted
 * 
 * 2. Loading State:
 *    - Managed by parent through isLoading prop
 *    - Shows loading message during data fetch
 *    - Prevents empty flash before data loads
 * 
 * Integration Points:
 * - Game.tsx: Parent component that:
 *   - Fetches scores from Supabase
 *   - Manages loading state
 *   - Updates scores after new submissions
 * 
 * - Database:
 *   - high_scores table structure:
 *     - id: Unique identifier
 *     - user_id: Player reference
 *     - score: Numeric score value
 *     - username: Player display name
 * 
 * Visual Design:
 * - Clean, card-based layout
 * - Trophy icon for visual context
 * - Ranked list with position indicators
 * - Highlighted score values
 * 
 * @status ACTIVE and REQUIRED
 * - Core game feature
 * - Essential for player engagement
 */

import * as React from 'react';
import { Trophy } from 'lucide-react';
import type { Database } from '../../../lib/database.types';

type HighScore = Database['public']['Tables']['high_scores']['Row'];

interface LeaderboardProps {
  scores: HighScore[];
  isLoading: boolean;
}

/**
 * Renders the high scores leaderboard
 * 
 * @param scores - Array of high scores to display
 * @param isLoading - Loading state indicator
 */
export default function Leaderboard({ scores, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-900">Loading scores...</h2>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-900">No high scores yet!</h2>
        <p className="text-gray-600">Be the first to set a record!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900">Top Scores</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {scores.map((score, index) => (
          <div
            key={score.id}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">#{index + 1}</span>
              <span className="font-medium text-gray-900">{score.username}</span>
            </div>
            <span className="font-bold text-blue-500">{score.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}