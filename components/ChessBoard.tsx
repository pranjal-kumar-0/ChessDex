'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from './useChessGame';
import { useOpeningDetector } from './useOpeningDetector';
import MoveHistory from './MoveHistory';
import DetectorPanel from './DetectorPanel';
import LichessContinuations from './LichessContinuations';
import { Opening } from './OpeningSelector';
import { useOpeningGuide } from './useOpeningGuide';
import type { DetectedOpening } from '../app/api/openings/route';
import type { Square } from 'chess.js';

interface ChessBoardProps {
  mode: 'practice' | 'freeplay';
  opening?: Opening; 
  onChangeOpening: () => void;
}

export default function ChessBoard({ mode, opening, onChangeOpening }: ChessBoardProps) {
  const {
    fen,
    moveHistory,
    squareStyles,
    isGameOver,
    turn,
    inCheck,
    onSquareClick,
    onPieceDrop,
    playMoveUci,
    undoMove,
    redoMove,
  } = useChessGame(); // Always start from beginning

  const [guidedOpening, setGuidedOpening] = useState<DetectedOpening | null>(
    mode === 'practice' && opening
      ? { name: opening.name, eco: opening.eco, moves: opening.pgn, movesBack: 0 }
      : null
  );

  const [hoveredMoveUci, setHoveredMoveUci] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');

  const detectorFens = useMemo(() => (!guidedOpening ? [fen] : []), [guidedOpening, fen]);
  const detector = useOpeningDetector(detectorFens);

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
  const topBarSub = guidedOpening ? guidedOpening.name : '';

  // Compute custom arrows
  const customArrows = nextExpectedMove
    ? [{ startSquare: nextExpectedMove.from, endSquare: nextExpectedMove.to, color: 'rgba(0, 128, 0, 0.8)' }]
    : [];

  if (hoveredMoveUci && hoveredMoveUci.length >= 4) {
    const from = hoveredMoveUci.substring(0, 2) as Square;
    let to = hoveredMoveUci.substring(2, 4) as Square;

    if (from === 'e1' && to === 'h1') to = 'g1';
    if (from === 'e1' && to === 'a1') to = 'c1';
    if (from === 'e8' && to === 'h8') to = 'g8';
    if (from === 'e8' && to === 'a8') to = 'c8';

    customArrows.push({ startSquare: from, endSquare: to, color: 'rgba(0, 128, 255, 0.5)' });
  }

  return (
    <div
      className="w-full flex flex-col gap-4 mx-auto lg:mx-0 lg:max-w-[var(--max-w)]"
      style={{ '--max-w': `${boardSize + 432 + 40}px` } as React.CSSProperties}
    >
      <div className="flex flex-wrap items-center gap-3 w-full">
        <button
          id="back-to-openings-btn"
          onClick={onChangeOpening}
          className="hidden lg:block text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
          style={{ background: '#2A1D10', borderColor: '#4A3520', color: '#E1DCC9' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8963C')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#4A3520')}
        >
          Back
        </button>

        <div className="hidden lg:flex items-center gap-2">
          {(opening || guidedOpening) && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opening?.color || '#C8963C' }} />}
          <span className="font-semibold" style={{ color: '#E1DCC9' }}>{topBarLabel}</span>
          <span className="font-mono text-xs" style={{ color: '#8C7B68' }}>{topBarSub}</span>
        </div>

        <button
          onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')}
          className="lg:ml-auto text-sm font-medium p-2 lg:px-3 lg:py-1.5 rounded-lg border transition-colors flex items-center justify-center gap-2"
          style={{ background: '#2A1D10', borderColor: '#3A2818', color: '#E1DCC9' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8963C')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#3A2818')}
          title="Flip Board"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12" />
            <path d="M15 14v-4" />
            <path d="M15 14l-4-4" />
            <path d="M15 14l4-4" />
            <path d="M7 10l-4 4" />
            <path d="M7 10l4 4" />
            <path d="M3 4h18" />
            <path d="M3 20h18" />
          </svg>
          <span className="hidden lg:inline">Flip Board</span>
        </button>

        {inCheck && (
          <span className="text-sm font-semibold lg:ml-3" style={{ color: '#ef4444' }}>Check!</span>
        )}
        {isGameOver && (
          <span className="text-sm font-semibold lg:ml-3" style={{ color: '#C8963C' }}>Game over</span>
        )}
      </div>

      {/* Board + sidebar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start w-full">
        {/* Board column */}
        <div ref={containerRef} className="flex flex-col gap-2 w-full lg:flex-1 min-w-0 max-w-[560px] lg:max-w-none items-center lg:items-stretch">
          <PlayerRow color={orientation === 'white' ? 'b' : 'w'} turn={turn} />

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
                boardOrientation: orientation,
                arrows: customArrows,
              }}
            />
          </div>

          <PlayerRow color={orientation === 'white' ? 'w' : 'b'} turn={turn} />
        </div>

        {/* Right Sidebar: Openings & Continuations */}
        <div
          className="flex-shrink-0 flex flex-col rounded-xl border p-4 w-full lg:w-[200px] h-auto lg:h-[var(--board-height)] min-h-[250px]"
          style={{
            '--board-height': `${boardSize + 64}px`,
            background: '#231610',
            borderColor: '#3A2818',
          } as React.CSSProperties}
        >
          {/* Live detector — shown when not guided */}
          {!guidedOpening && (
            <>
              <DetectorPanel
                results={detector.results}
                isLoading={detector.isLoading}
                isReady={detector.isReady}
                totalMoves={moveHistory.length}
              />
              <div className="mb-4 pb-4 border-b flex-1 overflow-y-auto" style={{ borderColor: '#3A2818', scrollbarWidth: 'none' }}>
                <LichessContinuations fen={fen} onHoverMove={setHoveredMoveUci} onSelectMove={playMoveUci} />
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
                  <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    <LichessContinuations fen={fen} onHoverMove={setHoveredMoveUci} onSelectMove={playMoveUci} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Far Right Sidebar: Move History */}
        <div
          className="flex-shrink-0 flex flex-col rounded-xl border p-4 w-full lg:w-[200px] h-auto lg:h-[var(--board-height)] min-h-[250px]"
          style={{
            '--board-height': `${boardSize + 64}px`,
            background: '#231610',
            borderColor: '#3A2818',
          } as React.CSSProperties}
        >
          <MoveHistory
            moves={moveHistory}
            turn={turn}
            inCheck={inCheck}
            isGameOver={isGameOver}
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
