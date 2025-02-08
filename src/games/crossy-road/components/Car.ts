/**
 * Car Component Class
 * ------------------
 * Represents a vehicle obstacle in the Crossy Road game.
 * 
 * Purpose:
 * - Creates and manages car obstacles that the player must avoid
 * - Handles car movement, rendering, and collision detection
 * - Supports customizable appearance and behavior through settings
 * 
 * Data Flow:
 * 1. Initialization:
 *    - Created by Game component when spawning new cars
 *    - Receives position, speed, direction, and settings
 *    - Initializes size and appearance based on settings
 * 
 * 2. Game Loop Integration:
 *    - Position updated each frame through update()
 *    - Rendered each frame through draw()
 *    - Checked for collisions with player
 *    - Monitored for off-screen status
 * 
 * Integration Points:
 * - Game.tsx: Main game component that:
 *   - Creates car instances
 *   - Manages car collection
 *   - Handles collision detection
 * 
 * - Settings System:
 *   - carSize: Controls car dimensions
 *   - carColor: Determines car appearance
 *   - baseCarSpeed: Affects movement speed
 *   - maxCarSpeed: Limits maximum velocity
 * 
 * Visual Design:
 * - Main body with customizable color
 * - Direction-based details (windows, headlights)
 * - Wheels and highlights for depth
 * 
 * @status ACTIVE and REQUIRED
 * - Core gameplay obstacle
 * - Critical for game difficulty
 */

export default class Car {
  // Position
  x: number;
  y: number;
  
  // Dimensions
  size: number;
  width: number;
  height: number;
  
  // Movement
  speed: number;
  direction: number;  // 1 for right, -1 for left
  
  // Appearance
  color: string;

  /**
   * Creates a new car obstacle
   * 
   * @param y - Vertical position (lane placement)
   * @param speed - Movement speed (affected by level)
   * @param direction - Movement direction (1: right, -1: left)
   * @param settings - Game settings for customization
   */
  constructor(y: number, speed: number, direction: number, settings: any) {
    // Position initialization
    this.y = y;
    this.x = direction > 0 ? -settings.carSize : window.innerWidth;
    
    // Movement properties
    this.speed = speed;
    this.direction = direction;
    
    // Size calculations
    this.size = settings.carSize;
    this.width = this.size;
    this.height = this.size/2;
    
    // Appearance
    this.color = settings.carColor;
  }

  /**
   * Updates car position based on speed and direction
   * Called each frame by the game loop
   */
  update() {
    this.x += this.speed * this.direction;
  }

  /**
   * Renders the car with visual details
   * 
   * @param ctx - Canvas rendering context
   */
  draw(ctx: CanvasRenderingContext2D) {
    // Main car body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Windows and details
    ctx.fillStyle = '#000000';
    const windowSize = this.size * 0.2;
    const wheelSize = this.size * 0.15;

    // Direction-based window placement
    if (this.direction > 0) {
      ctx.fillRect(this.x + this.width * 0.7, this.y + 2, windowSize, windowSize);
    } else {
      ctx.fillRect(this.x + this.width * 0.1, this.y + 2, windowSize, windowSize);
    }

    // Wheels
    ctx.fillRect(this.x + this.width * 0.1, this.y + this.height - 2, wheelSize, wheelSize);
    ctx.fillRect(this.x + this.width * 0.7, this.y + this.height - 2, wheelSize, wheelSize);

    // Direction-based headlights
    ctx.fillStyle = '#fbbf24'; // Amber color for headlights
    const headlightSize = this.size * 0.1;
    if (this.direction > 0) {
      ctx.fillRect(this.x + this.width - headlightSize, this.y + this.height * 0.3, headlightSize, headlightSize);
    } else {
      ctx.fillRect(this.x, this.y + this.height * 0.3, headlightSize, headlightSize);
    }
  }

  /**
   * Checks if car has moved off screen
   * Used for cleanup by game loop
   * 
   * @returns {boolean} True if car is completely off screen
   */
  isOffScreen() {
    return this.direction > 0 ? 
      this.x > window.innerWidth : 
      this.x + this.width < 0;
  }
}