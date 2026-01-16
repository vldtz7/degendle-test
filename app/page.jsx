'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================================
// DEGENDLE - Crypto Guessing Game
// Enhanced with: Dark Mode, Achievements, Enhanced Stats, Mobile Optimization
// ============================================================================

// Achievement definitions
const ACHIEVEMENTS = {
  firstWin: { id: 'firstWin', name: 'First Blood', emoji: '🎯', description: 'Win your first game' },
  perfectGame: { id: 'perfectGame', name: 'Perfect', emoji: '💎', description: 'Win on first guess' },
  streak5: { id: 'streak5', name: 'On Fire', emoji: '🔥', description: '5 day streak' },
  streak10: { id: 'streak10', name: 'Unstoppable', emoji: '⚡', description: '10 day streak' },
  streak25: { id: 'streak25', name: 'Legend', emoji: '👑', description: '25 day streak' },
  played10: { id: 'played10', name: 'Regular', emoji: '📅', description: 'Play 10 games' },
  played25: { id: 'played25', name: 'Dedicated', emoji: '🏆', description: 'Play 25 games' },
  played50: { id: 'played50', name: 'Veteran', emoji: '🎖️', description: 'Play 50 games' },
  winRate80: { id: 'winRate80', name: 'Sharp Mind', emoji: '🧠', description: '80%+ win rate (10+ games)' },
  categoryPersonality: { id: 'categoryPersonality', name: 'Who Dis?', emoji: '👤', description: 'Win 5 Personality puzzles' },
  categoryMemecoin: { id: 'categoryMemecoin', name: 'Degen', emoji: '🐸', description: 'Win 5 Memecoin puzzles' },
  categoryNFT: { id: 'categoryNFT', name: 'Collector', emoji: '🖼️', description: 'Win 5 NFT Project puzzles' },
};

// Sound effects hook with mute support
const useSound = (muted) => {
  const playWrongSound = useCallback((wrongCount) => {
    if (muted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      const baseFreq = 400 - (wrongCount * 60);
      oscillator.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, audioCtx.currentTime + 0.3);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  }, [muted]);

  const playWinSound = useCallback(() => {
    if (muted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [
        { freq: 523.25, start: 0, duration: 0.1 },
        { freq: 659.25, start: 0.1, duration: 0.1 },
        { freq: 783.99, start: 0.2, duration: 0.1 },
        { freq: 1046.50, start: 0.3, duration: 0.15 },
        { freq: 987.77, start: 0.45, duration: 0.1 },
        { freq: 1046.50, start: 0.55, duration: 0.25 },
        { freq: 1318.51, start: 0.55, duration: 0.25 },
        { freq: 1567.98, start: 0.7, duration: 0.3 },
      ];
      notes.forEach(note => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(note.freq, audioCtx.currentTime + note.start);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, audioCtx.currentTime + note.start);
        gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + note.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + note.start + note.duration);
        osc.start(audioCtx.currentTime + note.start);
        osc.stop(audioCtx.currentTime + note.start + note.duration + 0.1);
      });
    } catch (e) {}
  }, [muted]);

  return { playWrongSound, playWinSound };
};

// ASCII art title
const asciiTitle = `
$$$$$$$\\  $$$$$$$$\\  $$$$$$\\  $$$$$$$$\\ $$\\   $$\\ $$$$$$$\\  $$\\       $$$$$$$$\\ 
$$  __$$\\ $$  _____|$$  __$$\\ $$  _____|$$$\\  $$ |$$  __$$\\ $$ |      $$  _____|
$$ |  $$ |$$ |      $$ /  \\__|$$ |      $$$$\\ $$ |$$ |  $$ |$$ |      $$ |      
$$ |  $$ |$$$$$\\    $$ |$$$$\\ $$$$$\\    $$ $$\\$$ |$$ |  $$ |$$ |      $$$$$\\    
$$ |  $$ |$$  __|   $$ |\\_$$ |$$  __|   $$ \\$$$$ |$$ |  $$ |$$ |      $$  __|   
$$ |  $$ |$$ |      $$ |  $$ |$$ |      $$ |\\$$$ |$$ |  $$ |$$ |      $$ |      
$$$$$$$  |$$$$$$$$\\ \\$$$$$$  |$$$$$$$$\\ $$ | \\$$ |$$$$$$$  |$$$$$$$$\\ $$$$$$$$\\ 
\\_______/ \\________| \\______/ \\________|\\__|  \\__|\\_______/ \\________|\\________|
`.trim();

const divider = '════════════════════════════════════════════════════════════════════════════════';

// Generate stars
const generateStars = () => {
  const stars = [];
  let id = 0;
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 3; i++) {
      stars.push({ id: id++, x: `${-15 + i * 5}%`, y: `${20 + row * 20}%`, delay: row * 80 + Math.random() * 100, size: 14 + Math.random() * 8 });
    }
  }
  for (let row = 0; row < 6; row++) {
    const starsInRow = 12 - row;
    for (let i = 0; i < starsInRow; i++) {
      stars.push({ id: id++, x: `${3 + (i / (starsInRow - 1)) * 94}%`, y: `${10 + row * 15}%`, delay: row * 60 + Math.random() * 80, size: 12 + Math.random() * 8 });
    }
  }
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 3; i++) {
      stars.push({ id: id++, x: `${110 + i * 5}%`, y: `${20 + row * 20}%`, delay: row * 80 + Math.random() * 100, size: 14 + Math.random() * 8 });
    }
  }
  return stars;
};

const tears = [
  { id: 1, x: '8%', delay: 0, size: 18 }, { id: 2, x: '15%', delay: 100, size: 16 },
  { id: 3, x: '22%', delay: 50, size: 20 }, { id: 4, x: '30%', delay: 150, size: 17 },
  { id: 5, x: '38%', delay: 80, size: 19 }, { id: 6, x: '45%', delay: 200, size: 16 },
  { id: 7, x: '52%', delay: 30, size: 21 }, { id: 8, x: '60%', delay: 120, size: 18 },
];

// Theme colors
const themes = {
  light: {
    bg: ['#cde0dc', '#d4ddd8', '#d9d8d4', '#ddd4d0', '#e0d0cc', '#e0cdd1'],
    bgWin: '#d0e0cd',
    hintBg: ['#e8f2f0', '#eaefed', '#ecebe9', '#eee8e6', '#f0e5e4', '#f0e8ea'],
    hintBgWin: '#e8f0e6',
    border: ['#2d4a47', '#3a4443', '#433d3f', '#47373a', '#4a3236', '#4a2d35'],
    text: '#1f3533',
    textMuted: '#5a7a75',
    textMuted2: '#8aa8a3',
    divider: '#a3c4be',
    inputBorder: '#2d4a47',
    buttonBg: '#2d4a47',
    buttonText: '#e8f2f0',
  },
  dark: {
    bg: ['#1a2a28', '#1e2c2a', '#222e2c', '#26302e', '#2a3230', '#2e3432'],
    bgWin: '#1a2e1a',
    hintBg: ['#243432', '#283836', '#2c3c3a', '#30403e', '#344442', '#384846'],
    hintBgWin: '#1e3a1e',
    border: ['#5a8a85', '#5a8080', '#5a7a75', '#5a7070', '#5a6a65', '#5a6060'],
    text: '#e8f2f0',
    textMuted: '#a8c8c3',
    textMuted2: '#7a9a95',
    divider: '#4a6a65',
    inputBorder: '#5a8a85',
    buttonBg: '#5a8a85',
    buttonText: '#1a2a28',
  }
};

// Stats Modal Component
const StatsModal = ({ stats, onClose, darkMode }) => {
  const t = darkMode ? themes.dark : themes.light;
  const winPercentage = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const avgGuesses = stats.gamesWon > 0 ? (stats.totalGuessesOnWins / stats.gamesWon).toFixed(1) : '-';
  const maxGuessCount = Math.max(...Object.values(stats.guessDistribution), 1);
  const unlockedAchievements = Object.keys(ACHIEVEMENTS).filter(key => stats.achievements && stats.achievements[key]);
  
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '20px', boxSizing: 'border-box',
    }} onClick={onClose}>
      <div style={{
        background: darkMode ? '#243432' : '#e8f2f0',
        border: `3px solid ${t.border[0]}`,
        padding: '24px',
        maxWidth: '420px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        fontFamily: '"Courier New", monospace',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: t.text, fontSize: '1.2rem' }}>STATISTICS</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: t.text, padding: '8px' }}>×</button>
        </div>
        
        {/* Main Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: t.text }}>{stats.gamesPlayed}</div>
            <div style={{ fontSize: '0.65rem', color: t.textMuted }}>Played</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: t.text }}>{winPercentage}%</div>
            <div style={{ fontSize: '0.65rem', color: t.textMuted }}>Win Rate</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: t.text }}>{stats.gamesWon}</div>
            <div style={{ fontSize: '0.65rem', color: t.textMuted }}>Won</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: t.text }}>{stats.currentStreak}</div>
            <div style={{ fontSize: '0.65rem', color: t.textMuted }}>Streak</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: t.text }}>{stats.maxStreak}</div>
            <div style={{ fontSize: '0.65rem', color: t.textMuted }}>Best Streak</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: t.text }}>{avgGuesses}</div>
            <div style={{ fontSize: '0.65rem', color: t.textMuted }}>Avg Guesses</div>
          </div>
        </div>
        
        {/* Guess Distribution */}
        <div style={{ marginBottom: '8px', color: t.text, fontWeight: 'bold', fontSize: '0.85rem' }}>GUESS DISTRIBUTION</div>
        {[1, 2, 3, 4, 5].map(num => (
          <div key={num} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ width: '16px', color: t.text, fontSize: '0.85rem' }}>{num}</span>
            <div style={{ flex: 1, background: darkMode ? '#1a2a28' : '#cde0dc', height: '18px', marginLeft: '8px' }}>
              <div style={{
                width: `${Math.max((stats.guessDistribution[num] / maxGuessCount) * 100, stats.guessDistribution[num] > 0 ? 8 : 0)}%`,
                background: t.buttonBg, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: '4px', color: t.buttonText, fontSize: '0.75rem', minWidth: stats.guessDistribution[num] > 0 ? '22px' : '0',
              }}>
                {stats.guessDistribution[num] > 0 && stats.guessDistribution[num]}
              </div>
            </div>
          </div>
        ))}
        
        {/* Category Stats */}
        {stats.categoryWins && (
          <>
            <div style={{ marginTop: '16px', marginBottom: '8px', color: t.text, fontWeight: 'bold', fontSize: '0.85rem' }}>CATEGORY WINS</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', color: t.textMuted }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem' }}>👤</div>
                <div>{stats.categoryWins.Personality || 0}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem' }}>🐸</div>
                <div>{stats.categoryWins.Memecoin || 0}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem' }}>🖼️</div>
                <div>{stats.categoryWins['NFT Project'] || 0}</div>
              </div>
            </div>
          </>
        )}
        
        {/* Achievements */}
        <div style={{ marginTop: '16px', marginBottom: '8px', color: t.text, fontWeight: 'bold', fontSize: '0.85rem' }}>
          ACHIEVEMENTS ({unlockedAchievements.length}/{Object.keys(ACHIEVEMENTS).length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.values(ACHIEVEMENTS).map(achievement => {
            const unlocked = stats.achievements && stats.achievements[achievement.id];
            return (
              <div key={achievement.id} title={`${achievement.name}: ${achievement.description}`} style={{
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', borderRadius: '4px', cursor: 'pointer',
                background: unlocked ? (darkMode ? '#3a5a55' : '#d0e8e0') : (darkMode ? '#1a2a28' : '#ddd'),
                opacity: unlocked ? 1 : 0.4, filter: unlocked ? 'none' : 'grayscale(100%)',
                border: unlocked ? `2px solid ${t.buttonBg}` : '2px solid transparent',
              }}>
                {achievement.emoji}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ darkMode }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return <span>{timeLeft}</span>;
};

// Share Card Generator
const generateShareCard = async (puzzle, guesses, gameState, stats, darkMode) => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = darkMode ? '#1a2a28' : '#cde0dc';
  ctx.fillRect(0, 0, 600, 400);
  
  // Border
  ctx.strokeStyle = darkMode ? '#5a8a85' : '#2d4a47';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 580, 380);
  
  // Title
  ctx.fillStyle = darkMode ? '#e8f2f0' : '#2d4a47';
  ctx.font = 'bold 36px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('DEGENDLE', 300, 60);
  
  // Puzzle number
  ctx.font = '18px Courier New';
  ctx.fillText(`#${String(puzzle.dayNumber).padStart(4, '0')}`, 300, 90);
  
  // Result
  const resultText = gameState === 'won' ? `${guesses.length}/5` : 'X/5';
  ctx.font = 'bold 48px Courier New';
  ctx.fillText(resultText, 300, 160);
  
  // Emoji grid
  const grid = guesses.map(g => g.correct ? '🟩' : '🟥').join(' ');
  ctx.font = '32px Arial';
  ctx.fillText(grid, 300, 220);
  
  // Stats
  ctx.font = '16px Courier New';
  ctx.fillStyle = darkMode ? '#a8c8c3' : '#5a7a75';
  ctx.fillText(`🔥 Streak: ${stats.currentStreak}  |  🏆 Win Rate: ${stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%`, 300, 280);
  
  // Category
  ctx.fillText(`Category: ${puzzle.category}`, 300, 310);
  
  // Achievements (show up to 5 recent)
  const unlockedAchievements = Object.keys(ACHIEVEMENTS).filter(key => stats.achievements && stats.achievements[key]);
  if (unlockedAchievements.length > 0) {
    const achievementEmojis = unlockedAchievements.slice(0, 5).map(key => ACHIEVEMENTS[key].emoji).join(' ');
    ctx.font = '24px Arial';
    ctx.fillText(achievementEmojis, 300, 350);
  }
  
  // URL
  ctx.font = '14px Courier New';
  ctx.fillStyle = darkMode ? '#7a9a95' : '#8aa8a3';
  ctx.fillText('degendle.com', 300, 380);
  
  return canvas.toDataURL('image/png');
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Degendle() {
  // Puzzle state
  const [puzzle, setPuzzle] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [imageHint, setImageHint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Game state
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState('playing');
  const [showStars, setShowStars] = useState(false);
  const [showTears, setShowTears] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [solveTime, setSolveTime] = useState(null);
  
  // UI state
  const [muted, setMuted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  
  // Touch/swipe state
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  
  // Flashlight mode state
  const [flashlightMode, setFlashlightMode] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hintBoxRef = useRef(null);
  
  // Stats state
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    lastPlayedDay: null,
    totalGuessesOnWins: 0,
    categoryWins: { Personality: 0, Memecoin: 0, 'NFT Project': 0 },
    achievements: {},
  });
  
  // Sound effects
  const { playWrongSound, playWinSound } = useSound(muted);
  
  // Test mode state
  const [testPuzzleIndex, setTestPuzzleIndex] = useState(null);
  const totalPuzzles = 46;

  const stars = useMemo(() => generateStars(), []);
  const maxGuesses = 5;
  const t = darkMode ? themes.dark : themes.light;

  // Load preferences
  useEffect(() => {
    const savedMuted = localStorage.getItem('degendle-muted');
    const savedDarkMode = localStorage.getItem('degendle-darkmode');
    if (savedMuted) setMuted(JSON.parse(savedMuted));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    
    // Check system preference
    if (!savedDarkMode && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('degendle-muted', JSON.stringify(muted));
  }, [muted]);
  
  useEffect(() => {
    localStorage.setItem('degendle-darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Auto-disable flashlight when game ends
  useEffect(() => {
    if (gameState === 'won' || gameState === 'lost') {
      setFlashlightMode(false);
    }
  }, [gameState]);

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('degendle-stats-v2');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        setStats(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    } else {
      // Migrate from old stats
      const oldStats = localStorage.getItem('degendle-stats');
      if (oldStats) {
        try {
          const parsed = JSON.parse(oldStats);
          setStats(prev => ({ ...prev, ...parsed, totalGuessesOnWins: 0, categoryWins: { Personality: 0, Memecoin: 0, 'NFT Project': 0 }, achievements: {} }));
        } catch (e) {}
      }
    }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((newStats) => {
    setStats(newStats);
    localStorage.setItem('degendle-stats-v2', JSON.stringify(newStats));
  }, []);

  // Check and unlock achievements
  const checkAchievements = useCallback((newStats, guessCount, category) => {
    const achievements = { ...newStats.achievements };
    let newlyUnlocked = null;
    
    // First win
    if (newStats.gamesWon === 1 && !achievements.firstWin) {
      achievements.firstWin = true;
      newlyUnlocked = 'firstWin';
    }
    
    // Perfect game
    if (guessCount === 1 && !achievements.perfectGame) {
      achievements.perfectGame = true;
      newlyUnlocked = 'perfectGame';
    }
    
    // Streaks
    if (newStats.currentStreak >= 5 && !achievements.streak5) {
      achievements.streak5 = true;
      newlyUnlocked = 'streak5';
    }
    if (newStats.currentStreak >= 10 && !achievements.streak10) {
      achievements.streak10 = true;
      newlyUnlocked = 'streak10';
    }
    if (newStats.currentStreak >= 25 && !achievements.streak25) {
      achievements.streak25 = true;
      newlyUnlocked = 'streak25';
    }
    
    // Games played
    if (newStats.gamesPlayed >= 10 && !achievements.played10) {
      achievements.played10 = true;
      newlyUnlocked = 'played10';
    }
    if (newStats.gamesPlayed >= 25 && !achievements.played25) {
      achievements.played25 = true;
      newlyUnlocked = 'played25';
    }
    if (newStats.gamesPlayed >= 50 && !achievements.played50) {
      achievements.played50 = true;
      newlyUnlocked = 'played50';
    }
    
    // Win rate
    if (newStats.gamesPlayed >= 10 && (newStats.gamesWon / newStats.gamesPlayed) >= 0.8 && !achievements.winRate80) {
      achievements.winRate80 = true;
      newlyUnlocked = 'winRate80';
    }
    
    // Category wins
    if (newStats.categoryWins.Personality >= 5 && !achievements.categoryPersonality) {
      achievements.categoryPersonality = true;
      newlyUnlocked = 'categoryPersonality';
    }
    if (newStats.categoryWins.Memecoin >= 5 && !achievements.categoryMemecoin) {
      achievements.categoryMemecoin = true;
      newlyUnlocked = 'categoryMemecoin';
    }
    if (newStats.categoryWins['NFT Project'] >= 5 && !achievements.categoryNFT) {
      achievements.categoryNFT = true;
      newlyUnlocked = 'categoryNFT';
    }
    
    return { achievements, newlyUnlocked };
  }, []);

  // Test functions
  const resetPuzzle = () => {
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setShowStars(false);
    setShowTears(false);
    setAnswer(null);
    setImageHint(null);
    setCopied(false);
    setImageLoaded(false);
    setGameStartTime(Date.now());
    setSolveTime(null);
    if (puzzle) {
      localStorage.removeItem(`degendle-${puzzle.dayNumber}`);
    }
  };

  const goToTestPuzzle = async (direction) => {
    const currentIndex = testPuzzleIndex !== null ? testPuzzleIndex : 0;
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % totalPuzzles;
    } else {
      newIndex = (currentIndex - 1 + totalPuzzles) % totalPuzzles;
    }
    setTestPuzzleIndex(newIndex);
    
    try {
      const res = await fetch(`/api/puzzle?testIndex=${newIndex}`);
      if (res.ok) {
        const data = await res.json();
        setPuzzle(data);
        resetPuzzle();
        if (data.imageHint) {
          const img = new Image();
          img.src = data.imageHint;
        }
      }
    } catch (err) {}
  };
  
  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !touchStartY.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    // Only trigger if horizontal swipe is significant and more than vertical
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        goToTestPuzzle('prev');
      } else {
        goToTestPuzzle('next');
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };
  
  // Handle mouse move for flashlight effect
  const handleHintBoxMouseMove = (e) => {
    if (!flashlightMode || !hintBoxRef.current) return;
    const rect = hintBoxRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Fetch today's puzzle on mount
  useEffect(() => {
    async function fetchPuzzle() {
      try {
        const res = await fetch('/api/puzzle');
        if (!res.ok) throw new Error('Failed to fetch puzzle');
        const data = await res.json();
        setPuzzle(data);
        setGameStartTime(Date.now());
        if (data.imageHint) {
          const img = new Image();
          img.onload = () => setImageLoaded(true);
          img.src = data.imageHint;
        }
      } catch (err) {
        setError('Failed to load puzzle. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    fetchPuzzle();
  }, []);

  // Load saved game state
  useEffect(() => {
    if (!puzzle) return;
    const savedState = localStorage.getItem(`degendle-${puzzle.dayNumber}`);
    if (savedState) {
      try {
        const { guesses: savedGuesses, gameState: savedGameState, answer: savedAnswer, imageHint: savedImageHint, solveTime: savedSolveTime } = JSON.parse(savedState);
        setGuesses(savedGuesses || []);
        setGameState(savedGameState || 'playing');
        if (savedAnswer) setAnswer(savedAnswer);
        if (savedImageHint) setImageHint(savedImageHint);
        if (savedSolveTime) setSolveTime(savedSolveTime);
        if (savedGameState === 'won') setShowStars(true);
        if (savedGameState === 'lost') setShowTears(true);
      } catch (e) {}
    }
  }, [puzzle]);

  // Save game state
  const saveGameState = useCallback((newGuesses, newGameState, newAnswer = null, newImageHint = null, newSolveTime = null) => {
    if (!puzzle) return;
    localStorage.setItem(`degendle-${puzzle.dayNumber}`, JSON.stringify({
      guesses: newGuesses,
      gameState: newGameState,
      answer: newAnswer,
      imageHint: newImageHint,
      solveTime: newSolveTime,
    }));
  }, [puzzle]);

  // Update stats on game end
  const updateStats = useCallback((won, guessCount, category) => {
    if (!puzzle) return;
    
    const dayNumber = puzzle.dayNumber;
    if (stats.lastPlayedDay === dayNumber) return;
    
    const newStats = { ...stats };
    newStats.gamesPlayed += 1;
    newStats.lastPlayedDay = dayNumber;
    
    if (won) {
      newStats.gamesWon += 1;
      newStats.guessDistribution[guessCount] = (newStats.guessDistribution[guessCount] || 0) + 1;
      newStats.currentStreak += 1;
      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
      newStats.totalGuessesOnWins = (newStats.totalGuessesOnWins || 0) + guessCount;
      
      // Category wins
      if (!newStats.categoryWins) newStats.categoryWins = { Personality: 0, Memecoin: 0, 'NFT Project': 0 };
      newStats.categoryWins[category] = (newStats.categoryWins[category] || 0) + 1;
      
      // Check achievements
      const { achievements, newlyUnlocked } = checkAchievements(newStats, guessCount, category);
      newStats.achievements = achievements;
      
      if (newlyUnlocked) {
        setNewAchievement(ACHIEVEMENTS[newlyUnlocked]);
        setTimeout(() => setNewAchievement(null), 3000);
      }
    } else {
      newStats.currentStreak = 0;
    }
    
    saveStats(newStats);
  }, [puzzle, stats, saveStats, checkAchievements]);

  // Generate share text
  const generateShareText = () => {
    if (!puzzle || gameState === 'playing') return '';
    
    const emojiGrid = guesses.map(g => g.correct ? '🟩' : '🟥').join('');
    const result = gameState === 'won' ? `${guesses.length}/5` : 'X/5';
    const streakText = stats.currentStreak > 1 ? `🔥${stats.currentStreak}` : '';
    const unlockedCount = Object.keys(stats.achievements || {}).filter(k => stats.achievements[k]).length;
    
    return `DEGENDLE #${puzzle.dayNumber} ${result} ${streakText}\n\n${emojiGrid}\n\n🏆 ${unlockedCount}/${Object.keys(ACHIEVEMENTS).length} achievements\n\nhttps://degendle.com`;
  };

  // Copy share text to clipboard
  const handleShare = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Share as image
  const handleShareImage = async () => {
    try {
      const imageDataUrl = await generateShareCard(puzzle, guesses.map(g => ({ ...g, correct: g.feedback?.type === 'correct' || g.correct })), gameState, stats, darkMode);
      const link = document.createElement('a');
      link.download = `degendle-${puzzle.dayNumber}.png`;
      link.href = imageDataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate share image:', err);
    }
  };

  const handleSubmit = async () => {
    if (!currentGuess.trim() || gameState !== 'playing' || submitting) return;

    setSubmitting(true);
    
    try {
      const res = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guess: currentGuess,
          guessNumber: guesses.length + 1,
          testIndex: testPuzzleIndex,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit guess');
      }
      
      const result = await res.json();
      
      const newGuess = {
        text: currentGuess,
        correct: result.correct,
        feedback: {
          type: result.correct ? 'correct' : 'wrong',
          message: result.correct ? '✓' : '✗',
        },
      };
      
      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (result.imageHint) {
        setImageHint(result.imageHint);
      }

      const wrongCount = newGuesses.filter(g => !g.correct).length;

      if (result.correct) {
        const timeTaken = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : null;
        setSolveTime(timeTaken);
        setGameState('won');
        setAnswer(result.answer);
        setShowStars(true);
        playWinSound();
        if (result.imageHint) setImageHint(result.imageHint);
        saveGameState(newGuesses, 'won', result.answer, result.imageHint || imageHint, timeTaken);
        updateStats(true, newGuesses.length, puzzle.category);
      } else if (result.gameOver) {
        setGameState('lost');
        setAnswer(result.answer);
        setShowTears(true);
        playWrongSound(wrongCount);
        saveGameState(newGuesses, 'lost', result.answer, imageHint || result.imageHint);
        updateStats(false, newGuesses.length, puzzle.category);
      } else {
        playWrongSound(wrongCount);
        setShakeWrong(true);
        setTimeout(() => setShakeWrong(false), 500);
        saveGameState(newGuesses, 'playing', null, imageHint || result.imageHint);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic colors based on wrong guesses
  const wrongCount = guesses.filter(g => !g.correct && g.feedback?.type !== 'correct').length;
  const getBg = () => gameState === 'won' ? t.bgWin : t.bg[Math.min(wrongCount, 5)];
  const getHintBg = () => gameState === 'won' ? t.hintBgWin : t.hintBg[Math.min(wrongCount, 5)];
  const getBorder = () => t.border[gameState === 'won' ? 0 : Math.min(wrongCount, 5)];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg[0], fontFamily: '"Courier New", monospace', color: t.text, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <pre style={{ fontSize: 'clamp(0.3rem, 1.5vw, 0.5rem)', marginBottom: '20px', overflow: 'hidden' }}>{asciiTitle}</pre>
          <div>Loading puzzle...</div>
        </div>
      </div>
    );
  }

  if (error && !puzzle) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg[5], fontFamily: '"Courier New", monospace', color: t.text, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <pre style={{ fontSize: 'clamp(0.3rem, 1.5vw, 0.5rem)', marginBottom: '20px', overflow: 'hidden' }}>{asciiTitle}</pre>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: getBg(),
        fontFamily: '"Courier New", monospace',
        color: t.text,
        padding: 'clamp(10px, 3vw, 20px)',
        lineHeight: 1.4,
        transition: 'background 0.5s ease, color 0.3s ease',
        overflow: 'hidden',
        userSelect: 'none',
        position: 'relative',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @keyframes starBurst {
          0% { opacity: 1; transform: translateY(0) scale(0); }
          15% { opacity: 1; transform: translateY(-40px) scale(1.2); }
          30% { opacity: 1; transform: translateY(-50px) scale(1); }
          100% { opacity: 0; transform: translateY(calc(100vh - 100px)) scale(0.5); }
        }
        @keyframes tearDrop {
          0% { opacity: 0; transform: translateY(0) scaleY(1); }
          10% { opacity: 1; transform: translateY(5px) scaleY(1.2); }
          100% { opacity: 0; transform: translateY(calc(100vh - 50px)) scaleY(1.5); }
        }
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes achievementPop {
          0% { opacity: 0; transform: scale(0.5) translateY(20px); }
          50% { opacity: 1; transform: scale(1.1) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes achievementFade {
          0%, 80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Top Bar - Mute & Dark Mode & Flashlight */}
      <div style={{ position: 'absolute', top: 'clamp(10px, 2vw, 20px)', right: 'clamp(10px, 2vw, 20px)', display: 'flex', gap: '8px', zIndex: 100 }}>
        {/* Flashlight button - only show when playing */}
        {gameState === 'playing' && (
          <button
            onClick={() => setFlashlightMode(!flashlightMode)}
            style={{
              background: flashlightMode ? t.buttonBg : 'transparent',
              border: `2px solid ${getBorder()}`,
              padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 14px)',
              color: flashlightMode ? t.buttonText : getBorder(),
              fontFamily: 'inherit',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            🔦
          </button>
        )}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: 'transparent',
            border: `2px solid ${getBorder()}`,
            padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 14px)',
            color: getBorder(),
            fontFamily: 'inherit',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button
          onClick={() => setMuted(!muted)}
          style={{
            background: 'transparent',
            border: `2px solid ${getBorder()}`,
            padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 14px)',
            color: getBorder(),
            fontFamily: 'inherit',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
      
      {/* New Achievement Popup */}
      {newAchievement && (
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: darkMode ? '#2a4a45' : '#d0e8e0',
          border: `3px solid ${t.buttonBg}`,
          padding: '20px 30px',
          borderRadius: '8px',
          zIndex: 1001,
          textAlign: 'center',
          animation: 'achievementPop 0.5s ease-out, achievementFade 3s ease-out forwards',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{newAchievement.emoji}</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: t.text }}>Achievement Unlocked!</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: t.buttonBg, marginTop: '5px' }}>{newAchievement.name}</div>
          <div style={{ fontSize: '0.8rem', color: t.textMuted, marginTop: '5px' }}>{newAchievement.description}</div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && <StatsModal stats={stats} onClose={() => setShowStats(false)} darkMode={darkMode} />}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* ASCII Title */}
        <pre style={{ 
          fontSize: 'clamp(0.28rem, 1.2vw, 0.7rem)', 
          lineHeight: 1.1, 
          margin: 'clamp(30px, 5vw, 20px) 0 clamp(10px, 2vw, 20px) 0', 
          overflow: 'hidden', 
          color: getBorder(), 
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          {asciiTitle}
        </pre>

        <div style={{ fontSize: 'clamp(0.6rem, 2vw, 0.91rem)', color: t.textMuted2, marginBottom: 'clamp(15px, 3vw, 30px)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{divider}</div>

        {/* Puzzle Section */}
        <div style={{ marginBottom: 'clamp(15px, 3vw, 30px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(0.7rem, 2vw, 0.91rem)', color: t.textMuted, marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <span>( H | I | N | T ) - ( {puzzle.category.split('').join(' | ').toUpperCase()} )</span>
            <span>#{puzzle.dayNumber.toString().padStart(4, '0')}</span>
          </div>

          {/* Hint Box */}
          <div 
            ref={hintBoxRef}
            onMouseMove={handleHintBoxMouseMove}
            onMouseLeave={() => flashlightMode && setMousePos({ x: -1000, y: -1000 })}
            style={{
            border: `2px solid ${getBorder()}`,
            padding: 'clamp(15px, 4vw, 30px)',
            margin: '20px 0',
            position: 'relative',
            overflow: 'hidden',
            background: getHintBg(),
            transition: 'all 0.5s ease',
            cursor: flashlightMode ? 'none' : 'default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: shakeWrong ? 'shake 0.5s ease-in-out' : 'none',
          }}>
            {/* Flashlight "?" Overlay - Hash Scatter style */}
            {flashlightMode && gameState === 'playing' && (
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  zIndex: 20,
                  overflow: 'hidden',
                  maskImage: `radial-gradient(circle 70px at ${mousePos.x}px ${mousePos.y}px, black 0%, black 50%, transparent 70%)`,
                  WebkitMaskImage: `radial-gradient(circle 70px at ${mousePos.x}px ${mousePos.y}px, black 0%, black 50%, transparent 70%)`,
                }}
              >
                {/* Generate chaotic "?" marks using hash scatter algorithm */}
                {Array.from({ length: 110 }).map((_, i) => {
                  let h1 = i ^ 0xDEADBEEF;
                  let h2 = i ^ 0xCAFEBABE;
                  h1 = Math.imul(h1 ^ (h1 >>> 16), 0x85ebca6b);
                  h2 = Math.imul(h2 ^ (h2 >>> 13), 0xc2b2ae35);
                  const top = (Math.abs(h1) % 130) - 15;
                  const left = (Math.abs(h2) % 130) - 15;
                  const size = (0.5 + (Math.abs(h1 ^ h2) % 28) / 10) * 1.15; // 15% bigger
                  const rotation = (Math.abs(h1 + h2) % 180) - 90;
                  const opacity = 0.1 + (Math.abs(h1 * h2) % 35) / 100;
                  
                  return (
                    <span 
                      key={i}
                      style={{
                        position: 'absolute',
                        top: `${top}%`,
                        left: `${left}%`,
                        fontFamily: '"Courier New", monospace',
                        fontSize: `${size}rem`,
                        color: darkMode 
                          ? `rgba(90, 138, 133, ${opacity})` 
                          : `rgba(45, 74, 71, ${opacity * 0.85})`,
                        fontWeight: 'bold',
                        transform: `rotate(${rotation}deg)`,
                        userSelect: 'none',
                      }}
                    >
                      ?
                    </span>
                  );
                })}
              </div>
            )}
            
            {/* Hint Text */}
            <div style={{
              fontSize: 'clamp(1rem, 3.5vw, 1.4rem)',
              textAlign: 'center',
              fontWeight: 'bold',
              color: getBorder(),
              lineHeight: 1.6,
              padding: 'clamp(10px, 2vw, 20px) 0',
            }}>
              "{puzzle.hint}"
            </div>
            
            {/* Image Hint - Lazy loaded */}
            {imageHint && (
              <div style={{ marginTop: '20px', textAlign: 'center', animation: 'fadeSlideIn 0.3s ease-out forwards' }}>
                <div style={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.8rem)', color: t.textMuted, marginBottom: '10px', fontStyle: 'italic' }}>( H | I | N | T ) #2</div>
                <div style={{ 
                  width: 'clamp(100px, 25vw, 150px)', 
                  height: 'clamp(100px, 25vw, 150px)', 
                  borderRadius: '8px', 
                  border: `2px solid ${getBorder()}`, 
                  overflow: 'hidden', 
                  margin: '0 auto', 
                  backgroundColor: darkMode ? '#1a2a28' : '#ddd' 
                }}>
                  <img 
                    src={imageHint} 
                    alt="Visual hint" 
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    crossOrigin="anonymous" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </div>
            )}
            
            {/* Answer + Share/Stats (shown on game end) */}
            {(gameState === 'won' || gameState === 'lost') && answer && (
              <>
                <div style={{ borderBottom: `2px solid ${getBorder()}`, margin: '20px 0', width: '100%' }} />
                <div style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.56rem)', fontWeight: 'bold', textAlign: 'center', color: getBorder() }}>{answer}</div>
                {solveTime && <div style={{ fontSize: '0.8rem', color: t.textMuted, marginTop: '5px' }}>Solved in {Math.floor(solveTime / 60)}:{(solveTime % 60).toString().padStart(2, '0')}</div>}
                <div style={{ borderBottom: `2px solid ${getBorder()}`, margin: '20px 0', width: '100%' }} />
                
                {/* Share, Stats, Streak */}
                <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 15px)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                  <button
                    onClick={handleShare}
                    style={{
                      background: t.buttonBg,
                      border: 'none',
                      padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)',
                      color: t.buttonText,
                      fontFamily: 'inherit',
                      fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    {copied ? '✓ COPIED!' : '📋 COPY'}
                  </button>
                  <button
                    onClick={handleShareImage}
                    style={{
                      background: 'transparent',
                      border: `2px solid ${getBorder()}`,
                      padding: 'clamp(6px, 1.5vw, 10px) clamp(10px, 2.5vw, 16px)',
                      color: getBorder(),
                      fontFamily: 'inherit',
                      fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    🖼️ IMAGE
                  </button>
                  <button
                    onClick={() => setShowStats(true)}
                    style={{
                      background: 'transparent',
                      border: `2px solid ${getBorder()}`,
                      padding: 'clamp(6px, 1.5vw, 10px) clamp(10px, 2.5vw, 16px)',
                      color: getBorder(),
                      fontFamily: 'inherit',
                      fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    📊 STATS
                  </button>
                  <div style={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', color: t.textMuted }}>
                    🔥 {stats.currentStreak}
                  </div>
                </div>
              </>
            )}
            
            {/* Star Burst Animation */}
            {showStars && stars.map((star) => (
              <div
                key={star.id}
                style={{
                  position: 'absolute',
                  left: star.x,
                  top: star.y,
                  fontSize: `${star.size}px`,
                  color: '#f0c040',
                  textShadow: '0 0 4px #f0c040',
                  pointerEvents: 'none',
                  animation: `starBurst 1.5s ease-in ${star.delay}ms forwards`,
                  zIndex: 10,
                }}
              >
                ✦
              </div>
            ))}

            {/* Tears Animation */}
            {showTears && tears.map((tear) => (
              <div
                key={tear.id}
                style={{
                  position: 'absolute',
                  left: tear.x,
                  top: '100%',
                  fontSize: `${tear.size}px`,
                  color: '#6a8faf',
                  pointerEvents: 'none',
                  animation: `tearDrop 2s ease-in ${tear.delay}ms forwards`,
                  zIndex: 10,
                }}
              >
                💧
              </div>
            ))}
          </div>

          <div style={{ fontSize: 'clamp(0.7rem, 2vw, 0.845rem)', color: t.textMuted, textAlign: 'right' }}>
            attempts remaining: {maxGuesses - guesses.length}/5
          </div>
        </div>

        <div style={{ fontSize: 'clamp(0.6rem, 2vw, 0.91rem)', color: t.divider, marginBottom: '20px', overflow: 'hidden' }}>{divider}</div>

        {/* Error Message */}
        {error && (
          <div style={{ color: '#c44', fontSize: 'clamp(0.8rem, 2vw, 0.975rem)', marginBottom: '15px', padding: '10px', background: darkMode ? '#3a2828' : '#f0e0e0', border: `1px solid ${darkMode ? '#6a4444' : '#d4a4a4'}` }}>
            {error}
          </div>
        )}

        {/* Guesses List */}
        <div style={{ marginBottom: '20px' }}>
          {guesses.map((guess, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'clamp(6px, 1.5vw, 8px) 0', borderBottom: `1px dotted ${t.textMuted2}`, fontSize: 'clamp(0.9rem, 2.5vw, 1.105rem)' }}>
              <span style={{ color: t.text }}>{String(i + 1).padStart(2, '0')}. {guess.text.toLowerCase()}</span>
              <span style={{ color: guess.correct || guess.feedback?.type === 'correct' ? (darkMode ? '#6a9' : '#1a5a50') : t.textMuted, fontWeight: guess.correct || guess.feedback?.type === 'correct' ? 'bold' : 'normal' }}>
                {guess.correct || guess.feedback?.type === 'correct' ? '✓' : '✗'}
              </span>
            </div>
          ))}
          {gameState === 'playing' && Array.from({ length: maxGuesses - guesses.length }).map((_, i) => (
            <div key={`empty-${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: 'clamp(6px, 1.5vw, 8px) 0', borderBottom: `1px dotted ${t.divider}`, fontSize: 'clamp(0.9rem, 2.5vw, 1.105rem)', color: t.divider }}>
              <span>{String(guesses.length + i + 1).padStart(2, '0')}. _________________</span><span>○</span>
            </div>
          ))}
        </div>

        {/* Input */}
        {gameState === 'playing' && (
          <div style={{ marginTop: 'clamp(15px, 4vw, 30px)' }}>
            <div style={{ fontSize: 'clamp(0.7rem, 2vw, 0.845rem)', color: t.textMuted, marginBottom: '8px' }}>{'>'} enter guess:</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                disabled={submitting}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${t.inputBorder}`,
                  padding: 'clamp(8px, 2vw, 10px) 0',
                  fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  color: t.text,
                  opacity: submitting ? 0.5 : 1,
                  userSelect: 'text',
                  minWidth: 0,
                }}
                autoComplete="off"
                spellCheck="false"
              />
              <button onClick={handleSubmit} disabled={submitting} style={{
                background: t.buttonBg,
                border: 'none',
                padding: 'clamp(8px, 2vw, 10px) clamp(15px, 4vw, 25px)',
                color: t.buttonText,
                fontFamily: 'inherit',
                fontSize: 'clamp(0.85rem, 2.5vw, 1.04rem)',
                cursor: submitting ? 'wait' : 'pointer',
                letterSpacing: '2px',
                opacity: submitting ? 0.7 : 1,
                borderRadius: '4px',
                whiteSpace: 'nowrap',
              }}>
                {submitting ? '...' : 'SUBMIT'}
              </button>
            </div>
          </div>
        )}

        {/* Win/Lose Messages */}
        {gameState === 'won' && (
          <div style={{ marginTop: '20px', fontSize: 'clamp(0.8rem, 2.2vw, 0.975rem)', color: darkMode ? '#8c8' : '#4a6a65', textAlign: 'center' }}>
            solved in {guesses.length} attempt{guesses.length !== 1 ? 's' : ''}
          </div>
        )}
        {gameState === 'lost' && (
          <div style={{ marginTop: '20px', fontSize: 'clamp(0.8rem, 2.2vw, 0.975rem)', color: darkMode ? '#c88' : '#6a4a52', textAlign: 'center' }}>
            better luck next time
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop: 'clamp(30px, 8vw, 60px)', paddingTop: '20px', fontSize: 'clamp(0.65rem, 1.8vw, 0.78rem)', color: t.textMuted2 }}>
          {divider}
          
          {/* New Puzzle Text + Countdown */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)', color: t.textMuted, fontWeight: 'bold', marginBottom: '5px' }}>
              NEW PUZZLE DAILY @ 00:00 UTC
            </div>
            <div style={{ fontSize: 'clamp(0.75rem, 2.2vw, 0.95rem)', color: t.textMuted2, fontFamily: 'monospace' }}>
              <CountdownTimer darkMode={darkMode} />
            </div>
          </div>
          
          {/* Social Links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '25px', fontSize: 'clamp(0.85rem, 2.5vw, 1.04rem)' }}>
            <a href="https://x.com/degendle" target="_blank" rel="noopener noreferrer" style={{ color: t.text, textDecoration: 'none' }}>[ X ]</a>
          </div>

          {/* Test Buttons + Donate */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(5px, 1.5vw, 10px)', marginTop: '25px', flexWrap: 'wrap' }}>
            <button onClick={() => goToTestPuzzle('prev')} style={{ background: darkMode ? '#4a6a65' : '#5a7a75', border: 'none', padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)', color: '#e8f2f0', fontFamily: 'inherit', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', cursor: 'pointer', borderRadius: '4px' }}>← PREV</button>
            <button onClick={resetPuzzle} style={{ background: darkMode ? '#6a5a55' : '#8a6a65', border: 'none', padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)', color: '#e8f2f0', fontFamily: 'inherit', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', cursor: 'pointer', borderRadius: '4px' }}>↻ RESET</button>
            <button onClick={() => goToTestPuzzle('next')} style={{ background: darkMode ? '#4a6a65' : '#5a7a75', border: 'none', padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)', color: '#e8f2f0', fontFamily: 'inherit', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', cursor: 'pointer', borderRadius: '4px' }}>NEXT →</button>
            <button style={{ background: t.buttonBg, border: 'none', padding: 'clamp(8px, 2vw, 12px) clamp(18px, 4vw, 30px)', color: t.buttonText, fontFamily: 'inherit', fontSize: 'clamp(0.85rem, 2.2vw, 1.105rem)', cursor: 'pointer', borderRadius: '4px' }}>♥ DONATE</button>
          </div>

          {testPuzzleIndex !== null && (
            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: 'clamp(0.65rem, 1.8vw, 0.8rem)', color: t.textMuted }}>
              Testing: Puzzle {testPuzzleIndex + 1}/{totalPuzzles} | Swipe ← → to navigate
            </div>
          )}

          <div style={{ marginTop: '30px', textAlign: 'center', color: t.divider, fontSize: 'clamp(0.6rem, 1.5vw, 0.715rem)' }}>by vldtz x claude</div>
        </footer>
      </div>
    </div>
  );
}
