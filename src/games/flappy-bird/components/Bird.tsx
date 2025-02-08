/**
 * Bird Component
 * -------------
 * Visual representation of the player-controlled bird in the Flappy Bird game.
 * 
 * Purpose:
 * - Renders the animated bird character
 * - Handles visual rotation based on velocity
 * - Provides animated wing flapping effect
 * 
 * Data Flow:
 * 1. Position Management:
 *    - Receives vertical position from parent Game component
 *    - Updates position through CSS transforms
 *    - Smooth transitions handled by CSS
 * 
 * 2. Visual Effects:
 *    - Rotation reflects movement direction
 *    - Wing animation using CSS keyframes
 *    - Color transitions for visual feedback
 * 
 * Integration Points:
 * - Game.tsx: Parent component that:
 *   - Controls bird position through physics
 *   - Manages rotation based on velocity
 *   - Handles collision detection
 * 
 * Visual Design:
 * - Round body with custom colors
 * - Animated wing for flying effect
 * - Eye and beak details for character
 * - Smooth rotation transitions
 * 
 * @status ACTIVE and REQUIRED
 * - Core visual component
 * - Essential for game feedback
 */

import * as React from 'react';

interface BirdProps {
  position: number;
  rotation: number;
}

/**
 * Renders the bird character with position and rotation
 * 
 * @param position - Vertical position in pixels
 * @param rotation - Current rotation angle in degrees
 */
export default function Bird({ position, rotation }: BirdProps) {
  return (
    <div
      className="absolute w-12 h-12 left-24"
      style={{
        top: `${position}px`,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.1s ease-in-out',
      }}
    >
      <div className="w-full h-full rounded-full bg-yellow-400 relative">
        {/* Wing */}
        <div className="absolute w-8 h-5 bg-yellow-500 rounded-full right-5 top-5 animate-flap">
          <div className="absolute w-6 h-4 bg-yellow-600 rounded-full right-1 top-0.5" />
        </div>
        {/* Eye */}
        <div className="absolute w-4 h-4 bg-white rounded-full right-2 top-2">
          <div className="absolute w-2 h-2 bg-black rounded-full right-0 top-1" />
        </div>
        {/* Beak */}
        <div className="absolute w-2 h-3 bg-orange-500 rounded-sm left-11 top-5 transform rotate-12" />
      </div>
    </div>
  );
}