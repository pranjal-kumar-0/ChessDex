'use client';

import type { DetectedOpening } from '../app/api/openings/route';

interface DetectorPanelProps {
  results: DetectedOpening[];
  isLoading: boolean;
  isReady: boolean;
  totalMoves: number;
}

export default function DetectorPanel({ results, isLoading, isReady, totalMoves }: DetectorPanelProps) {
  const countMoves = (movesStr: string) => {
    return movesStr.split(' ').filter(token => !token.includes('.')).length;
  };

  return (
    <div className="mb-4 pb-4 border-b" style={{ borderColor: '#3A2818' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8C7B68' }}>
          Opening
        </span>
        {isLoading && (
          <span className="text-xs" style={{ color: '#4A3520' }}>detecting...</span>
        )}
      </div>

      {!isReady ? (
        <p className="text-xs" style={{ color: '#4A3520' }}>
          {totalMoves === 0
            ? 'Play a move to start detection'
            : 'Keep playing...'}
        </p>
      ) : results.length === 0 && !isLoading ? (
        <p className="text-xs" style={{ color: '#4A3520' }}>No named opening found</p>
      ) : (
        <div className="flex flex-col gap-2">
          {results.slice(0, 1).map((r) => (
            <div
              key={r.name}
              className="flex flex-col gap-0.5 text-left rounded p-1 -ml-1"
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <span
                  className="text-xs font-medium leading-snug"
                  style={{ color: '#E1DCC9' }}
                >
                  {r.name}
                </span>
                <div className="flex flex-col items-end flex-shrink-0 mt-0.5">
                  <span className="font-mono text-xs" style={{ color: '#4A3520' }}>
                    {r.eco}
                  </span>
                  <span className="text-[10px]" style={{ color: '#8C7B68' }}>
                    {countMoves(r.moves)} moves
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
