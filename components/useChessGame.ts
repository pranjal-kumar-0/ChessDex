'use client';

import { useRef, useState, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js'; 
import type { SquareHandlerArgs, PieceDropHandlerArgs } from 'react-chessboard';

let moveSound: HTMLAudioElement | null = null;
let captureSound: HTMLAudioElement | null = null;
let checkSound: HTMLAudioElement | null = null;

const playSound = (game: Chess, move: Move) => {
  if (typeof window === 'undefined') return;
  
  if (!moveSound) moveSound = new Audio('/move.mp3');
  if (!captureSound) captureSound = new Audio('/capture.mp3');
  if (!checkSound) checkSound = new Audio('/check.mp3');

  if (game.inCheck() || game.isGameOver()) {
    checkSound.currentTime = 0;
    checkSound.play().catch(() => {});
  } else if (move.captured) {
    captureSound.currentTime = 0;
    captureSound.play().catch(() => {});
  } else {
    moveSound.currentTime = 0;
    moveSound.play().catch(() => {});
  }
};

export interface MoveRecord {
  san: string;
  from: Square; 
  to: Square;  
  color: 'w' | 'b';
  number: number;
}

interface RedoEntry {
  from: Square; 
  to: Square;   
  promotion?: string;
}

export function useChessGame(initialPgn?: string) {
  const makeInitialChess = () => {
    const c = new Chess();
    if (initialPgn) {
      try { c.loadPgn(initialPgn); } catch { /* invalid pgn */ }
    }
    return c;
  };

  const [initialState] = useState(() => {
    const c = makeInitialChess();
    return {
      chess: c,
      fen: c.fen(),
      isGameOver: c.isGameOver(),
      turn: c.turn() as 'w' | 'b',
      inCheck: c.inCheck()
    };
  });

  const chessRef = useRef<Chess>(initialState.chess);
  const redoStack = useRef<RedoEntry[]>([]);

  const [fen, setFen] = useState(initialState.fen);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [fenHistory, setFenHistory] = useState<string[]>([]);
  const [canRedo, setCanRedo] = useState(false);
  const [isGameOver, setIsGameOver] = useState(initialState.isGameOver);
  const [turn, setTurn] = useState<'w' | 'b'>(initialState.turn);
  const [inCheck, setInCheck] = useState(initialState.inCheck);
  
  const [moveFrom, setMoveFrom] = useState<Square | ''>(''); 
  
  const [optionSquares, setOptionSquares] = useState<Record<Square, React.CSSProperties>>({} as Record<Square, React.CSSProperties>);
  const [lastMoveSquares, setLastMoveSquares] = useState<Record<Square, React.CSSProperties>>({} as Record<Square, React.CSSProperties>);

  const syncState = useCallback(() => {
    const game = chessRef.current;
    setFen(game.fen());
    setIsGameOver(game.isGameOver());
    setTurn(game.turn() as 'w' | 'b');
    setInCheck(game.inCheck());
    setCanRedo(redoStack.current.length > 0);

    const history = game.history({ verbose: true });
    const records: MoveRecord[] = history.map((move, i) => ({
      san: move.san,
      from: move.from as Square,
      to: move.to as Square,
      color: move.color as 'w' | 'b',
      number: Math.floor(i / 2) + 1,
    }));
    setMoveHistory(records);
    setFenHistory(history.map((m) => m.after));

    if (history.length > 0) {
      const last = history[history.length - 1];
      setLastMoveSquares({
        [last.from]: { backgroundColor: 'rgba(255, 210, 50, 0.55)' },
        [last.to]: { backgroundColor: 'rgba(255, 210, 50, 0.75)' },
      } as Record<Square, React.CSSProperties>);
    } else {
      setLastMoveSquares({} as Record<Square, React.CSSProperties>);
    }
  }, []);

  // 3. Fixed: Changed parameter type from string to Square
  const getMoveOptions = useCallback((square: Square) => {
    const game = chessRef.current;
    const moves = game.moves({ square: square, verbose: true });

    if (moves.length === 0) {
      setOptionSquares({} as Record<Square, React.CSSProperties>);
      return false;
    }

    const newSquares = {} as Record<Square, React.CSSProperties>;
    for (const move of moves) {
      const targetPiece = game.get(move.to);
      const sourcePiece = game.get(square);
      const isCapture = targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color;
      newSquares[move.to] = isCapture
        ? {
            boxShadow: 'inset 0 0 0 4px rgba(255, 100, 50, 0.85)',
          }
        : {
            background: 'radial-gradient(circle, rgba(255, 210, 50, 0.85) 28%, transparent 28%)',
          };
    }
    newSquares[square] = { backgroundColor: 'rgba(255, 210, 50, 0.6)' };
    setOptionSquares(newSquares);
    return true;
  }, []);

  const clearMoveSelection = useCallback(() => {
    setMoveFrom('');
    setOptionSquares({} as Record<Square, React.CSSProperties>);
  }, []);

  const playMoveUci = useCallback((uci: string) => {
    const game = chessRef.current;
    try {
      const from = uci.substring(0, 2) as Square;
      let to = uci.substring(2, 4) as Square;
      
      // Fix Lichess castling UCI formats (King to Rook) to standard (King to destination)
      const piece = game.get(from);
      if (piece && piece.type === 'k') {
        if (from === 'e1' && to === 'h1') to = 'g1';
        if (from === 'e1' && to === 'a1') to = 'c1';
        if (from === 'e8' && to === 'h8') to = 'g8';
        if (from === 'e8' && to === 'a8') to = 'c8';
      }

      const promotion = uci.length > 4 ? uci[4] : undefined;
      const m = game.move({ from, to, promotion });
      if (m) {
        playSound(game, m);
        redoStack.current = [];
        syncState();
        clearMoveSelection();
      }
    } catch (e) {
      console.error("Invalid move", uci, e);
    }
  }, [syncState, clearMoveSelection]);

  const onSquareClick = useCallback(
    ({ square, piece }: SquareHandlerArgs) => {
      const game = chessRef.current;
      const currentSquare = square as Square; // Cast incoming handler arg to Square

      if (!moveFrom) {
        if (!piece) return;
        const hasMoves = getMoveOptions(currentSquare);
        if (hasMoves) setMoveFrom(currentSquare);
        return;
      }

      const moves = game.moves({
        square: moveFrom,
        verbose: true,
      });
      const found = moves.find((m) => m.from === moveFrom && m.to === currentSquare);

      if (!found) {
        const hasMoves = getMoveOptions(currentSquare);
        setMoveFrom(hasMoves ? currentSquare : '');
        if (!hasMoves) setOptionSquares({} as Record<Square, React.CSSProperties>);
        return;
      }

      try {
        const m = game.move({ from: moveFrom, to: currentSquare, promotion: 'q' });
        if (m) {
          playSound(game, m);
          redoStack.current = [];
          syncState();
        }
      } catch {
      }

      clearMoveSelection();
    },
    [moveFrom, getMoveOptions, syncState, clearMoveSelection]
  );

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!targetSquare) return false;
      const game = chessRef.current;
      try {
        const m = game.move({ from: sourceSquare as Square, to: targetSquare as Square, promotion: 'q' });
        if (m) {
          playSound(game, m);
          redoStack.current = [];
          syncState();
          clearMoveSelection();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [syncState, clearMoveSelection]
  );

  const undoMove = useCallback(() => {
    const game = chessRef.current;
    const undone = game.undo();
    if (undone) {
      redoStack.current.push({ 
        from: undone.from as Square, 
        to: undone.to as Square, 
        promotion: undone.promotion 
      });
    }
    syncState();
    clearMoveSelection();
  }, [syncState, clearMoveSelection]);

  const redoMove = useCallback(() => {
    const entry = redoStack.current.pop();
    if (!entry) return;
    try {
      const m = chessRef.current.move({ from: entry.from, to: entry.to, promotion: entry.promotion ?? 'q' });
      if (m) {
        playSound(chessRef.current, m);
        syncState();
        clearMoveSelection();
      }
    } catch {
      // if somehow invalid, discard
    }
  }, [syncState, clearMoveSelection]);

  const resetGame = useCallback(() => {
    chessRef.current = makeInitialChess();
    redoStack.current = [];
    setFen(chessRef.current.fen());
    setIsGameOver(chessRef.current.isGameOver());
    setTurn(chessRef.current.turn() as 'w' | 'b');
    setInCheck(chessRef.current.inCheck());
    setMoveHistory([]);
    setFenHistory([]);
    setCanRedo(false);
    clearMoveSelection();
    setLastMoveSquares({} as Record<Square, React.CSSProperties>);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearMoveSelection, initialPgn]);

  const squareStyles: Record<Square, React.CSSProperties> = { ...lastMoveSquares, ...optionSquares };

  return {
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
    playMoveUci,
    resetGame,
    undoMove,
    redoMove,
  };
}
