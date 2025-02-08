# Game Center Integration Specification

## Overview

This document outlines the standardized approach for adding new games to the Game Center platform. For detailed information about system architecture and integration points, see our [System Integration Guide](# Game Center Integration Specification

## Overview

This document outlines the standardized approach for adding new games to the Game Center platform. Games must be self-contained within a single directory under `src/games/` and utilize existing database tables. For detailed information about system architecture and integration points, see our [System Integration Guide](https://github.com/sethshoultes/sws-game-center/blob/main/docs/system-integration.md).

## Directory Structure Requirements

Games must follow the established directory structure as demonstrated by existing games (crossy-road, flappy-bird):

```
src/games/your-game/
├── Game.tsx              # Main game component
├── components/           # Game-specific components
│   ├── ComponentA.tsx
│   ├── ComponentB.tsx
│   └── ...
└── types.ts             # Game-specific types
```

### Key Constraints
1. All game code must be contained within its directory
2. Must use existing database tables:
   - `rgc_games`: Game metadata
   - `rgc_game_settings`: Game configuration
   - `rgc_high_scores`: Player scores
   - No custom tables allowed
3. Must integrate with existing Game Center components:
   - Layout system
   - Navigation
   - Settings management
   - High score system

## Universal Game Integration Prompt

### Game Requirements
1. React/TypeScript implementation
2. Supabase integration for:
   - Settings management
   - High score tracking
   - Game state persistence
3. Tailwind CSS for styling
4. Standard Game Center component structure:
   - Game.tsx: Main game component
   - components/: Game-specific components
   - types.ts: Game-specific types

### Required Components
1. Main Game Component with:
   - Settings integration
   - High score system
   - Sound management (optional)
   - Responsive design
   - Touch/mobile support

2. Database Settings:
   - Define game-specific settings
   - Provide min/max/default values
   - Include setting descriptions

3. UI Integration:
   - Game Center header
   - Score display
   - Settings panel
   - Game over screen
   - High score submission

### Example Settings Structure
```typescript
const DEFAULT_SETTINGS = {
  // Game-specific settings
  playerSpeed: { type: 'number', value: 5, min: 1, max: 10 },
  enemyCount: { type: 'number', value: 10, min: 5, max: 20 },
  backgroundColor: { type: 'color', value: '#000000' }
};
```

## Game Package Specification

### Package Structure
All game files must be contained within a single directory under src/games/:

```
your-game/                # Game directory under src/games/
├── Game.tsx             # Main game component
├── types.ts             # Game-specific types
├── components/          # Game-specific components
│   ├── ComponentA.tsx
│   ├── ComponentB.tsx
│   └── ...
└── README.md             # Game documentation
```

### Manifest File (manifest.json)
```json
{
  "name": "Game Name",
  "slug": "game-slug",
  "version": "1.0.0",
  "description": "Game description",
  "author": "Author name",
  "settings": [
    {
      "key": "settingKey",
      "type": "number",
      "default": 5,
      "min": 1,
      "max": 10,
      "description": "Setting description"
    }
  ],
  "dependencies": {
    "required": ["@supabase/supabase-js"],
    "optional": ["tone"]
  }
}
```

## Admin Integration

### Game Package Interface
```typescript
interface GamePackage {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  version: string;
  settings: GameSetting[];
}
```

### Upload Process
1. Package Upload:
   - Admin uploads game package through interface
   - System validates directory structure and components
   - Security checks performed on code and assets

2. Database Integration:
   - Game metadata added to rgc_games table
   - Game settings added to rgc_game_settings table
   - No custom table creation allowed

3. Deployment:
   - Code integrated into build process
   - Netlify deployment triggered
   - Game added to selection screen

### Security Measures
1. Package Validation:
   - Signature verification
   - Dependency audit
   - Code sandbox restrictions
   - Admin-only access control

2. Asset Management:
   - Size limitations
   - Format restrictions
   - Content verification

## Database Schema

Games must use the existing database tables:

1. `rgc_games`: Stores game metadata
   - id: Unique identifier
   - name: Display name
   - slug: URL-friendly identifier
   - active: Game availability

2. `rgc_game_settings`: Stores game configuration
   - game_id: Reference to games table
   - key: Setting identifier
   - value: Setting value and constraints
   - description: Setting description

3. `rgc_high_scores`: Stores player achievements
   - user_id: Player identifier
   - score: Numeric score
   - username: Player display name

## Example Game Integration: Space Invaders

### Game Mechanics
1. Player Controls:
   - Left/right movement using arrow keys
   - Shooting with spacebar
   - Touch controls for mobile

2. Enemy Behavior:
   - Descending rows of invaders
   - Horizontal movement patterns
   - Progressive difficulty

3. Scoring System:
   - Points per enemy destroyed
   - Bonus points for complete rows
   - High score integration

### Default Settings
```typescript
const DEFAULT_SETTINGS = {
  playerSpeed: { type: 'number', value: 5, min: 3, max: 10, description: 'Player movement speed' },
  bulletSpeed: { type: 'number', value: 7, min: 5, max: 15, description: 'Bullet travel speed' },
  enemySpeed: { type: 'number', value: 2, min: 1, max: 5, description: 'Enemy movement speed' },
  enemyRows: { type: 'number', value: 5, min: 3, max: 8, description: 'Number of enemy rows' },
  enemyColumns: { type: 'number', value: 8, min: 6, max: 12, description: 'Enemies per row' },
  playerColor: { type: 'color', value: '#00ff00', description: 'Player ship color' },
  enemyColor: { type: 'color', value: '#ff0000', description: 'Enemy ship color' },
  backgroundColor: { type: 'color', value: '#000000', description: 'Game background color' }
};
```

### Component Structure
```
space-invaders/
├── Game.tsx             # Main game component with settings integration
├── types.ts            # Game-specific TypeScript types
└── components/
    ├── Player.tsx      # Player ship component
    ├── Enemy.tsx       # Enemy ship component
    ├── Bullet.tsx      # Projectile component
    └── Controls.tsx    # Touch controls component
```

### Integration Requirements
1. Supabase Integration:
   - High score table integration
   - Settings persistence
   - Real-time leaderboard updates

2. Mobile Support:
   - Touch controls overlay
   - Responsive canvas scaling
   - Portrait/landscape handling

3. Sound Effects:
   - Shooting sound
   - Explosion sound
   - Background music (optional)

## Deployment Process

1. Package Validation:
   - Directory structure verification
   - Code security scan
   - Asset validation

2. Database Setup:
   - Game metadata insertion
   - Settings configuration
   - No custom table creation

3. Build Integration:
   - Code compilation
   - Asset optimization
   - Bundle generation

4. Deployment:
   - Netlify build trigger
   - CDN cache invalidation
   - Health check verification

For detailed information about how these systems work together, see our [System Integration Guide](https://github.com/sethshoultes/sws-game-center/blob/main/docs/system-integration.md).

## Existing Game Examples

Reference the following games in the `src/games/` directory for implementation examples:

1. Crossy Road (`src/games/crossy-road/`)
   - Canvas-based rendering
   - Physics system
   - Mobile controls

2. Flappy Bird (`src/games/flappy-bird/`)
   - React component-based
   - Sound system
   - High score integration).

## Universal Game Integration Prompt

### Game Requirements
1. React/TypeScript implementation
2. Supabase integration for:
   - Settings management
   - High score tracking
   - Game state persistence
3. Tailwind CSS for styling
4. Standard Game Center component structure:
   - Game.tsx: Main game component
   - components/: Game-specific components
   - types.ts: Game-specific types

### Required Components
1. Main Game Component with:
   - Settings integration
   - High score system
   - Sound management (optional)
   - Responsive design
   - Touch/mobile support

2. Database Settings:
   - Define game-specific settings
   - Provide min/max/default values
   - Include setting descriptions

3. UI Integration:
   - Game Center header
   - Score display
   - Settings panel
   - Game over screen
   - High score submission

### Example Settings Structure
```typescript
const DEFAULT_SETTINGS = {
  // Game-specific settings
  playerSpeed: { type: 'number', value: 5, min: 1, max: 10 },
  enemyCount: { type: 'number', value: 10, min: 5, max: 20 },
  backgroundColor: { type: 'color', value: '#000000' }
};
```

## Game Package Specification

### Package Structure
```
game-package/
├── manifest.json           # Game metadata and requirements
├── migrations/            # Database migrations for game settings
├── assets/               # Game-specific assets
├── src/
│   ├── Game.tsx          # Main game component
│   ├── types.ts          # Game-specific types
│   └── components/       # Game-specific components
└── README.md             # Game documentation
```

### Manifest File (manifest.json)
```json
{
  "name": "Game Name",
  "slug": "game-slug",
  "version": "1.0.0",
  "description": "Game description",
  "author": "Author name",
  "settings": [
    {
      "key": "settingKey",
      "type": "number",
      "default": 5,
      "min": 1,
      "max": 10,
      "description": "Setting description"
    }
  ],
  "dependencies": {
    "required": ["@supabase/supabase-js"],
    "optional": ["tone"]
  }
}
```

## Admin Integration

### Game Package Interface
```typescript
interface GamePackage {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  version: string;
  settings: GameSetting[];
}
```

### Upload Process
1. Package Upload:
   - Admin uploads game package through interface
   - System validates manifest and structure
   - Security checks performed on code and assets

2. Database Integration:
   - Migrations executed for game settings
   - Game metadata stored in packages table
   - Assets uploaded to Supabase storage

3. Deployment:
   - Code integrated into build process
   - Netlify deployment triggered
   - Game added to selection screen

### Security Measures
1. Package Validation:
   - Signature verification
   - Dependency audit
   - Code sandbox restrictions
   - Admin-only access control

2. Asset Management:
   - Size limitations
   - Format restrictions
   - Content verification

## Database Schema

```sql
-- Game packages table
CREATE TABLE game_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  version text NOT NULL,
  manifest jsonb NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Package assets table
CREATE TABLE game_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES game_packages(id) ON DELETE CASCADE,
  filename text NOT NULL,
  storage_path text NOT NULL,
  content_type text NOT NULL,
  size integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

## Example Game Integration: Space Invaders

### Game Mechanics
1. Player Controls:
   - Left/right movement using arrow keys
   - Shooting with spacebar
   - Touch controls for mobile

2. Enemy Behavior:
   - Descending rows of invaders
   - Horizontal movement patterns
   - Progressive difficulty

3. Scoring System:
   - Points per enemy destroyed
   - Bonus points for complete rows
   - High score integration

### Default Settings
```typescript
const DEFAULT_SETTINGS = {
  playerSpeed: { type: 'number', value: 5, min: 3, max: 10, description: 'Player movement speed' },
  bulletSpeed: { type: 'number', value: 7, min: 5, max: 15, description: 'Bullet travel speed' },
  enemySpeed: { type: 'number', value: 2, min: 1, max: 5, description: 'Enemy movement speed' },
  enemyRows: { type: 'number', value: 5, min: 3, max: 8, description: 'Number of enemy rows' },
  enemyColumns: { type: 'number', value: 8, min: 6, max: 12, description: 'Enemies per row' },
  playerColor: { type: 'color', value: '#00ff00', description: 'Player ship color' },
  enemyColor: { type: 'color', value: '#ff0000', description: 'Enemy ship color' },
  backgroundColor: { type: 'color', value: '#000000', description: 'Game background color' }
};
```

### Component Structure
```
space-invaders/
├── Game.tsx              # Main game component
├── types.ts              # Game-specific types
└── components/
    ├── Player.tsx        # Player ship component
    ├── Enemy.tsx         # Enemy ship component
    ├── Bullet.tsx        # Projectile component
    └── Controls.tsx      # Touch controls component
```

### Integration Requirements
1. Supabase Integration:
   - High score table integration
   - Settings persistence
   - Real-time leaderboard updates

2. Mobile Support:
   - Touch controls overlay
   - Responsive canvas scaling
   - Portrait/landscape handling

3. Sound Effects:
   - Shooting sound
   - Explosion sound
   - Background music (optional)

## Deployment Process

1. Package Validation:
   - Manifest verification
   - Code security scan
   - Asset validation

2. Database Setup:
   - Migration execution
   - Settings initialization
   - Asset storage preparation

3. Build Integration:
   - Code compilation
   - Asset optimization
   - Bundle generation

4. Deployment:
   - Netlify build trigger
   - CDN cache invalidation
   - Health check verification

For detailed information about how these systems work together, see our [System Integration Guide](https://github.com/sethshoultes/sws-game-center/blob/main/docs/system-integration.md).