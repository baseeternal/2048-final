'use client';

import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

const GRID_SIZE = 4;
const COLORS: Record<number, string> = {
  0: 'bg-gray-300/20',
  2: 'bg-blue-100 text-gray-800',
  4: 'bg-blue-200 text-gray-800',
  8: 'bg-orange-400 text-white',
  16: 'bg-orange-500 text-white',
  32: 'bg-red-400 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-300 text-gray-800',
  256: 'bg-yellow-400 text-gray-800',
  512: 'bg-yellow-500 text-white',
  1024: 'bg-purple-400 text-white',
  2048: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-5xl font-bold text-gray-800">2048</h1>
            <p className="text-gray-600 text-sm">Join the numbers and get to the 2048 tile!</p>
          </div>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            🏆 Leaderboard
          </button>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="flex gap-4 mb-6">
              <div className="bg-white rounded-lg p-3 shadow-md flex-1 text-center">
                <div className="text-gray-500 text-sm font-medium">SCORE</div>
                <div className="text-2xl font-bold text-gray-800">{score}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-md flex-1 text-center">
                <div className="text-gray-500 text-sm font-medium">BEST</div>
                <div className="text-2xl font-bold text-gray-800">{bestScore}</div>
              </div>
              <button
                onClick={resetGame}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
              >
                New Game
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Your Name for Leaderboard
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
                <button
                  onClick={saveUsername}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            <div 
              className="bg-gray-400 rounded-xl p-4 shadow-2xl relative touch-none"
              {...handlers}
            >
              <div className="grid grid-cols-4 gap-3 bg-gray-400 rounded-lg p-3">
                {board.map((value, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-lg text-xl sm:text-2xl font-bold transition-all duration-150 ${
                      COLORS[value] || 'bg-gray-300'
                    } ${value === 0 ? 'text-transparent' : ''} shadow-inner`}
                  >
                    {value !== 0 ? value : ''}
                  </div>
                ))}
              </div>

              {gameOver && (
                <div className="absolute inset-0 bg-black/80 rounded-xl flex flex-col items-center justify-center">
                  <div className="text-white text-center">
                    <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                    <p className="text-lg mb-4">Final Score: {score}</p>
                    <button
                      onClick={resetGame}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {won && !gameOver && (
                <div className="absolute inset-0 bg-yellow-500/90 rounded-xl flex flex-col items-center justify-center">
                  <div className="text-white text-center">
                    <h2 className="text-3xl font-bold mb-2">You Win! 🎉</h2>
                    <p className="text-lg mb-4">You reached 2048!</p>
                    <button
                      onClick={() => setWon(false)}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Continue Playing
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-gray-600 text-sm">
              <p>Use arrow keys or swipe to move the tiles</p>
              <p className="mt-1">Press R to restart • L for Leaderboard • Built on Base</p>
            </div>
          </div>

          {showLeaderboard && (
            <div className="w-80 bg-white rounded-xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              {leaderboard.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No scores yet!</p>
                  <p className="text-sm mt-2">Play a game to appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' :
                        index === 1 ? 'bg-gray-100 border-2 border-gray-300' :
                        index === 2 ? 'bg-orange-100 border-2 border-orange-300' :
                        'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-400 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-400 text-white' :
                          'bg-blue-400 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {entry.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {entry.score.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Top 10 scores are saved locally</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
