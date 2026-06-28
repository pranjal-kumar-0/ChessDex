'use client';

import { useRef, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from './useChessGame';
import MoveHistory from './MoveHistory';
import { Opening } from './OpeningSelector';

interface ChessBoardProps {
  opening: Opening;
  onChangeOpening: () => void;
}

export default function ChessBoard({ opening, onChangeOpening }: ChessBoardProps) {
  const {
    fen,
    moveHistory,
    squareStyles,
    isGameOver,
    turn,
    inCheck,
    canRedo,
    onSquareClick,
    onPieceDrop,
    resetGame,
    undoMove,
    redoMove,
  } = useChessGame();

  // Fit the board to available vertical space
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(460);

  useEffect(() => {
    const calc = () => {
      const available = window.innerHeight - 70 - 80 - 64;
      const maxW = containerRef.current ? containerRef.current.clientWidth : 600;
      setBoardSize(Math.min(available, maxW, 560));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // Arrow key undo/redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); undoMove(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); redoMove(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undoMove, redoMove]);

  return (
    <div className="w-full flex flex-col gap-4" style={{ maxWidth: `${boardSize + 220 + 20}px` }}>
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          id="back-to-openings-btn"
          onClick={onChangeOpening}
          className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
          style={{
            background: '#2A1D10',
            borderColor: '#4A3520',
            color: '#E1DCC9',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8963C')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#4A3520')}
        >
          Back
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opening.color }} />
          <span className="font-semibold" style={{ color: '#E1DCC9' }}>{opening.name}</span>
          <span className="font-mono text-xs" style={{ color: '#8C7B68' }}>{opening.eco}</span>
        </div>

        {inCheck && (
          <span className="ml-auto text-sm font-semibold" style={{ color: '#ef4444' }}>
            Check!
          </span>
        )}
        {isGameOver && (
          <span className="ml-auto text-sm font-semibold" style={{ color: '#C8963C' }}>
            Game over
          </span>
        )}
      </div>

      {/* Board + sidebar row */}
      <div className="flex gap-4 items-start">
        {/* Board column */}
        <div ref={containerRef} className="flex flex-col gap-2 flex-1 min-w-0">
          <PlayerRow color="b" turn={turn} />

          <div
            style={{
              width: boardSize,
              height: boardSize,
              borderRadius: 10,
              overflow: 'hidden',
              outline: inCheck ? '2px solid #ef4444' : '2px solid #3A2818',
              flexShrink: 0,
            }}
          >
            <Chessboard
              options={{
                id: 'opening-study-board',
                position: fen,
                onPieceDrop,
                onSquareClick,
                squareStyles,
                boardStyle: { width: boardSize, height: boardSize },
                darkSquareStyle: { backgroundColor: '#b58863' },
                lightSquareStyle: { backgroundColor: '#f0d9b5' },
              }}
            />
          </div>

          <PlayerRow color="w" turn={turn} />
        </div>

        {/* Sidebar */}
        <div
          className="flex-shrink-0 flex flex-col rounded-xl border p-4"
          style={{
            width: 200,
            height: boardSize + 64, // match board + player rows
            background: '#231610',
            borderColor: '#3A2818',
          }}
        >
          <MoveHistory
            moves={moveHistory}
            onUndo={undoMove}
            onRedo={redoMove}
            onReset={resetGame}
            turn={turn}
            inCheck={inCheck}
            isGameOver={isGameOver}
            canRedo={canRedo}
          />
        </div>
      </div>
    </div>
  );
}

function PlayerRow({ color, turn }: { color: 'w' | 'b'; turn: 'w' | 'b' }) {
  const isActive = turn === color;
  const label = color === 'w' ? 'White' : 'Black';

  return (
    <div className="flex items-center gap-2 px-1">
      <div
        className="w-3.5 h-3.5 rounded-full border"
        style={{
          backgroundColor: color === 'w' ? '#E1DCC9' : '#1F150C',
          borderColor: '#8C7B68',
        }}
      />
      <span className="text-sm font-medium" style={{ color: '#E1DCC9' }}>{label}</span>
      {isActive && (
        <span className="ml-auto text-xs" style={{ color: '#C8963C' }}>
          to move
        </span>
      )}
    </div>
  );
}
