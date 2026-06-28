'use client';

import { useState } from 'react';
import OpeningSelector, { Opening } from '../../components/OpeningSelector';
import ChessBoard from '../../components/ChessBoard';

export default function AppShell() {
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#1F150C' }}>
      <header
        className="flex items-center gap-3 px-8 py-5 border-b"
        style={{ borderColor: '#3A2818' }}
      >
        <span className="text-2xl">♟</span>
        <span className="font-semibold tracking-tight" style={{ color: '#E1DCC9' }}>
          Chess Openings
        </span>
      </header>

      <main className="flex-1 flex justify-center px-6 py-10">
        {selectedOpening ? (
          <ChessBoard
            opening={selectedOpening}
            onChangeOpening={() => setSelectedOpening(null)}
          />
        ) : (
          <OpeningSelector onSelect={setSelectedOpening} />
        )}
      </main>
    </div>
  );
}
