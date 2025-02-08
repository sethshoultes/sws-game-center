/**
 * Game Center Main Application
 * --------------------------
 * Root component that manages game selection, routing, and admin interface access.
 * 
 * Purpose:
 * - Provides game selection interface
 * - Handles routing between games and admin panel
 * - Manages current game state
 * - Controls navigation flow
 * 
 * Data Flow:
 * 1. Routing:
 *    - Checks URL path for admin routes
 *    - Renders appropriate interface based on path
 *    - Manages navigation between games and admin
 * 
 * 2. Game State:
 *    - Tracks currently selected game
 *    - Manages game component mounting/unmounting
 *    - Preserves game state during play
 * 
 * 3. Admin Access:
 *    - Detects admin route requests
 *    - Loads admin interface when needed
 *    - Maintains admin session state
 * 
 * Integration Points:
 * - Games:
 *   - CrossyRoad: Road crossing game
 *   - FlappyBird: Flying obstacle game
 *   - Future games can be added here
 * 
 * - Components:
 *   - GameCenter: Admin interface
 *   - GameFooter: Navigation controls
 *   - Layout: Page structure
 * 
 * - URL Routes:
 *   - /: Game selection screen
 *   - /admin: Admin interface
 *   - /admin/*: Admin sub-routes
 * 
 * Game Selection:
 * - Grid layout of available games
 * - Consistent card styling
 * - Clear game descriptions
 * - Smooth transitions
 * 
 * @status ACTIVE and REQUIRED
 * - Core application component
 * - Essential for game access
 */

import * as React from 'react';
import { useState } from 'react';
import { GameCenter } from './admin/GameCenter';
import { CrossyRoad } from './games/crossy-road/Game';
import { FlappyBird } from './games/flappy-bird/Game';
import { GameFooter } from './components/GameFooter';
import { Layout } from './components/Layout';

function App() {
  // Track currently selected game
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  
  // Check if we're on any admin route
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  // Show admin panel for any admin route
  if (isAdminRoute) {
    return <GameCenter />;
  }
  
  // Game selection screen
  if (!currentGame) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Game Center</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* Crossy Road Game Card */}
          <button
            onClick={() => setCurrentGame('crossy-road')}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crossy Road</h2>
            <p className="text-gray-600">Help your character cross the busy road!</p>
          </button>
          {/* Flappy Bird Game Card */}
          <button
            onClick={() => setCurrentGame('flappy-bird')}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Flappy Bird</h2>
            <p className="text-gray-600">Navigate through pipes and set high scores!</p>
          </button>
        </div>
      </div>
      </Layout>
    );
  }
  
  // Render the selected game with navigation footer
  return (
    <div className="min-h-screen">
      {currentGame === 'crossy-road' ? <CrossyRoad /> : <FlappyBird />}
      <GameFooter onHome={() => setCurrentGame(null)} />
    </div>
  );
}

export default App;