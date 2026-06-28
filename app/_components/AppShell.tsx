'use client';

import { useState } from 'react';
import OpeningSelector, { Opening } from '../../components/OpeningSelector';
import ChessBoard from '../../components/ChessBoard';

type Mode =
  | { type: 'home' }
  | { type: 'practice'; opening: Opening }
  | { type: 'freeplay' };

export default function AppShell() {
  const [mode, setMode] = useState<Mode>({ type: 'home' });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#1F150C' }}>
      <header
        className="flex items-center gap-3 px-8 py-5 border-b"
        style={{ borderColor: '#3A2818' }}
      >
        <button
          onClick={() => setMode({ type: 'home' })}
          className="flex items-center gap-3 cursor-pointer"
        >
          <span className="text-2xl">♟</span>
          <span className="font-semibold tracking-tight" style={{ color: '#E1DCC9' }}>
            Chess Openings
          </span>
        </button>
      </header>

      <main className="flex-1 flex justify-center px-6 py-10">
        {mode.type === 'home' && (
          <OpeningSelector
            onSelect={(opening) => setMode({ type: 'practice', opening })}
            onFreePlay={() => setMode({ type: 'freeplay' })}
          />
        )}
        {mode.type === 'practice' && (
          <ChessBoard
            mode="practice"
            opening={mode.opening}
            onChangeOpening={() => setMode({ type: 'home' })}
          />
        )}
        {mode.type === 'freeplay' && (
          <ChessBoard
            mode="freeplay"
            onChangeOpening={() => setMode({ type: 'home' })}
          />
        )}
      </main>
    </div>
  );
}
