'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

// ============================================================================
// DEGENDLE - Crypto Guessing Game (Client Component)
// Compatible with Next.js 16.1+ and React 19.2+
// Fetches puzzles from serverless API - answer is never exposed to client
// ============================================================================

// Sound effects using Web Audio API
const useSound = () => {
  const playWrongSound = useCallback((wrongCount) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Start higher and go lower with each wrong guess
      const baseFreq = 400 - (wrongCount * 60); // 400, 340, 280, 220, 160
      oscillator.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, audioCtx.currentTime + 0.3);
      
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  const playWinSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Pokecenter-inspired melody: ascending arpeggio with sparkle
      const notes = [
        { freq: 523.25, start: 0, duration: 0.1 },     // C5
        { freq: 659.25, start: 0.1, duration: 0.1 },   // E5
        { freq: 783.99, start: 0.2, duration: 0.1 },   // G5
        { freq: 1046.50, start: 0.3, duration: 0.15 }, // C6
        { freq: 987.77, start: 0.45, duration: 0.1 },  // B5
        { freq: 1046.50, start: 0.55, duration: 0.25 }, // C6 (hold)
        { freq: 1318.51, start: 0.55, duration: 0.25 }, // E6 (harmony)
        { freq: 1567.98, start: 0.7, duration: 0.3 },  // G6 (final sparkle)
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
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

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

// Decorative divider
const divider = '════════════════════════════════════════════════════════════════════════════════';

// Generate stars positioned inside the hint box that rain down
const generateStars = () => {
  const stars = [];
  let id = 0;
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
  return stars;
};

// Generate tears for lose animation
const tears = [
  { id: 1, x: '8%', y: '100%', delay: 0, size: 18 },
  { id: 2, x: '15%', y: '100%', delay: 100, size: 16 },
  { id: 3, x: '22%', y: '100%', delay: 50, size: 20 },
  { id: 4, x: '30%', y: '100%', delay: 150, size: 17 },
  { id: 5, x: '38%', y: '100%', delay: 80, size: 19 },
  { id: 6, x: '45%', y: '100%', delay: 200, size: 16 },
  { id: 7, x: '52%', y: '100%', delay: 30, size: 21 },
  { id: 8, x: '60%', y: '100%', delay: 120, size: 18 },
  { id: 9, x: '68%', y: '100%', delay: 180, size: 17 },
  { id: 10, x: '75%', y: '100%', delay: 60, size: 19 },
  { id: 11, x: '82%', y: '100%', delay: 140, size: 16 },
  { id: 12, x: '90%', y: '100%', delay: 90, size: 18 },
  { id: 13, x: '12%', y: '100%', delay: 250, size: 15 },
  { id: 14, x: '26%', y: '100%', delay: 300, size: 17 },
  { id: 15, x: '35%', y: '100%', delay: 280, size: 16 },
  { id: 16, x: '48%', y: '100%', delay: 350, size: 18 },
  { id: 17, x: '58%', y: '100%', delay: 320, size: 15 },
  { id: 18, x: '72%', y: '100%', delay: 380, size: 17 },
  { id: 19, x: '85%', y: '100%', delay: 340, size: 16 },
  { id: 20, x: '18%', y: '100%', delay: 450, size: 14 },
  { id: 21, x: '42%', y: '100%', delay: 500, size: 16 },
  { id: 22, x: '65%', y: '100%', delay: 480, size: 15 },
  { id: 23, x: '78%', y: '100%', delay: 520, size: 14 },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Degendle() {
  // Puzzle state (fetched from API)
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
  
  // Sound effects
  const { playWrongSound, playWinSound } = useSound();
  
  // Test mode state
  const [testPuzzleIndex, setTestPuzzleIndex] = useState(null);
  const totalPuzzles = 48; // Total number of puzzles

  // Test functions
  const resetPuzzle = () => {
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setShowStars(false);
    setShowTears(false);
    setAnswer(null);
    setImageHint(null);
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
    
    // Fetch the specific puzzle
    try {
      const res = await fetch(`/api/puzzle?testIndex=${newIndex}`);
      if (res.ok) {
        const data = await res.json();
        setPuzzle(data);
        resetPuzzle();
      }
    } catch (err) {
      console.error('Failed to fetch test puzzle');
    }
  };
  
  // Memoize stars to prevent regeneration on re-renders
  const stars = useMemo(() => generateStars(), []);

  const maxGuesses = 5;

  // Fetch today's puzzle on mount
  useEffect(() => {
    async function fetchPuzzle() {
      try {
        const res = await fetch('/api/puzzle');
        if (!res.ok) throw new Error('Failed to fetch puzzle');
        const data = await res.json();
        setPuzzle(data);
      } catch (err) {
        setError('Failed to load puzzle. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    fetchPuzzle();
  }, []);

  // Load saved game state from localStorage
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
      } catch (e) {
        // Ignore invalid saved state
      }
    }
  }, [puzzle]);

  // Save game state to localStorage
  const saveGameState = useCallback((newGuesses, newGameState, newAnswer = null, newImageHint = null) => {
    if (!puzzle) return;
    localStorage.setItem(`degendle-${puzzle.dayNumber}`, JSON.stringify({
      guesses: newGuesses,
      gameState: newGameState,
      answer: newAnswer,
      imageHint: newImageHint,
    }));
  }, [puzzle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // Show image hint after 3 wrong guesses
      if (result.imageHint) {
        setImageHint(result.imageHint);
      }

      // Calculate wrong count for sound
      const wrongCount = newGuesses.filter(g => g.feedback.type === 'wrong').length;

      if (result.correct) {
        setGameState('won');
        setAnswer(result.answer);
        setShowStars(true);
        playWinSound();
        // Always show image hint on win
        if (result.imageHint) {
          setImageHint(result.imageHint);
        }
        saveGameState(newGuesses, 'won', result.answer, result.imageHint || imageHint);
      } else if (result.gameOver) {
        setGameState('lost');
        setAnswer(result.answer);
        setShowTears(true);
        playWrongSound(wrongCount);
        saveGameState(newGuesses, 'lost', result.answer, imageHint || result.imageHint);
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

  // Dynamic background color based on game state and wrong guesses
  const getBackgroundColor = () => {
    if (gameState === 'won') return '#d0e0cd';
    const wrongCount = guesses.filter(g => g.feedback.type === 'wrong').length;
    // Interpolate from mint (#cde0dc) to red (#e0cdd1) based on wrong guesses
    const colors = [
      '#cde0dc', // 0 wrong - mint
      '#d4ddd8', // 1 wrong
      '#d9d8d4', // 2 wrong
      '#ddd4d0', // 3 wrong
      '#e0d0cc', // 4 wrong
      '#e0cdd1', // 5 wrong - red/pink
    ];
    return colors[Math.min(wrongCount, 5)];
  };

  // Dynamic hint box background
  const getHintBoxBackground = () => {
    if (gameState === 'won') return '#e8f0e6';
    const wrongCount = guesses.filter(g => g.feedback.type === 'wrong').length;
    const colors = [
      '#e8f2f0', // 0 wrong
      '#eaefed', // 1 wrong
      '#ecebe9', // 2 wrong
      '#eee8e6', // 3 wrong
      '#f0e5e4', // 4 wrong
      '#f0e8ea', // 5 wrong
    ];
    return colors[Math.min(wrongCount, 5)];
  };

  // Dynamic border color
  const getBorderColor = () => {
    if (gameState === 'won') return '#2d4a47';
    const wrongCount = guesses.filter(g => g.feedback.type === 'wrong').length;
    const colors = [
      '#2d4a47', // 0 wrong - teal
      '#3a4443', // 1 wrong
      '#433d3f', // 2 wrong
      '#47373a', // 3 wrong
      '#4a3236', // 4 wrong
      '#4a2d35', // 5 wrong - burgundy
    ];
    return colors[Math.min(wrongCount, 5)];
  };
  
  // Dynamic text color
  const getTextColor = () => getBorderColor();

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#cde0dc',
        fontFamily: '"Courier New", Courier, monospace',
        color: '#1f3533',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <pre style={{ fontSize: '0.5rem', marginBottom: '20px' }}>{asciiTitle}</pre>
          <div>Loading puzzle...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !puzzle) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#e0cdd1',
        fontFamily: '"Courier New", Courier, monospace',
        color: '#4a2d35',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
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
      fontFamily: '"Courier New", Courier, monospace',
      color: '#1f3533',
      padding: '20px',
      lineHeight: 1.4,
      transition: 'background 0.5s ease',
      overflow: 'hidden',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes starBurst {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0);
          }
          15% {
            opacity: 1;
            transform: translateY(-40px) scale(1.2);
          }
          30% {
            opacity: 1;
            transform: translateY(-50px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(calc(100vh - 100px)) scale(0.5);
          }
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

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* ASCII Title */}
        <pre style={{
          fontSize: '0.7rem',
          lineHeight: 1.1,
          margin: '20px 0',
          overflow: 'hidden',
          color: '#2d4a47',
          fontWeight: 'bold',
        }}>
          {asciiTitle}
        </pre>

        {/* Divider */}
        <div style={{ fontSize: '0.91rem', color: '#8aa8a3', marginBottom: '30px' }}>
          {divider}
        </div>

        {/* Puzzle Section */}
        <div style={{ marginBottom: '30px' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '0.91rem',
            color: '#5a7a75',
            marginBottom: '15px',
          }}>
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
            {/* Hint Text - displayed as styled text for longer hints */}
            <div style={{
              fontSize: '1.4rem',
              textAlign: 'center',
              fontWeight: 'bold',
              color: getTextColor(),
              transition: 'color 0.5s ease',
              lineHeight: 1.6,
              padding: '20px 0',
            }}>
              "{puzzle.hint}"
            </div>
            
            {/* Image Hint - shows after 3 wrong guesses */}
            {imageHint && (
              <div style={{
                marginTop: '20px',
                textAlign: 'center',
                animation: 'fadeSlideIn 0.3s ease-out forwards',
              }}>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#5a7a75', 
                  marginBottom: '10px',
                  fontStyle: 'italic',
                }}>
                  ( H | I | N | T ) #2
                </div>
                <div style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '8px',
                  border: `2px solid ${getBorderColor()}`,
                  overflow: 'hidden',
                  margin: '0 auto',
                  backgroundColor: '#ddd',
                }}>
                  <img 
                    src={imageHint} 
                    alt="Visual hint"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}
            
            {/* Answer (shown on win) */}
            {gameState === 'won' && answer && (
              <>
                <div style={{ borderBottom: '2px solid #2d4a47', margin: '20px 0', width: '100%' }} />
                <div style={{ fontSize: '1.56rem', fontWeight: 'bold', textAlign: 'center', color: '#1f3533' }}>
                  {answer}
                </div>
              </>
            )}

            {/* Answer (shown on lose) */}
            {gameState === 'lost' && answer && (
              <>
                <div style={{ borderBottom: '2px solid #4a2d35', margin: '20px 0', width: '100%' }} />
                <div style={{ fontSize: '1.56rem', fontWeight: 'bold', textAlign: 'center', color: '#4a2d35' }}>
                  {answer}
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
                  top: tear.y,
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

          {/* Attempts Remaining */}
          <div style={{ fontSize: '0.845rem', color: '#5a7a75', textAlign: 'right' }}>
            attempts remaining: {maxGuesses - guesses.length}/5
          </div>
        </div>

        {/* Divider */}
        <div style={{ fontSize: '0.91rem', color: '#a3c4be', marginBottom: '20px' }}>
          {divider}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            color: '#8b4444', 
            fontSize: '0.975rem', 
            marginBottom: '15px',
            padding: '10px',
            background: '#f0e0e0',
            border: '1px solid #d4a4a4',
          }}>
            {error}
          </div>
        )}

        {/* Guesses List */}
        <div style={{ marginBottom: '20px' }}>
          {guesses.map((guess, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px dotted #8aa8a3',
              fontSize: '1.105rem',
            }}>
              <span style={{ color: '#2d4a47' }}>
                {String(i + 1).padStart(2, '0')}. {guess.text.toLowerCase()}
              </span>
              <span style={{ 
                color: guess.feedback.type === 'correct' ? '#1a5a50' : '#5a7a75',
                fontWeight: guess.feedback.type === 'correct' ? 'bold' : 'normal',
              }}>
                {guess.feedback.message}
              </span>
            </div>
          ))}
          
          {/* Empty Slots */}
          {gameState === 'playing' && Array.from({ length: maxGuesses - guesses.length }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px dotted #a3c4be',
              fontSize: '1.105rem',
              color: '#a3c4be',
            }}>
              <span>{String(guesses.length + i + 1).padStart(2, '0')}. _________________</span>
              <span>○</span>
            </div>
          ))}
        </div>

        {/* Input Form */}
        {gameState === 'playing' && (
          <div style={{ marginTop: '30px' }}>
            <div style={{ fontSize: '0.845rem', color: '#5a7a75', marginBottom: '8px' }}>
              {'>'} enter guess:
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
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
                  WebkitUserSelect: 'text',
                }}
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#2d4a47',
                  border: 'none',
                  padding: '10px 25px',
                  color: '#e8f2f0',
                  fontFamily: 'inherit',
                  fontSize: '1.04rem',
                  cursor: submitting ? 'wait' : 'pointer',
                  letterSpacing: '2px',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? '...' : 'SUBMIT'}
              </button>
            </form>
          </div>
        )}

        {/* Win Message */}
        {gameState === 'won' && (
          <div style={{ marginTop: '20px', fontSize: '0.975rem', color: '#4a6a65', textAlign: 'center' }}>
            solved in {guesses.length} attempt{guesses.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Lose Message */}
        {gameState === 'lost' && (
          <div style={{ marginTop: '20px', fontSize: '0.975rem', color: '#6a4a52', textAlign: 'center' }}>
            better luck next time
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop: '60px', paddingTop: '20px', fontSize: '0.78rem', color: '#8aa8a3' }}>
          {divider}
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            new puzzle daily @ 00:00 UTC
          </div>
          
          {/* Social Links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '25px', fontSize: '1.04rem' }}>
            <a href="https://x.com/degendle" target="_blank" rel="noopener noreferrer" style={{ color: '#2d4a47', textDecoration: 'none' }}>
              [ X ]
            </a>
          </div>

          {/* Test Buttons + Donate */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '25px', flexWrap: 'wrap' }}>
            <button
              onClick={() => goToTestPuzzle('prev')}
              style={{
                background: '#5a7a75',
                border: '2px solid #5a7a75',
                padding: '12px 20px',
                color: '#e8f2f0',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              ← PREV
            </button>
            <button
              onClick={resetPuzzle}
              style={{
                background: '#8a6a65',
                border: '2px solid #8a6a65',
                padding: '12px 20px',
                color: '#e8f2f0',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              ↻ RESET
            </button>
            <button
              onClick={() => goToTestPuzzle('next')}
              style={{
                background: '#5a7a75',
                border: '2px solid #5a7a75',
                padding: '12px 20px',
                color: '#e8f2f0',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              NEXT →
            </button>
            <button
              style={{
                background: '#2d4a47',
                border: '2px solid #2d4a47',
                padding: '12px 30px',
                color: '#e8f2f0',
                fontFamily: 'inherit',
                fontSize: '1.105rem',
                cursor: 'pointer',
                letterSpacing: '2px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#2d4a47';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2d4a47';
                e.currentTarget.style.color = '#e8f2f0';
              }}
            >
              ♥ DONATE
            </button>
          </div>

          {/* Test Info */}
          {testPuzzleIndex !== null && (
            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.8rem', color: '#5a7a75' }}>
              Testing: Puzzle {testPuzzleIndex + 1}/{totalPuzzles}
            </div>
          )}

          {/* Credits */}
          <div style={{ marginTop: '30px', textAlign: 'center', color: '#a3c4be', fontSize: '0.715rem' }}>
            by vldtz x claude
          </div>
        </footer>
      </div>
    </div>
  );
}
