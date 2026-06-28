'use client';

import { useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { DetectedOpening } from '../app/api/openings/route';
import type { MoveRecord } from './useChessGame';
import type { Square } from 'chess.js';

interface UseOpeningGuideResult {
  nextExpectedMove: { from: Square; to: Square } | null;
  isCompleted: boolean;
}

export function useOpeningGuide(
  moveHistory: MoveRecord[],
  guidedOpening: DetectedOpening | null,
  onDeviate: () => void
): UseOpeningGuideResult {
  const expectedMoves = useMemo(() => {
    if (!guidedOpening) return [];
    const temp = new Chess();
    try {
      temp.loadPgn(guidedOpening.moves);
      return temp.history({ verbose: true });
    } catch {
      return [];
    }
  }, [guidedOpening]);

  // Compare user history with expected moves
  let isMatching = true;
  for (let i = 0; i < moveHistory.length; i++) {
    if (i >= expectedMoves.length) {
      isMatching = false;
      break;
    }
    if (moveHistory[i].from !== expectedMoves[i].from || moveHistory[i].to !== expectedMoves[i].to) {
      isMatching = false;
      break;
    }
  }

  const isDeviated = guidedOpening !== null && !isMatching;
  
  useEffect(() => {
    if (isDeviated) {
      onDeviate();
    }
  }, [isDeviated, onDeviate]);

  let nextExpectedMove: { from: Square; to: Square } | null = null;
  let isCompleted = false;

  if (guidedOpening && !isDeviated) {
    if (moveHistory.length < expectedMoves.length) {
      const next = expectedMoves[moveHistory.length];
      nextExpectedMove = { from: next.from as Square, to: next.to as Square };
    } else {
      isCompleted = true;
    }
  }

  return { nextExpectedMove, isCompleted };
}
