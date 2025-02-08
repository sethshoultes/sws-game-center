/**
 * Pipe Component
 * -------------
 * Renders individual pipe obstacles in the Flappy Bird game.
 * 
 * Purpose:
 * - Creates the main obstacles that the bird must navigate through
 * - Provides visual representation of game difficulty
 * - Maintains consistent game challenge through precise positioning
 * 
 * Data Flow:
 * 1. Position Management:
 *    - Receives horizontal position from parent Game component
 *    - Updates position through CSS transforms
 *    - Maintains fixed width for consistent gameplay
 * 
 * 2. Height Control:
 *    - Height determined by parent to create passable gaps
 *    - Adjusts based on game difficulty
 *    - Synchronized with paired pipe (top/bottom)
 * 
 * Integration Points:
 * - Game.tsx: Parent component that:
 *   - Controls pipe movement
 *   - Manages pipe spawning
 *   - Handles collision detection
 *   - Coordinates gap spacing
 * 
 * Visual Design:
 * - Green pipe body with darker border
 * - Extended lip at pipe end
 * - Consistent width for hitbox clarity
 * - Positioned absolutely for smooth movement
 * 
 * @status ACTIVE and REQUIRED
 * - Core obstacle component
 * - Essential for game difficulty
 */

import * as React from 'react';

interface PipeProps {
  position: number;
  height: number;
  isTop: boolean;
}

/**
 * Renders a single pipe obstacle
 * 
 * @param position - Horizontal position in pixels
 * @param height - Pipe height in pixels
 * @param isTop - Whether this is a top pipe (true) or bottom pipe (false)
 */
export default function Pipe({ position, height, isTop }: PipeProps) {
  return (
    <div
      className={`absolute w-20 bg-green-500 border-4 border-green-700 ${
        isTop ? 'top-0' : 'bottom-0'
      }`}
      style={{
        left: `${position}px`,
        height: `${height}px`,
      }}
    >
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-24 h-8 bg-green-500 border-4 border-green-700 ${
          isTop ? 'bottom-0' : 'top-0'
        }`}
      />
    </div>
  );
}