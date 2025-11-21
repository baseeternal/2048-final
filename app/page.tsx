'use client';

import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

const GRID_SIZE = 4;

// SIMPLE COLOR FUNCTION - This will definitely work
const getTileColor = (value: number) => {
  switch (value) {
    case 0: return { background: 'rgba(238, 228, 218, 0.35)', color: '#776e65' };
    case 2: return { background: '#eee4da', color: '#776e65' };
    case 4: return { background: '#ede0c8', color: '#776e65' };
    case 8: return { background: '#f2b179', color: '#f9f6f2' };
    case 16: return { background: '#f59563', color: '#f9f6f2' };
    case 32: return { background: '#f67c5f', color: '#f9f6f2' };
    case 64: return { background: '#f65e3b', color: '#f9f6f2' };
    case 128: return { background: '#edcf72', color: '#f9f6f2' };
    case 256: return { background: '#edcc61', color: '#f9f6f2' };
    case 512: return { background: '#edc850', color: '#f9f6f2' };
    case 1024: return { background: '#edc53f', color: '#f9f6f2' };
    case 2048: return { background: 'linear-gradient(135deg, #edc22e, #f2b179)', color: '#f9f6f2' };
    default: return { background: '#3c3a32', color: '#f9f6f2' };
  }
};

export default function Game2048() {
  const [board, setBoard] = useState<number[]>(Array(GRID_SIZE * GRID_SIZE).fill(0));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const savedBest = localStorage.getItem('2048-best-score');
    if (savedBest) setBestScore(parseInt(savedBest));
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
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });

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
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#776e65', margin: 0 }}>2048</h1>
            <p style={{ color: '#776e65', fontSize: '14px', margin: 0 }}>Join the numbers and get to the 2048 tile!</p>
          </div>
        </div>

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

        <div 
          style={{
            background: '#bbada0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            position: 'relative'
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
              const colorStyle = getTileColor(value);
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
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#776e65', fontSize: '14px' }}>
          <p>Use arrow keys or swipe to move the tiles</p>
          <p style={{ marginTop: '4px' }}>Press R to restart • Built on Base</p>
        </div>
      </div>
    </div>
  );
}