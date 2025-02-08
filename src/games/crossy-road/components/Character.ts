/**
 * Character Component Class
 * -----------------------
 * Represents the player-controlled character in the Crossy Road game.
 * 
 * Purpose:
 * - Manages the player character's state and appearance
 * - Handles character movement and collision boundaries
 * - Provides visual representation with customizable styling
 * 
 * Data Flow:
 * 1. Initialization:
 *    - Created by Game component at start
 *    - Receives initial position and appearance settings
 *    - Sets up character dimensions and state
 * 
 * 2. Game Loop Integration:
 *    - Position updated through move() method
 *    - Rendered each frame through draw()
 *    - Collision state tracked via isAlive flag
 * 
 * Integration Points:
 * - Game.tsx: Main game component that:
 *   - Creates and manages character instance
 *   - Handles user input for movement
 *   - Checks collisions with cars and obstacles
 * 
 * - Settings System:
 *   - characterSize: Controls character dimensions
 *   - characterColor: Determines appearance
 * 
 * Visual Design:
 * - Square base shape with custom color
 * - Decorative elements (comb, eye) for personality
 * - Maintains consistent scale with game objects
 * 
 * @status ACTIVE and REQUIRED
 * - Core player representation
 * - Essential for game interaction
 */

export default class Character {
  // Position
  x: number;
  y: number;
  
  // Dimensions and appearance
  size: number;
  color: string;
  
  // State
  isAlive: boolean;

  /**
   * Creates a new player character
   * 
   * @param x - Initial horizontal position
   * @param y - Initial vertical position
   * @param settings - Game settings for customization
   */
  constructor(x: number, y: number, settings: any) {
    this.x = x;
    this.y = y;
    this.size = settings.characterSize;
    this.color = settings.characterColor;
    this.isAlive = true;
  }

  /**
   * Renders the character with visual details
   * 
   * @param ctx - Canvas rendering context
   */
  draw(ctx: CanvasRenderingContext2D) {
    // Draw character body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    // Draw face details
    ctx.fillStyle = '#ef4444'; // Red comb
    ctx.fillRect(this.x + this.size * 0.7, this.y + this.size * 0.1, this.size * 0.2, this.size * 0.2);
    
    ctx.fillStyle = '#000'; // Eye
    ctx.fillRect(this.x + this.size * 0.2, this.y + this.size * 0.3, this.size * 0.15, this.size * 0.15);
  }

  /**
   * Moves the character while enforcing game boundaries
   * 
   * @param dx - Horizontal movement delta
   * @param dy - Vertical movement delta
   * @param gameWidth - Game area width constraint
   * @param gameHeight - Game area height constraint
   */
  move(dx: number, dy: number, gameWidth: number, gameHeight: number) {
    const newX = this.x + dx * this.size;
    const newY = this.y + dy * this.size;

    // Enforce game boundaries
    if (newX >= 0 && newX + this.size <= gameWidth) {
      this.x = newX;
    }
    if (newY >= 0 && newY + this.size <= gameHeight) {
      this.y = newY;
    }
  }
}