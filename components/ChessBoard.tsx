'use client';

import { useRef, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from './useChessGame';
import { useOpeningDetector } from './useOpeningDetector';
import MoveHistory from './MoveHistory';
import DetectorPanel from './DetectorPanel';
import LichessContinuations from './LichessContinuations';
import { Opening } from './OpeningSelector';
import { useOpeningGuide } from './useOpeningGuide';
import type { DetectedOpening } from '../app/api/openings/route';

interface ChessBoardProps {
  mode: 'practice' | 'freeplay';
  opening?: Opening; // only in practice mode
  onChangeOpening: () => void;
}

export default function ChessBoard({ mode, opening, onChangeOpening }: ChessBoardProps) {
  const {
    fen,
    moveHistory,
    fenHistory,
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
  } = useChessGame(); // Always start from beginning

  const [guidedOpening, setGuidedOpening] = useState<DetectedOpening | null>(
    mode === 'practice' && opening
      ? { name: opening.name, eco: opening.eco, moves: opening.pgn, movesBack: 0 }
      : null
  );

  const detector = useOpeningDetector(!guidedOpening ? fenHistory : []);

  const { nextExpectedMove, isCompleted } = useOpeningGuide(
    moveHistory,
    guidedOpening,
    () => setGuidedOpening(null) // Devated -> drop out of guided mode
  );

  // Fit board to viewport height
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

  // Arrow keys: undo / redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); undoMove(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); redoMove(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undoMove, redoMove]);

  const topBarLabel = guidedOpening ? 'Guided Mode' : 'Free Play';
  const topBarSub = guidedOpening ? guidedOpening.name : 'live detection';

  return (
    <div className="w-full flex flex-col gap-4" style={{ maxWidth: `${boardSize + 216 + 20}px` }}>
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          id="back-to-openings-btn"
          onClick={onChangeOpening}
          className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
          style={{ background: '#2A1D10', borderColor: '#4A3520', color: '#E1DCC9' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8963C')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#4A3520')}
        >
          Back
        </button>

        <div className="flex items-center gap-2">
          {(opening || guidedOpening) && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opening?.color || '#C8963C' }} />}
          <span className="font-semibold" style={{ color: '#E1DCC9' }}>{topBarLabel}</span>
          <span className="font-mono text-xs" style={{ color: '#8C7B68' }}>{topBarSub}</span>
        </div>

        {inCheck && (
          <span className="ml-auto text-sm font-semibold" style={{ color: '#ef4444' }}>Check!</span>
        )}
        {isGameOver && (
          <span className="ml-auto text-sm font-semibold" style={{ color: '#C8963C' }}>Game over</span>
        )}
      </div>

      {/* Board + sidebar */}
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
                onPieceDrop: onPieceDrop,
                onSquareClick: onSquareClick,
                squareStyles: squareStyles,
                boardStyle: { width: boardSize, height: boardSize },
                darkSquareStyle: { backgroundColor: '#b58863' },
                lightSquareStyle: { backgroundColor: '#f0d9b5' },
                arrows: nextExpectedMove
                  ? [{ startSquare: nextExpectedMove.from, endSquare: nextExpectedMove.to, color: 'rgba(0, 128, 0, 0.8)' }]
                  : [],
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
            height: boardSize + 64,
            background: '#231610',
            borderColor: '#3A2818',
          }}
        >
          {/* Live detector — shown when not guided */}
          {!guidedOpening && (
            <>
              <DetectorPanel
                results={detector.results}
                isLoading={detector.isLoading}
                isReady={detector.isReady}
                totalMoves={moveHistory.length}
                onSelectOpening={setGuidedOpening}
              />
              <div className="mb-4 pb-4 border-b" style={{ borderColor: '#3A2818' }}>
                <LichessContinuations fen={fen} />
              </div>
            </>
          )}

          {guidedOpening && (
            <div className="mb-4 pb-4 border-b" style={{ borderColor: '#3A2818' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#C8963C' }}>
                  Guided Mode
                </span>
                <button
                  onClick={() => setGuidedOpening(null)}
                  className="text-xs hover:underline"
                  style={{ color: '#8C7B68' }}
                >
                  cancel
                </button>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#E1DCC9' }}>
                Follow the green arrows to play the main line of <strong style={{ color: '#C8963C' }}>{guidedOpening.name}</strong>.
              </p>
              {isCompleted && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: '#3A2818' }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: '#4caf50' }}>
                    Opening completed!
                  </p>
                  <LichessContinuations fen={fen} />
                </div>
              )}
            </div>
          )}

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
        style={{ backgroundColor: color === 'w' ? '#E1DCC9' : '#1F150C', borderColor: '#8C7B68' }}
      />
      <span className="text-sm font-medium" style={{ color: '#E1DCC9' }}>{label}</span>
      {isActive && <span className="ml-auto text-xs" style={{ color: '#C8963C' }}>to move</span>}
    </div>
  );
}
