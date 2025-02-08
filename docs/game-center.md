# Game Center System Documentation

## Overview
The Game Center is a modular gaming platform built with React, TypeScript, and Supabase. For detailed information about how these systems work together, see our [System Integration Guide](system-integration.md). The platform consists of two main components:
1. Game Portal - Where users play games
2. Admin Panel - Where administrators manage game settings

## System Architecture

### Database Structure
- `rgc_games` table: Stores game metadata
  - `id`: UUID primary key
  - `name`: Display name
  - `slug`: URL-friendly identifier
  - `active`: Game availability status
  - `last_accessed`: Timestamp of last settings update

- `rgc_game_settings` table: Stores configurable game parameters
  - `game_id`: Reference to games table
  - `key`: Setting identifier
  - `value`: JSON object containing:
    - `type`: "number" | "color" | "text"
    - `value`: Current value
    - `min`: Minimum value (for numbers)
    - `max`: Maximum value (for numbers)
    - `step`: Increment size (for numbers)
  - `description`: Setting description
  - `version`: Setting version for change tracking

- `rgc_high_scores` table: Stores player achievements
  - `user_id`: Player identifier
  - `score`: Numeric score
  - `username`: Player display name

- `rgc_system_settings` table: Stores global configuration
  - `key`: Setting identifier
  - `value`: JSON configuration value
  - `description`: Setting description
  - `version`: Version tracking

### Security
- Row Level Security (RLS) enabled on all tables
- Public read access for games and settings
- Authenticated write access for high scores (see [System Integration Guide](system-integration.md) for details)
- Admin-only access for game management

## Adding a New Game

### 1. Database Setup
Create a new migration file in `supabase/migrations/` with:
```sql
-- Add game entry
INSERT INTO rgc_games (name, slug) 
VALUES ('Game Name', 'game-slug');

-- Add game settings
INSERT INTO rgc_game_settings (game_id, key, value, description)
SELECT 
  games.id,
  settings.key,
  settings.value::jsonb,
  settings.description
FROM rgc_games games
CROSS JOIN (
  VALUES 
    (
      'settingKey',
      '{"type": "number", "value": 1, "min": 0, "max": 10, "step": 1}',
      'Setting description'
    )
  ) AS settings(key, value, description)
WHERE games.slug = 'game-slug';
```

### 2. Game Component Structure
Create a new directory in `src/games/your-game/` with:
```
your-game/
├── Game.tsx            # Main game component
├── components/         # Game-specific components
│   ├── Player.tsx
│   └── ...
└── types.ts           # Game-specific types
```

### 3. Game Component Requirements
Your main Game component must:
1. Load settings from Supabase
2. Implement game loop using requestAnimationFrame
3. Handle user input
4. Manage game state
5. Support high scores
6. Use Tailwind CSS for styling

Example structure:
```typescript
export function YourGame() {
  // Settings state
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const gameLoop = () => {
        // Update game state
        requestAnimationFrame(gameLoop);
      };
      requestAnimationFrame(gameLoop);
    }
  }, [gameStarted, gameOver]);

  return (
    <div className="game-container">
      {/* Game UI */}
    </div>
  );
}
```

### 4. Register in App.tsx
Add your game to the game selection screen:
```typescript
<button
  onClick={() => setCurrentGame('your-game')}
  className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
>
  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Game</h2>
  <p className="text-gray-600">Game description</p>
</button>
```

### 5. Settings Requirements
Each setting must include:
- Descriptive key name
- Appropriate type (number/color/text)
- Reasonable min/max values for numbers
- Clear description
- Default value

### 6. Best Practices
1. Use TypeScript for type safety
2. Implement proper cleanup in useEffect hooks
3. Use constants for default values
4. Handle window resize events
5. Implement proper error handling
6. Use Tailwind CSS for responsive design
7. Follow existing game patterns for consistency

### 7. Testing
Before deployment:
1. Verify settings load correctly
2. Test game mechanics
3. Verify high score submission
4. Test responsive design
5. Check error handling
6. Verify cleanup on unmount

## Working Examples

### 1. Crossy Road Implementation
The Crossy Road game demonstrates:
- Canvas-based rendering
- Collision detection
- Level progression
- Mobile controls

Key features:
```typescript
// Game settings
const DEFAULT_SETTINGS = {
  characterSize: 30,
  characterColor: '#fde047',
  carSize: 40,
  carColor: '#ef4444',
  baseCarSpeed: 2,
  maxCarSpeed: 10,
  carSpawnRate: 0.02
};

// Game loop with collision detection
function gameLoop() {
  // Clear canvas
  ctx.fillStyle = settings.grassColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update and draw cars
  cars.forEach(car => {
    car.update();
    car.draw(ctx);
  });

  // Check collisions
  if (checkCollisions()) {
    setGameOver(true);
    return;
  }

  requestAnimationFrame(gameLoop);
}
```

### 2. Flappy Bird Implementation
The Flappy Bird game showcases:
- Physics-based gameplay
- High score system
- Sound effects
- Animated sprites

Key features:
```typescript
// Physics settings
const DEFAULT_SETTINGS = {
  gravity: 0.6,
  jumpForce: -9,
  pipeSpeed: 3,
  pipeSpawnRate: 1500,
  gapSize: 250
};

// Bird movement
function updateBird() {
  setBirdPosition(pos => {
    const newPos = pos + birdVelocity;
    if (newPos < 0 || newPos > window.innerHeight - 48) {
      setGameOver(true);
      return pos;
    }
    return newPos;
  });

  setBirdVelocity(vel => vel + settings.gravity);
  setBirdRotation(rot => Math.min(rot + 3, 90));
}
```

## Deployment

The system is configured for deployment through Netlify:

1. Build Configuration (netlify.toml):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
```

2. Environment Variables:
```
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Build Command:
```bash
npm run build
```

## Admin Panel Access

The admin panel is accessible at `/admin` and requires authentication:

1. Sign in with admin credentials
2. Access game settings through dropdown
3. Modify settings with immediate effect
4. Monitor game usage through last_accessed timestamps

Example admin route handling:
```typescript
// App.tsx
const isAdminRoute = window.location.pathname.startsWith('/admin');

if (isAdminRoute) {
  return <GameCenter />;
}
```

## Troubleshooting

Common issues and solutions:

1. Settings not loading
```typescript
// Verify Supabase connection
const { data: settingsData, error } = await supabase
  .from('rgc_game_settings')
  .select(`
    key,
    value,
    rgc_games!inner(slug)
  `)
  .eq('rgc_games.slug', 'game-slug');

if (error) {
  console.error('Settings error:', error);
  // Fall back to defaults
  return DEFAULT_SETTINGS;
}
```

2. High scores not saving
```typescript
// Ensure proper error handling
try {
  const { error } = await supabase
    .from('rgc_high_scores')
    .insert({
      user_id,
      score,
      username
    });

  if (error) throw error;
} catch (err) {
  console.error('Score save error:', err);
  // Show user-friendly error message
}
```

3. Admin access issues
```typescript
// Check admin status
const checkAdminStatus = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return profile?.role === 'admin';
  }
  return false;
};
```