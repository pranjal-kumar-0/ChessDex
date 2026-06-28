'use client';

import { useState, useEffect } from 'react';

interface LichessMove {
  uci: string;
  san: string;
  white: number;
  draws: number;
  black: number;
}

interface LichessResponse {
  white: number;
  draws: number;
  black: number;
  moves: LichessMove[];
}

export default function LichessContinuations({ fen, onHoverMove }: { fen: string, onHoverMove?: (uci: string | null) => void }) {
  const [data, setData] = useState<LichessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    
    async function fetchMoves() {
      setIsLoading(true);
      try {
        const url = `/api/lichess?fen=${encodeURIComponent(fen)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch from Lichess');
        const json = await res.json() as LichessResponse;
        if (active) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchMoves();

    return () => {
      active = false;
    };
  }, [fen]);

  if (isLoading) {
    return <div className="text-xs text-center py-2" style={{ color: '#8C7B68' }}>Loading moves...</div>;
  }

  if (!data || data.moves.length === 0) {
    return <div className="text-xs text-center py-2" style={{ color: '#8C7B68' }}>No common moves found</div>;
  }

  const topMoves = data.moves.slice(0, 4);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#C8963C' }}>
        Common Continuations
      </h3>
      {topMoves.map((move) => {
        const total = move.white + move.draws + move.black;
        const wPct = (move.white / total) * 100;
        const dPct = (move.draws / total) * 100;
        const bPct = (move.black / total) * 100;

        return (
          <div
            key={move.san}
            className="flex flex-col gap-1 mb-1 cursor-default p-1 rounded hover:bg-white/5 transition-colors"
            onMouseEnter={() => onHoverMove?.(move.uci)}
            onMouseLeave={() => onHoverMove?.(null)}
          >
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium" style={{ color: '#E1DCC9' }}>{move.san}</span>
              <span className="text-[10px]" style={{ color: '#8C7B68' }}>{total.toLocaleString()} games</span>
            </div>
            {/* Win/Draw/Loss Bar */}
            <div className="h-1.5 w-full flex rounded-full overflow-hidden">
              <div style={{ width: `${wPct}%`, background: '#E1DCC9' }} title={`White wins: ${wPct.toFixed(1)}%`} />
              <div style={{ width: `${dPct}%`, background: '#8C7B68' }} title={`Draws: ${dPct.toFixed(1)}%`} />
              <div style={{ width: `${bPct}%`, background: '#231610' }} title={`Black wins: ${bPct.toFixed(1)}%`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
