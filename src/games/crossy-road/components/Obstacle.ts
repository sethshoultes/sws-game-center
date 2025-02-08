/**
 * Obstacle Component Class
 * ----------------------
 * Represents static obstacles (rocks and trees) in the Crossy Road game.
 * 
 * Purpose:
 * - Provides environmental obstacles that the player must navigate around
 * - Creates visual variety in the game landscape
 * - Adds strategic complexity to player movement
 * 
 * Data Flow:
 * 1. Initialization:
 *    - Created by Game component during level generation
 *    - Positioned strategically in lanes between roads
 *    - Type (rock/tree) determined randomly
 * 
 * 2. Game Loop Integration:
 *    - Rendered each frame through draw()
 *    - Maintains static position (no movement)
 *    - Participates in collision detection
 * 
 * Integration Points:
 * - Game.tsx: Main game component that:
 *   - Creates obstacle instances during generateObstacles()
 *   - Manages obstacle collection
 *   - Checks for collisions with player
 * 
 * - Character.ts:
 *   - Interacts through collision detection
 *   - Must navigate around obstacles
 * 
 * Visual Design:
 * - Rocks: Angular shape with detail lines
 * - Trees: Trunk and triangular foliage
 * - Consistent scale with other game elements
 * - Color-coded by type for clear identification
 * 
 * @status ACTIVE and REQUIRED
 * - Core gameplay element
 * - Essential for level design
 */

export default class Obstacle {
  // Position
  x: number;
  y: number;
  
  // Dimensions
  size: number;
  
  // Appearance
  type: 'rock' | 'tree';
  color: string;

  /**
   * Creates a new obstacle
   * 
   * @param x - Horizontal position
   * @param y - Vertical position
   * @param size - Obstacle dimensions
   * @param type - Obstacle type (rock/tree)
   */
  constructor(x: number, y: number, size: number, type: 'rock' | 'tree') {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = type;
    this.color = type === 'rock' ? '#6b7280' : '#166534';
  }

  /**
   * Renders the obstacle based on its type
   * 
   * @param ctx - Canvas rendering context
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (this.type === 'rock') {
      this.drawRock(ctx);
    } else {
      this.drawTree(ctx);
    }
  }

  /**
   * Renders a rock obstacle with angular shape and detail lines
   * 
   * @param ctx - Canvas rendering context
   */
  private drawRock(ctx: CanvasRenderingContext2D) {
    // Draw main rock shape
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.size);
    ctx.lineTo(this.x + this.size, this.y + this.size);
    ctx.lineTo(this.x + this.size * 0.8, this.y);
    ctx.lineTo(this.x + this.size * 0.2, this.y);
    ctx.closePath();
    ctx.fill();

    // Add detail lines for texture
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.size * 0.3, this.y + this.size * 0.3);
    ctx.lineTo(this.x + this.size * 0.5, this.y + this.size * 0.5);
    ctx.stroke();
  }

  /**
   * Renders a tree obstacle with trunk and foliage
   * 
   * @param ctx - Canvas rendering context
   */
  private drawTree(ctx: CanvasRenderingContext2D) {
    // Draw trunk
    ctx.fillStyle = '#92400e';
    ctx.fillRect(
      this.x + this.size * 0.4,
      this.y + this.size * 0.6,
      this.size * 0.2,
      this.size * 0.4
    );

    // Draw triangular foliage
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x + this.size * 0.5, this.y);
    ctx.lineTo(this.x + this.size, this.y + this.size * 0.6);
    ctx.lineTo(this.x, this.y + this.size * 0.6);
    ctx.closePath();
    ctx.fill();
  }
}