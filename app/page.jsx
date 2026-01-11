'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

// ============================================================================
// DEGENDLE - Crypto Guessing Game
// ============================================================================

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
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.setValueAtTime(note.freq, audioCtx.currentTime + note.start);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + note.start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + note.start + note.duration);
        oscillator.start(audioCtx.currentTime + note.start);
        oscillator.stop(audioCtx.currentTime + note.start + note.duration + 0.1);
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

// Generate stars - now spread wider (left, center, right of hint box)
const generateStars = () => {
  const stars = [];
  let id = 0;
  
  // Left side stars (outside hint box)
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 3; i++) {
      stars.push({
        id: id++,
        x: `${-15 + i * 5}%`,
        y: `${20 + row * 20}%`,
        delay: row * 80 + Math.random() * 100,
        size: 14 + Math.random() * 8,
      });
    }
  }
  
  // Center stars (inside hint box) - original
  for (let row = 0; row < 6; row++) {
    const y = 10 + row * 15;
    const starsInRow = 12 - row;
    for (let i = 0; i < starsInRow; i++) {
      const x = 3 + (i / (starsInRow - 1)) * 94;
      stars.push({
        id: id++,
        x: `${x}%`,
        y: `${y}%`,
        delay: row * 60 + Math.random() * 80,
        size: 12 + Math.random() * 8,
      });
    }
  }
  
  // Right side stars (outside hint box)
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 3; i++) {
      stars.push({
        id: id++,
        x: `${110 + i * 5}%`,
        y: `${20 + row * 20}%`,
        delay: row * 80 + Math.random() * 100,
        size: 14 + Math.random() * 8,
      });
    }
  }
  
  return stars;
};

const tears = [
  { id: 1, x: '8%', delay: 0, size: 18 }, { id: 2, x: '15%', delay: 100, size: 16 },
  { id: 3, x: '22%', delay: 50, size: 20 }, { id: 4, x: '30%', delay: 150, size: 17 },
  { id: 5, x: '38%', delay: 80, size: 19 }, { id: 6, x: '45%', delay: 200, size: 16 },
  { id: 7, x: '52%', delay: 30, size: 21 }, { id: 8, x: '60%', delay: 120, size: 18 },
  { id: 9, x: '68%', delay: 180, size: 17 }, { id: 10, x: '75%', delay: 60, size: 19 },
  { id: 11, x: '82%', delay: 140, size: 16 }, { id: 12, x: '90%', delay: 90, size: 18 },
];

// Stats Modal Component
const StatsModal = ({ stats, onClose }) => {
  const winPercentage = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const maxGuessCount = Math.max(...Object.values(stats.guessDistribution), 1);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: '#e8f2f0',
        border: '3px solid #2d4a47',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        fontFamily: '"Courier New", monospace',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#2d4a47', fontSize: '1.3rem' }}>STATISTICS</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#2d4a47' }}>×</button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '25px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d4a47' }}>{stats.gamesPlayed}</div>
            <div style={{ fontSize: '0.7rem', color: '#5a7a75' }}>Played</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d4a47' }}>{winPercentage}</div>
            <div style={{ fontSize: '0.7rem', color: '#5a7a75' }}>Win %</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d4a47' }}>{stats.currentStreak}</div>
            <div style={{ fontSize: '0.7rem', color: '#5a7a75' }}>Streak</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d4a47' }}>{stats.maxStreak}</div>
            <div style={{ fontSize: '0.7rem', color: '#5a7a75' }}>Max</div>
          </div>
        </div>
        
        <div style={{ marginBottom: '10px', color: '#2d4a47', fontWeight: 'bold' }}>GUESS DISTRIBUTION</div>
        {[1, 2, 3, 4, 5].map(num => (
          <div key={num} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ width: '20px', color: '#2d4a47' }}>{num}</span>
            <div style={{
              flex: 1,
              background: '#cde0dc',
              height: '20px',
              marginLeft: '10px',
            }}>
              <div style={{
                width: `${Math.max((stats.guessDistribution[num] / maxGuessCount) * 100, stats.guessDistribution[num] > 0 ? 10 : 0)}%`,
                background: '#2d4a47',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '5px',
                color: '#e8f2f0',
                fontSize: '0.8rem',
                minWidth: stats.guessDistribution[num] > 0 ? '25px' : '0',
              }}>
                {stats.guessDistribution[num] > 0 && stats.guessDistribution[num]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = () => {
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
  
  // Game state
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState('playing');
  const [showStars, setShowStars] = useState(false);
  const [showTears, setShowTears] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // UI state
  const [muted, setMuted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Stats state
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    lastPlayedDay: null,
  });
  
  // Sound effects
  const { playWrongSound, playWinSound } = useSound(muted);
  
  // Test mode state
  const [testPuzzleIndex, setTestPuzzleIndex] = useState(null);
  const totalPuzzles = 47;

  const stars = useMemo(() => generateStars(), []);
  const maxGuesses = 5;

  // Load mute preference
  useEffect(() => {
    const savedMuted = localStorage.getItem('degendle-muted');
    if (savedMuted) setMuted(JSON.parse(savedMuted));
  }, []);

  // Save mute preference
  useEffect(() => {
    localStorage.setItem('degendle-muted', JSON.stringify(muted));
  }, [muted]);

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('degendle-stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {}
    }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((newStats) => {
    setStats(newStats);
    localStorage.setItem('degendle-stats', JSON.stringify(newStats));
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

  // Fetch today's puzzle on mount
  useEffect(() => {
    async function fetchPuzzle() {
      try {
        const res = await fetch('/api/puzzle');
        if (!res.ok) throw new Error('Failed to fetch puzzle');
        const data = await res.json();
        setPuzzle(data);
        if (data.imageHint) {
          const img = new Image();
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
        const { guesses: savedGuesses, gameState: savedGameState, answer: savedAnswer, imageHint: savedImageHint } = JSON.parse(savedState);
        setGuesses(savedGuesses || []);
        setGameState(savedGameState || 'playing');
        if (savedAnswer) setAnswer(savedAnswer);
        if (savedImageHint) setImageHint(savedImageHint);
        if (savedGameState === 'won') setShowStars(true);
        if (savedGameState === 'lost') setShowTears(true);
      } catch (e) {}
    }
  }, [puzzle]);

  // Save game state
  const saveGameState = useCallback((newGuesses, newGameState, newAnswer = null, newImageHint = null) => {
    if (!puzzle) return;
    localStorage.setItem(`degendle-${puzzle.dayNumber}`, JSON.stringify({
      guesses: newGuesses,
      gameState: newGameState,
      answer: newAnswer,
      imageHint: newImageHint,
    }));
  }, [puzzle]);

  // Update stats on game end
  const updateStats = useCallback((won, guessCount) => {
    if (!puzzle) return;
    
    const dayNumber = puzzle.dayNumber;
    if (stats.lastPlayedDay === dayNumber) return; // Already counted
    
    const newStats = { ...stats };
    newStats.gamesPlayed += 1;
    newStats.lastPlayedDay = dayNumber;
    
    if (won) {
      newStats.gamesWon += 1;
      newStats.guessDistribution[guessCount] = (newStats.guessDistribution[guessCount] || 0) + 1;
      newStats.currentStreak += 1;
      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
    } else {
      newStats.currentStreak = 0;
    }
    
    saveStats(newStats);
  }, [puzzle, stats, saveStats]);

  // Generate share text
  const generateShareText = () => {
    if (!puzzle || gameState === 'playing') return '';
    
    const emojiGrid = guesses.map(g => g.feedback.type === 'correct' ? '🟩' : '🟥').join('');
    const result = gameState === 'won' ? `${guesses.length}/5` : 'X/5';
    
    return `DEGENDLE #${puzzle.dayNumber} ${result}\n\n${emojiGrid}\n\nhttps://degendle.com`;
  };

  // Copy share text to clipboard
  const handleShare = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
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

      const wrongCount = newGuesses.filter(g => g.feedback.type === 'wrong').length;

      if (result.correct) {
        setGameState('won');
        setAnswer(result.answer);
        setShowStars(true);
        playWinSound();
        if (result.imageHint) setImageHint(result.imageHint);
        saveGameState(newGuesses, 'won', result.answer, result.imageHint || imageHint);
        updateStats(true, newGuesses.length);
      } else if (result.gameOver) {
        setGameState('lost');
        setAnswer(result.answer);
        setShowTears(true);
        playWrongSound(wrongCount);
        saveGameState(newGuesses, 'lost', result.answer, imageHint || result.imageHint);
        updateStats(false, newGuesses.length);
      } else {
        playWrongSound(wrongCount);
        saveGameState(newGuesses, 'playing', null, imageHint || result.imageHint);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic colors based on wrong guesses
  const getBackgroundColor = () => {
    if (gameState === 'won') return '#d0e0cd';
    const wrongCount = guesses.filter(g => g.feedback.type === 'wrong').length;
    const colors = ['#cde0dc', '#d4ddd8', '#d9d8d4', '#ddd4d0', '#e0d0cc', '#e0cdd1'];
    return colors[Math.min(wrongCount, 5)];
  };

  const getHintBoxBackground = () => {
    if (gameState === 'won') return '#e8f0e6';
    const wrongCount = guesses.filter(g => g.feedback.type === 'wrong').length;
    const colors = ['#e8f2f0', '#eaefed', '#ecebe9', '#eee8e6', '#f0e5e4', '#f0e8ea'];
    return colors[Math.min(wrongCount, 5)];
  };

  const getBorderColor = () => {
    if (gameState === 'won') return '#2d4a47';
    const wrongCount = guesses.filter(g => g.feedback.type === 'wrong').length;
    const colors = ['#2d4a47', '#3a4443', '#433d3f', '#47373a', '#4a3236', '#4a2d35'];
    return colors[Math.min(wrongCount, 5)];
  };
  
  const getTextColor = () => getBorderColor();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#cde0dc', fontFamily: '"Courier New", monospace', color: '#1f3533', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <pre style={{ fontSize: '0.5rem', marginBottom: '20px' }}>{asciiTitle}</pre>
          <div>Loading puzzle...</div>
        </div>
      </div>
    );
  }

  if (error && !puzzle) {
    return (
      <div style={{ minHeight: '100vh', background: '#e0cdd1', fontFamily: '"Courier New", monospace', color: '#4a2d35', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <pre style={{ fontSize: '0.5rem', marginBottom: '20px' }}>{asciiTitle}</pre>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: getBackgroundColor(),
      fontFamily: '"Courier New", monospace',
      color: '#1f3533',
      padding: '20px',
      lineHeight: 1.4,
      transition: 'background 0.5s ease',
      overflow: 'hidden',
      userSelect: 'none',
      position: 'relative',
    }}>
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
      `}</style>

      {/* Mute Button - Top Right */}
      <button
        onClick={() => setMuted(!muted)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'transparent',
          border: `2px solid ${getBorderColor()}`,
          padding: '8px 12px',
          color: getBorderColor(),
          fontFamily: 'inherit',
          fontSize: '1rem',
          cursor: 'pointer',
          zIndex: 100,
        }}
        title={muted ? 'Unmute sounds' : 'Mute sounds'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {/* Stats Modal */}
      {showStats && <StatsModal stats={stats} onClose={() => setShowStats(false)} />}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* ASCII Title */}
        <pre style={{ fontSize: '0.7rem', lineHeight: 1.1, margin: '20px 0', overflow: 'hidden', color: '#2d4a47', fontWeight: 'bold' }}>
          {asciiTitle}
        </pre>

        <div style={{ fontSize: '0.91rem', color: '#8aa8a3', marginBottom: '30px' }}>{divider}</div>

        {/* Puzzle Section */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.91rem', color: '#5a7a75', marginBottom: '15px' }}>
            <span>( H | I | N | T ) - ( {puzzle.category.split('').join(' | ').toUpperCase()} )</span>
            <span>#{puzzle.dayNumber.toString().padStart(4, '0')}</span>
          </div>

          {/* Hint Box */}
          <div style={{
            border: `2px solid ${getBorderColor()}`,
            padding: '30px',
            margin: '20px 0',
            position: 'relative',
            overflow: 'visible',
            background: getHintBoxBackground(),
            transition: 'all 0.5s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Hint Text */}
            <div style={{
              fontSize: '1.4rem',
              textAlign: 'center',
              fontWeight: 'bold',
              color: getTextColor(),
              lineHeight: 1.6,
              padding: '20px 0',
            }}>
              "{puzzle.hint}"
            </div>
            
            {/* Image Hint */}
            {imageHint && (
              <div style={{ marginTop: '20px', textAlign: 'center', animation: 'fadeSlideIn 0.3s ease-out forwards' }}>
                <div style={{ fontSize: '0.8rem', color: '#5a7a75', marginBottom: '10px', fontStyle: 'italic' }}>( H | I | N | T ) #2</div>
                <div style={{ width: '150px', height: '150px', borderRadius: '8px', border: `2px solid ${getBorderColor()}`, overflow: 'hidden', margin: '0 auto', backgroundColor: '#ddd' }}>
                  <img src={imageHint} alt="Visual hint" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} crossOrigin="anonymous" referrerPolicy="no-referrer" />
                </div>
              </div>
            )}
            
            {/* Answer + Share/Stats (shown on game end) */}
            {(gameState === 'won' || gameState === 'lost') && answer && (
              <>
                <div style={{ borderBottom: `2px solid ${getBorderColor()}`, margin: '20px 0', width: '100%' }} />
                <div style={{ fontSize: '1.56rem', fontWeight: 'bold', textAlign: 'center', color: getTextColor() }}>{answer}</div>
                <div style={{ borderBottom: `2px solid ${getBorderColor()}`, margin: '20px 0', width: '100%' }} />
                
                {/* Share, Stats, Streak */}
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                  <button
                    onClick={handleShare}
                    style={{
                      background: '#2d4a47',
                      border: 'none',
                      padding: '10px 20px',
                      color: '#e8f2f0',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      letterSpacing: '1px',
                    }}
                  >
                    {copied ? '✓ COPIED!' : '📤 SHARE'}
                  </button>
                  <button
                    onClick={() => setShowStats(true)}
                    style={{
                      background: 'transparent',
                      border: `2px solid ${getBorderColor()}`,
                      padding: '8px 16px',
                      color: getBorderColor(),
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      letterSpacing: '1px',
                    }}
                  >
                    📊 STATS
                  </button>
                  <div style={{ fontSize: '0.85rem', color: '#5a7a75' }}>
                    🔥 Streak: {stats.currentStreak}
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

          <div style={{ fontSize: '0.845rem', color: '#5a7a75', textAlign: 'right' }}>
            attempts remaining: {maxGuesses - guesses.length}/5
          </div>
        </div>

        <div style={{ fontSize: '0.91rem', color: '#a3c4be', marginBottom: '20px' }}>{divider}</div>

        {/* Error Message */}
        {error && (
          <div style={{ color: '#8b4444', fontSize: '0.975rem', marginBottom: '15px', padding: '10px', background: '#f0e0e0', border: '1px solid #d4a4a4' }}>
            {error}
          </div>
        )}

        {/* Guesses List */}
        <div style={{ marginBottom: '20px' }}>
          {guesses.map((guess, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dotted #8aa8a3', fontSize: '1.105rem' }}>
              <span style={{ color: '#2d4a47' }}>{String(i + 1).padStart(2, '0')}. {guess.text.toLowerCase()}</span>
              <span style={{ color: guess.feedback.type === 'correct' ? '#1a5a50' : '#5a7a75', fontWeight: guess.feedback.type === 'correct' ? 'bold' : 'normal' }}>{guess.feedback.message}</span>
            </div>
          ))}
          {gameState === 'playing' && Array.from({ length: maxGuesses - guesses.length }).map((_, i) => (
            <div key={`empty-${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dotted #a3c4be', fontSize: '1.105rem', color: '#a3c4be' }}>
              <span>{String(guesses.length + i + 1).padStart(2, '0')}. _________________</span><span>○</span>
            </div>
          ))}
        </div>

        {/* Input */}
        {gameState === 'playing' && (
          <div style={{ marginTop: '30px' }}>
            <div style={{ fontSize: '0.845rem', color: '#5a7a75', marginBottom: '8px' }}>{'>'} enter guess:</div>
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
                  borderBottom: '2px solid #2d4a47',
                  padding: '10px 0',
                  fontSize: '1.3rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  color: '#2d4a47',
                  opacity: submitting ? 0.5 : 1,
                  userSelect: 'text',
                }}
                autoComplete="off"
                spellCheck="false"
              />
              <button onClick={handleSubmit} disabled={submitting} style={{
                background: '#2d4a47',
                border: 'none',
                padding: '10px 25px',
                color: '#e8f2f0',
                fontFamily: 'inherit',
                fontSize: '1.04rem',
                cursor: submitting ? 'wait' : 'pointer',
                letterSpacing: '2px',
                opacity: submitting ? 0.7 : 1,
              }}>
                {submitting ? '...' : 'SUBMIT'}
              </button>
            </div>
          </div>
        )}

        {/* Win/Lose Messages */}
        {gameState === 'won' && (
          <div style={{ marginTop: '20px', fontSize: '0.975rem', color: '#4a6a65', textAlign: 'center' }}>
            solved in {guesses.length} attempt{guesses.length !== 1 ? 's' : ''}
          </div>
        )}
        {gameState === 'lost' && (
          <div style={{ marginTop: '20px', fontSize: '0.975rem', color: '#6a4a52', textAlign: 'center' }}>
            better luck next time
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop: '60px', paddingTop: '20px', fontSize: '0.78rem', color: '#8aa8a3' }}>
          {divider}
          
          {/* New Puzzle Text + Countdown */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', color: '#5a7a75', fontWeight: 'bold', marginBottom: '5px' }}>
              NEW PUZZLE DAILY @ 00:00 UTC
            </div>
            <div style={{ fontSize: '0.95rem', color: '#8aa8a3', fontFamily: 'monospace' }}>
              <CountdownTimer />
            </div>
          </div>
          
          {/* Social Links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '25px', fontSize: '1.04rem' }}>
            <a href="https://x.com/degendle" target="_blank" rel="noopener noreferrer" style={{ color: '#2d4a47', textDecoration: 'none' }}>[ X ]</a>
          </div>

          {/* Test Buttons + Donate */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '25px', flexWrap: 'wrap' }}>
            <button onClick={() => goToTestPuzzle('prev')} style={{ background: '#5a7a75', border: '2px solid #5a7a75', padding: '12px 20px', color: '#e8f2f0', fontFamily: 'inherit', fontSize: '0.9rem', cursor: 'pointer', letterSpacing: '1px' }}>← PREV</button>
            <button onClick={resetPuzzle} style={{ background: '#8a6a65', border: '2px solid #8a6a65', padding: '12px 20px', color: '#e8f2f0', fontFamily: 'inherit', fontSize: '0.9rem', cursor: 'pointer', letterSpacing: '1px' }}>↻ RESET</button>
            <button onClick={() => goToTestPuzzle('next')} style={{ background: '#5a7a75', border: '2px solid #5a7a75', padding: '12px 20px', color: '#e8f2f0', fontFamily: 'inherit', fontSize: '0.9rem', cursor: 'pointer', letterSpacing: '1px' }}>NEXT →</button>
            <button style={{ background: '#2d4a47', border: '2px solid #2d4a47', padding: '12px 30px', color: '#e8f2f0', fontFamily: 'inherit', fontSize: '1.105rem', cursor: 'pointer', letterSpacing: '2px' }}>♥ DONATE</button>
          </div>

          {testPuzzleIndex !== null && (
            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.8rem', color: '#5a7a75' }}>
              Testing: Puzzle {testPuzzleIndex + 1}/{totalPuzzles}
            </div>
          )}

          <div style={{ marginTop: '30px', textAlign: 'center', color: '#a3c4be', fontSize: '0.715rem' }}>by vldtz x claude</div>
        </footer>
      </div>
    </div>
  );
}
