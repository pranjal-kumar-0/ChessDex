'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ChessBoard from '../../components/ChessBoard';
import type { Opening } from '../../components/OpeningSelector';

function LiveBoardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name = searchParams.get('name');
  const eco = searchParams.get('eco');
  const moves = searchParams.get('moves');

  const opening: Opening | undefined = (name && eco && moves)
    ? { id: name, name, eco, color: '#C8963C', description: moves, pgn: moves }
    : undefined;

  return (
    <ChessBoard
      mode={opening ? 'practice' : 'freeplay'}
      opening={opening}
      onChangeOpening={() => router.push('/')}
    />
  );
}

export default function LiveBoard() {
  return (
    <Suspense fallback={<div className="text-sm" style={{ color: '#8C7B68' }}>Loading board...</div>}>
      <LiveBoardInner />
    </Suspense>
  );
}
