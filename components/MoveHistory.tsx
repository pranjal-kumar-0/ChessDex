'use client';

import { useRef, useEffect } from 'react';
import { MoveRecord } from './useChessGame';

interface MoveHistoryProps {
  moves: MoveRecord[];
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  turn: 'w' | 'b';
  inCheck: boolean;
  isGameOver: boolean;
  canRedo: boolean;
}

export default function MoveHistory({ moves, onUndo, onRedo, onReset, turn, inCheck, isGameOver, canRedo }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  // Group into pairs
  const pairs: { number: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i++) {
    if (moves[i].color === 'w') {
      pairs.push({ number: moves[i].number, white: moves[i].san, black: moves[i + 1]?.san });
      i++;
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8C7B68' }}>
          Moves
        </span>
        <span
          className="text-xs font-medium"
          style={{ color: isGameOver ? '#C8963C' : inCheck ? '#ef4444' : '#8C7B68' }}
        >
          {isGameOver ? 'Game over' : inCheck ? 'Check!' : `${turn === 'w' ? 'White' : 'Black'}`}
        </span>
      </div>

      {/* Move list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 mb-3" style={{ scrollbarWidth: 'none' }}>
        {pairs.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: '#4A3520' }}>
            No moves yet
          </p>
        ) : (
          <table className="w-full">
            <tbody>
              {pairs.map((pair) => (
                <tr key={pair.number}>
                  <td className="py-0.5 pr-2 text-xs w-5" style={{ color: '#4A3520' }}>
                    {pair.number}
                  </td>
                  <td className="py-0.5 pr-2 font-mono text-sm w-1/2" style={{ color: '#E1DCC9' }}>
                    {pair.white ?? ''}
                  </td>
                  <td className="py-0.5 font-mono text-sm w-1/2" style={{ color: '#E1DCC9' }}>
                    {pair.black ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        {/* Undo / Redo row */}
        <div className="flex gap-2">
          <button
            id="undo-move-btn"
            onClick={onUndo}
            disabled={moves.length === 0}
            className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: '#2A1D10', borderColor: '#4A3520', color: '#E1DCC9' }}
            onMouseEnter={e => { if (moves.length > 0) e.currentTarget.style.borderColor = '#C8963C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A3520'; }}
            title="Undo (Left arrow)"
          >
            Undo
          </button>
          <button
            id="redo-move-btn"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: '#2A1D10', borderColor: '#4A3520', color: '#E1DCC9' }}
            onMouseEnter={e => { if (canRedo) e.currentTarget.style.borderColor = '#C8963C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A3520'; }}
            title="Redo (Right arrow)"
          >
            Redo
          </button>
        </div>

        <button
          id="reset-game-btn"
          onClick={onReset}
          className="w-full py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{ background: '#2A1D10', borderColor: '#4A3520', color: '#8C7B68' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E1DCC9'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#8C7B68'; }}
        >
          Reset
        </button>

        {/* Key hint */}
        <p className="text-center text-xs" style={{ color: '#4A3520' }}>
          Arrow keys to undo / redo
        </p>
      </div>
    </div>
  );
}
