/**
 * Controls Component
 * ----------------
 * Provides user input controls for the Crossy Road game through both keyboard
 * and on-screen buttons.
 * 
 * Purpose:
 * - Handles player movement input through multiple input methods
 * - Provides touch-friendly controls for mobile devices
 * - Maintains consistent control scheme across platforms
 * 
 * Data Flow:
 * 1. Input Handling:
 *    - Keyboard events captured through useEffect
 *    - Button clicks captured through onClick handlers
 *    - All inputs normalized to dx/dy movement values
 *    - Movement requests sent to parent through onMove callback
 * 
 * 2. Event Processing:
 *    - Arrow keys mapped to corresponding directions
 *    - Touch/click events on buttons trigger movement
 *    - Movement values (-1, 0, 1) passed to parent
 * 
 * Integration Points:
 * - Game.tsx: Parent component that:
 *   - Provides onMove callback for movement handling
 *   - Updates character position based on input
 *   - Manages game state and collisions
 * 
 * - Character.ts:
 *   - Receives movement deltas through Game component
 *   - Updates position based on input values
 * 
 * Visual Design:
 * - Grid layout for intuitive directional control
 * - Arrow icons for clear button purposes
 * - Mobile-friendly button sizing and spacing
 * - Visual feedback on button press
 * 
 * @status ACTIVE and REQUIRED
 * - Essential for game interaction
 * - Core input handling component
 */

import * as React from 'react';
import { useEffect } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface ControlsProps {
  onMove: (dx: number, dy: number) => void;
}

export default function Controls({ onMove }: ControlsProps) {
  // Set up keyboard event listeners
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch(e.key) {
        case 'ArrowUp':
          onMove(0, -1);
          break;
        case 'ArrowDown':
          onMove(0, 1);
          break;
        case 'ArrowLeft':
          onMove(-1, 0);
          break;
        case 'ArrowRight':
          onMove(1, 0);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove]);

  return (
    <div className="grid grid-cols-3 gap-1 p-2 max-w-[180px] mx-auto">
      <div />
      <button
        className="bg-white rounded shadow p-2 active:scale-95 transition-transform"
        onClick={() => onMove(0, -1)}
      >
        <ArrowUp className="w-4 h-4" />
      </button>
      <div />
      <button
        className="bg-white rounded shadow p-2 active:scale-95 transition-transform"
        onClick={() => onMove(-1, 0)}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        className="bg-white rounded shadow p-2 active:scale-95 transition-transform"
        onClick={() => onMove(0, 1)}
      >
        <ArrowDown className="w-4 h-4" />
      </button>
      <button
        className="bg-white rounded shadow p-2 active:scale-95 transition-transform"
        onClick={() => onMove(1, 0)}
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}