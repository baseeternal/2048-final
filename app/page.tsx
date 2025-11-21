'use client';

import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

const GRID_SIZE = 4;

const tileColors = {
  0: { background: 'rgba(238, 228, 218, 0.35)', color: '#776e65' },
  2: { background: '#eee4da', color: '#776e65' },
  4: { background: '#ede0c8', color: '#776e65' },
  8: { background: '#f2b179', color: '#f9f6f2' },
  16: { background: '#f59563', color: '#f9f6f2' },
  32: { background: '#f67c5f', color: '#f9f6f2' },
  64: { background: '#f65e3b', color: '#f9f6f2' },
  128: { background: '#edcf72', color: '#f9f6f2' },
  256: { background: '#edcc61', color: '#f9f6f2' },
  512: { background: '#edc850', color: '#f9f6f2' },
  1024: { background: '#edc53f', color: '#f9f6f2' },
  2048: { background: 'linear-gradient(135deg, #edc22e, #f2b179)', color: '#f9f6f2' },
};

type LeaderboardEntry = {
  id: string;
  score: number;
  timestamp: number;
  username: string;
};

export default function Game2048() {
  const [board, setBoard] = useState<number[]>(Array(GRID_SIZE * GRID_SIZE).fill(0));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [username, setUsername] = useState('Player');

  useEffect(() => {
    const savedBest = localStorage.getItem('2048-best-score');
    const savedLeaderboard = localStorage.getItem('2048-leaderboard');
    const savedUsername = localStorage.getItem('2048-username');
    
    if (savedBest) setBestScore(parseInt(savedBest));
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
    if (savedUsername) setUsername(savedUsername);
    
    resetGame();
  }, []);

  const resetGame = () => {
    const newBoard = Array(GRID_SIZE * GRID_SIZE).fill(0);
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const addRandomTile = (grid: number[]) => {
    const emptyCells = grid.map((val, idx) => val === 0 ? idx : -1).filter(idx => idx !== -1);
    if (emptyCells.length === 0) return;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[randomCell] = Math.random() < 0.9 ? 2 : 4;
  };

  const addToLeaderboard = (finalScore: number) => {
    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      score: finalScore,
      timestamp: Date.now(),
      username: username,
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('2048-leaderboard', JSON.stringify(updatedLeaderboard));
  };

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    const newGrid = [...board];
    let moved = false;
    let pointsEarned = 0;

    const processLine = (line: number[]) => {
      let filtered = line.filter(cell => cell !== 0);
      
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          pointsEarned += filtered[i];
          filtered[i + 1] = 0;
          
          if (filtered[i] === 2048 && !won) {
            setWon(true);
          }
        }
      }
      
      filtered = filtered.filter(cell => cell !== 0);
      while (filtered.length < GRID_SIZE) filtered.push(0);
      return filtered;
    };

    if (direction === 'left' || direction === 'right') {
      for (let row = 0; row < GRID_SIZE; row++) {
        const start = row * GRID_SIZE;
        const end = start + GRID_SIZE;
        let line = newGrid.slice(start, end);
        
        if (direction === 'right') line = line.reverse();
        
        const newLine = processLine(line);
        
        if (direction === 'right') newLine.reverse();
        
        for (let col = 0; col < GRID_SIZE; col++) {
          if (newGrid[start + col] !== newLine[col]) moved = true;
          newGrid[start + col] = newLine[col];
        }
      }
    } else {
      for (let col = 0; col < GRID_SIZE; col++) {
        const line = [];
        for (let row = 0; row < GRID_SIZE; row++) {
          line.push(newGrid[row * GRID_SIZE + col]);
        }
        
        let processedLine = direction === 'down' ? [...line].reverse() : line;
        processedLine = processLine(processedLine);
        if (direction === 'down') processedLine.reverse();
        
        for (let row = 0; row < GRID_SIZE; row++) {
          if (newGrid[row * GRID_SIZE + col] !== processedLine[row]) moved = true;
          newGrid[row * GRID_SIZE + col] = processedLine[row];
        }
      }
    }

    if (moved) {
      addRandomTile(newGrid);
      setBoard(newGrid);
      const newScore = score + pointsEarned;
      setScore(newScore);
      
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best-score', newScore.toString());
      }

      if (!canMove(newGrid)) {
        setGameOver(true);
        addToLeaderboard(newScore);
      }
    }
  };

  const canMove = (grid: number[]) => {
    if (grid.some(cell => cell === 0)) return true;

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = grid[i * GRID_SIZE + j];
        if (j < GRID_SIZE - 1 && current === grid[i * GRID_SIZE + j + 1]) return true;
        if (i < GRID_SIZE - 1 && current === grid[(i + 1) * GRID_SIZE + j]) return true;
      }
    }

    return false;
  };

  const saveUsername = () => {
    if (username.trim()) {
      localStorage.setItem('2048-username', username.trim());
      alert('Username saved!');
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => move('left'),
    onSwipedRight: () => move('right'),
    onSwipedUp: () => move('up'),
    onSwipedDown: () => move('down'),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('up');
      else if (e.key === 'ArrowDown') move('down');
      else if (e.key === 'ArrowLeft') move('left');
      else if (e.key === 'ArrowRight') move('right');
      else if (e.key === 'r' || e.key === 'R') resetGame();
      else if (e.key === 'l' || e.key === 'L') setShowLeaderboard(true);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#776e65', margin: 0 }}>2048</h1>
            <p style={{ color: '#776e65', fontSize: '14px', margin: 0 }}>Join the numbers and get to the 2048 tile!</p>
          </div>
          <button
            onClick={() => setShowLeaderboard(true)}
            style={{
              background: '#27ae60',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            🏆 Leaderboard
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', flex: 1, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#776e65', fontSize: '12px', fontWeight: '600' }}>SCORE</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#776e65' }}>{score}</div>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', flex: 1, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#776e65', fontSize: '12px', fontWeight: '600' }}>BEST</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#776e65' }}>{bestScore}</div>
              </div>
              <button
                onClick={resetGame}
                style={{
                  background: '#8f7a66',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                New Game
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ color: '#776e65', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Your Name for Leaderboard</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    flex: 1,
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  maxLength={20}
                />
                <button
                  onClick={saveUsername}
                  style={{
                    background: '#3498db',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </div>

            <div 
              style={{
                background: '#bbada0',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                position: 'relative',
                touchAction: 'none'
              }}
              {...handlers}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                background: '#bbada0',
                borderRadius: '8px',
                padding: '12px'
              }}>
                {board.map((value, index) => {
                  const colorStyle = tileColors[value as keyof typeof tileColors] || tileColors[2048];
                  return (
                    <div
                      key={index}
                      style={{
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        fontSize: value < 100 ? '24px' : value < 1000 ? '20px' : '16px',
                        fontWeight: 'bold',
                        background: colorStyle.background,
                        color: colorStyle.color,
                        transition: 'all 0.15s',
                        boxShadow: value === 0 ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : '0 4px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      {value !== 0 ? value : ''}
                    </div>
                  );
                })}
              </div>

              {gameOver && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.8)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ color: 'white', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Game Over!</h2>
                    <p style={{ fontSize: '18px', marginBottom: '16px' }}>Final Score: {score}</p>
                    <button
                      onClick={resetGame}
                      style={{
                        background: '#8f7a66',
                        color: 'white',
                        padding: '12px 32px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {won && !gameOver && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(237, 194, 46, 0.9)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ color: 'white', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>You Win! 🎉</h2>
                    <p style={{ fontSize: '18px', marginBottom: '16px' }}>You reached 2048!</p>
                    <button
                      onClick={() => setWon(false)}
                      style={{
                        background: '#8f7a66',
                        color: 'white',
                        padding: '12px 32px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Continue Playing
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', color: '#776e65', fontSize: '14px' }}>
              <p>Use arrow keys or swipe to move the tiles</p>
              <p style={{ marginTop: '4px' }}>Press R to restart • L for Leaderboard • Built on Base</p>
            </div>
          </div>

          {showLeaderboard && (
            <div style={{
              width: window.innerWidth < 768 ? '100%' : '300px',
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#776e65', margin: 0 }}>🏆 Leaderboard</h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#776e65'
                  }}
                >
                  ✕
                </button>
              </div>
              
              {leaderboard.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#776e65', padding: '32px 0' }}>
                  <p>No scores yet!</p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>Play a game to appear here</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        borderRadius: '8px',
                        background: index === 0 ? '#fff3cd' : index === 1 ? '#f8f9fa' : index === 2 ? '#ffe5d0' : '#f8f9fa',
                        border: index < 3 ? '2px solid ' + (index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32') : '1px solid #eee'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#3498db',
                          color: 'white'
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#776e65' }}>
                            {entry.username}
                          </div>
                          <div style={{ fontSize: '11px', color: '#999' }}>
                            {formatDate(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#776e65' }}>
                        {entry.score.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
                <p>Top 10 scores are saved locally</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}