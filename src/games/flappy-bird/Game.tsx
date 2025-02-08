/**
 * Flappy Bird Game Component
 * -------------------------
 * Main game component implementing a Flappy Bird clone with customizable settings,
 * high scores, and sound effects.
 * 
 * Purpose:
 * - Provides core game mechanics and physics
 * - Manages game state and scoring
 * - Handles user input and collision detection
 * - Integrates with Supabase for settings and high scores
 * 
 * Data Flow:
 * 1. Game State Management:
 *    - Tracks bird position and velocity
 *    - Manages pipe obstacles and gaps
 *    - Handles scoring and high scores
 *    - Controls sound effects and settings
 * 
 * 2. Physics System:
 *    - Gravity affects bird velocity
 *    - Jump force counteracts gravity
 *    - Collision detection with pipes
 *    - Smooth animations and transitions
 * 
 * 3. Settings Integration:
 *    - Loads game settings from Supabase
 *    - Applies physics parameters:
 *      - Gravity strength
 *      - Jump force
 *      - Pipe speed
 *      - Gap size
 *    - Falls back to defaults if loading fails
 * 
 * 4. High Score System:
 *    - Tracks current and high scores
 *    - Persists high scores to Supabase
 *    - Displays leaderboard
 *    - Handles score submission
 * 
 * Integration Points:
 * - Supabase:
 *   - Game settings storage and retrieval
 *   - High score persistence
 *   - User authentication for scores
 * 
 * - Components:
 *   - Bird: Player character
 *   - Pipe: Obstacle system
 *   - Leaderboard: Score display
 * 
 * - Audio System:
 *   - Jump sound effect
 *   - Score sound effect
 *   - Game over sound effect
 *   - Volume control
 * 
 * Game Mechanics:
 * - Tap/click/space to jump
 * - Navigate through pipe gaps
 * - Score increases per pipe cleared
 * - Game over on collision
 * 
 * Performance Considerations:
 * - Uses requestAnimationFrame for smooth animation
 * - Efficient collision detection
 * - Audio preloading
 * - Cleanup on unmount
 * 
 * @status ACTIVE and REQUIRED
 * - Core game implementation
 * - Essential for gameplay experience
 */

import * as React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Bird from './components/Bird';
import Pipe from './components/Pipe';
import Leaderboard from './components/Leaderboard';
import { Trophy, Volume2, VolumeX } from 'lucide-react';
import type { Database } from '../../lib/database.types';

const LOGO_URL = 'https://adventurebuildrstorage.storage.googleapis.com/wp-content/uploads/2024/10/11185818/AdventureBuildr-Logo-e1731351627826.png';

/**
 * Default game settings used before loading from Supabase
 * Provides initial values for core game mechanics:
 * - gravity: Downward force on the bird
 * - jumpForce: Upward force when jumping
 * - pipeSpeed: Horizontal movement speed of pipes
 * - pipeSpawnRate: Time between pipe spawns (ms)
 * - gapSize: Vertical space between pipes
 */
const DEFAULT_SETTINGS = {
  gravity: 0.6,
  jumpForce: -9,
  pipeSpeed: 3,
  pipeSpawnRate: 1500,
  gapSize: 250
};

/**
 * Local storage key for persisting the player's high score
 * Allows score retention between sessions
 */
const HIGH_SCORE_KEY = 'flappyBirdHighScore';

type HighScore = Database['public']['Tables']['rgc_high_scores']['Row'];

/**
 * Sound effect URLs for game audio feedback
 * Hosted on Supabase storage for reliable access
 * - jump: Played when bird jumps
 * - score: Played when passing through pipes
 * - gameOver: Played on collision
 */
const SOUNDS = {
  jump: 'https://vycdzwibdfmuktxshgyi.supabase.co/storage/v1/object/public/rgc_sounds//flap-101soundboards.mp3',
  score: 'https://vycdzwibdfmuktxshgyi.supabase.co/storage/v1/object/public/rgc_sounds//point-101soundboards.mp3',
  gameOver: 'https://vycdzwibdfmuktxshgyi.supabase.co/storage/v1/object/public/rgc_sounds//die-101soundboards.mp3'
};

/**
 * Interface defining pipe obstacle data structure
 * - id: Unique identifier for React keys
 * - x: Horizontal position
 * - height: Height of the top pipe
 * - showLogo: Whether to show logo on this pipe pair
 */
interface PipeData {
  id: number;
  x: number;
  height: number;
  showLogo?: boolean;
}

export function FlappyBird() {
  /**
   * Game Settings State
   * Loaded from Supabase, falls back to defaults
   * Controls core game mechanics and difficulty
   */
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  /**
   * Game State Management
   * Controls the overall game flow and UI state:
   * - gameStarted: Whether game has begun
   * - gameOver: Whether collision has occurred
   * - soundEnabled: Audio feedback toggle
   * - username: Player name for high scores
   * - scoreSubmitted: Prevents duplicate submissions
   */
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [username, setUsername] = useState('');
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(true);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  
  /**
   * Bird State Management
   * Controls the player character:
   * - position: Vertical position in pixels
   * - velocity: Current vertical speed
   * - rotation: Visual rotation based on movement
   */
  const [birdPosition, setBirdPosition] = useState(300);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [birdRotation, setBirdRotation] = useState(0);
  
  /**
   * Game Progress State
   * Tracks game progress and scoring:
   * - pipes: Array of pipe obstacles
   * - score: Current game score
   * - highScore: Best score (persisted)
   */
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  
  /**
   * Animation Frame References
   * Manages game loop and timing:
   * - gameLoopRef: Main game loop reference
   * - lastPipeRef: Tracks last pipe spawn time
   * - frameCountRef: Tracks animation frames
   */
  const gameLoopRef = useRef<number>();
  const lastPipeRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  
  /**
   * Audio Element References
   * Manages sound effect playback:
   * - jumpSound: Bird jump effect
   * - scoreSound: Point scoring effect
   * - gameOverSound: Collision effect
   */
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
  const scoreSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);

  // Load game settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: settingsData } = await supabase
          .from('rgc_game_settings')
          .select(`
            key,
            value,
            rgc_games!inner(slug)
          `)
          .eq('rgc_games.slug', 'flappy-bird');

        if (settingsData) {
          const newSettings = { ...DEFAULT_SETTINGS };
          settingsData.forEach(setting => {
            const value = typeof setting.value === 'string' 
              ? JSON.parse(setting.value) 
              : setting.value;
            newSettings[setting.key] = value.value;
          });
          setSettings(newSettings);
        }
      } catch (error) {
        console.error('Error loading game settings:', error);
      }
    }

    loadSettings();
  }, []);

  // Load high scores
  useEffect(() => {
    async function loadHighScores() {
      const { data } = await supabase
        .from('rgc_high_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(3);
      
      setHighScores(data || []);
      setIsLoadingScores(false);
    }

    loadHighScores();
  }, []);

  // Save high score
  const saveHighScore = useCallback(async (score: number) => {
    if (!username) return;
    
    const { data: scores } = await supabase
      .from('rgc_high_scores')
      .select('score')
      .order('score', { ascending: false });

    if (!scores) {
      console.error('Failed to fetch scores');
      return;
    }

    if (scores.length >= 3 && score <= Math.min(...scores.map(s => s.score))) {
      alert('Sorry, your score isn\'t high enough for the leaderboard!');
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: `${Date.now()}@temp.com`,
        password: 'temporary-password',
      });

      if (error) throw error;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      if (scores.length >= 3) {
        const lowestScore = Math.min(...scores.map(s => s.score));
        await supabase
          .from('rgc_high_scores')
          .delete()
          .eq('score', lowestScore);
      }

      await supabase.from('rgc_high_scores').insert({
        user_id: user.user.id,
        score,
        username,
      });

      setScoreSubmitted(true);

      const { data: newScores } = await supabase
        .from('rgc_high_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(3);

      setHighScores(newScores || []);
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  }, [username, scoreSubmitted]);

  // Audio System Initialization
  useEffect(() => {
    jumpSoundRef.current = new Audio(SOUNDS.jump);
    scoreSoundRef.current = new Audio(SOUNDS.score);
    gameOverSoundRef.current = new Audio(SOUNDS.gameOver);

    return () => {
      jumpSoundRef.current?.pause();
      scoreSoundRef.current?.pause();
      gameOverSoundRef.current?.pause();
    };
  }, []);

  // Sound Effect Player
  const playSound = useCallback((sound: HTMLAudioElement | null) => {
    if (soundEnabled && sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [soundEnabled]);

  // Game State Reset
  const resetGame = useCallback(() => {
    setBirdPosition(300);
    setBirdVelocity(0);
    setBirdRotation(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setScoreSubmitted(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  // Jump Action Handler
  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (!gameOver) {
      playSound(jumpSoundRef.current);
      setBirdVelocity(settings.jumpForce);
      setBirdRotation(-30);
    }
  }, [gameOver, gameStarted, playSound, settings.jumpForce]);

  // Pipe Spawning System
  const spawnPipe = useCallback(() => {
    const minHeight = 50;
    const maxHeight = window.innerHeight - settings.gapSize - minHeight;
    const height = Math.random() * (maxHeight - minHeight) + minHeight;
    setPipes((pipes) => [
      ...pipes,
      {
        id: Date.now(),
        x: window.innerWidth,
        height,
        showLogo: pipes.length > 0 && (pipes.length + 1) % 7 === 0
      },
    ]);
  }, [settings.gapSize]);

  // Collision Detection System
  const checkCollision = useCallback(
    (birdPos: number, pipes: PipeData[]) => {
      const birdRect = {
        left: 96,
        right: 144,
        top: birdPos,
        bottom: birdPos + 48,
      };

      return pipes.some((pipe) => {
        const topPipeRect = {
          left: pipe.x,
          right: pipe.x + 80,
          top: 0,
          bottom: pipe.height,
        };

        const bottomPipeRect = {
          left: pipe.x,
          right: pipe.x + 80,
          top: pipe.height + settings.gapSize,
          bottom: window.innerHeight,
        };

        return (
          (birdRect.right > topPipeRect.left &&
            birdRect.left < topPipeRect.right &&
            birdRect.top < topPipeRect.bottom) ||
          (birdRect.right > bottomPipeRect.left &&
            birdRect.left < bottomPipeRect.right &&
            birdRect.bottom > bottomPipeRect.top)
        );
      });
    },
    [settings.gapSize]
  );

  // Main Game Loop
  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;

    frameCountRef.current += 1;

    setBirdPosition((pos) => {
      const newPos = pos + birdVelocity;
      if (newPos < 0 || newPos > window.innerHeight - 48) {
        setGameOver(true);
        return pos;
      }
      return newPos;
    });

    setBirdVelocity((vel) => vel + settings.gravity);
    setBirdRotation((rot) => Math.min(rot + 3, 90));

    setPipes((pipes) => {
      const newPipes = pipes
        .map((pipe) => ({
          ...pipe,
          x: pipe.x - settings.pipeSpeed,
        }))
        .filter((pipe) => pipe.x > -100);

      newPipes.forEach((pipe) => {
        if (pipe.x + settings.pipeSpeed >= 96 && pipe.x < 96) {
          setScore((s) => {
            const newScore = s + 1;
            playSound(scoreSoundRef.current);
            setHighScore((hs) => {
              const updatedHighScore = Math.max(hs, newScore);
              localStorage.setItem(HIGH_SCORE_KEY, updatedHighScore.toString());
              return updatedHighScore;
            });
            return newScore;
          });
        }
      });

      return newPipes;
    });

    if (
      Date.now() - lastPipeRef.current > settings.pipeSpawnRate &&
      frameCountRef.current > 60
    ) {
      spawnPipe();
      lastPipeRef.current = Date.now();
    }

    if (checkCollision(birdPosition, pipes)) {
      setGameOver(true);
      playSound(gameOverSoundRef.current);
      return;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameStarted,
    gameOver,
    birdPosition,
    pipes,
    spawnPipe,
    checkCollision,
    birdVelocity,
    settings,
    playSound
  ]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameStarted, gameOver]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-300 to-blue-500 cursor-pointer"
      onClick={jump}
    >
      {/* Sound Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSoundEnabled(!soundEnabled);
        }}
        className="absolute top-8 right-8 z-10 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
      >
        {soundEnabled ? (
          <Volume2 className="w-6 h-6 text-white" />
        ) : (
          <VolumeX className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Ground Element */}
      <div className="absolute bottom-0 w-full h-24 bg-green-800" />

      {/* Game Elements */}
      <Bird position={birdPosition} rotation={birdRotation} />
      {pipes.map((pipe) => (
        <React.Fragment key={pipe.id}> 
          <Pipe position={pipe.x} height={pipe.height} isTop={true} />
          <Pipe
            position={pipe.x}
            height={window.innerHeight - pipe.height - settings.gapSize}
            isTop={false}
          />
        </React.Fragment>
      ))}

      {/* Score Display */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-4xl font-bold text-white drop-shadow-lg">
        {score}
      </div>

      {/* Start Screen */}
      {!gameStarted && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-6 animate-float">
            <img
              src={LOGO_URL}
              alt="Game Logo"
              className="w-full max-w-[500px] h-auto object-contain drop-shadow-xl"
            />
            <h1 className="text-6xl font-extrabold text-white drop-shadow-xl tracking-widest text-center">
              Flappy Bird
            </h1>
          </div>
          <p className="text-white text-lg mt-2">Click or press Space to start</p>
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-white p-8 rounded-lg shadow-lg">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
          <p className="text-lg mb-2">Score: {score}</p>
          <p className="text-lg mb-4">High Score: {highScore}</p>
          {score > 0 && !scoreSubmitted && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-2 border rounded-lg mb-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors w-full mb-4"
                onClick={(e) => {
                  e.stopPropagation();
                  saveHighScore(score);
                }}
                disabled={!username}
              >
                Save Score
              </button>
            </div>
          )}
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              resetGame();
            }}
          >
            Play Again
          </button>
        </div>
      )}
      
      {/* Leaderboard Display */}
      {!gameStarted && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
          <Leaderboard scores={highScores} isLoading={isLoadingScores} />
        </div>
      )}
    </div>
  );
}