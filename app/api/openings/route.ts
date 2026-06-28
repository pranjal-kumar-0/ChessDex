import { NextRequest, NextResponse } from 'next/server';
import { openingBook, findOpening, getPositionBook } from '@chess-openings/eco.json';
import type { OpeningCollection } from '@chess-openings/eco.json';
import type { PositionBook } from '@chess-openings/eco.json';

let bookCache: OpeningCollection | null = null;
let posBookCache: PositionBook | null = null;
let loadingPromise: Promise<void> | null = null;

async function getBook(): Promise<{ book: OpeningCollection; posBook: PositionBook }> {
  if (bookCache && posBookCache) {
    return { book: bookCache, posBook: posBookCache };
  }

  if (!loadingPromise) {
    loadingPromise = openingBook().then((book) => {
      bookCache = book;
      posBookCache = getPositionBook(book);
      loadingPromise = null;
    });
  }

  await loadingPromise;
  return { book: bookCache!, posBook: posBookCache! };
}

export interface DetectedOpening {
  name: string;
  eco: string;
  moves: string;
  movesBack: number; 
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { fens: string[] };
    const { fens } = body;

    if (!Array.isArray(fens) || fens.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const { book, posBook } = await getBook();

    const results: DetectedOpening[] = [];
    const seen = new Set<string>();

    for (let i = fens.length - 1; i >= 0; i--) {
      const fen = fens[i];
      const movesBack = fens.length - 1 - i;

      const found = findOpening(book, fen, posBook);
      if (found && !seen.has(found.name)) {
        seen.add(found.name);
        results.push({
          name: found.name,
          eco: found.eco,
          moves: found.moves,
          movesBack,
        });

        if (results.length >= 4) break;
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('[openings detect]', err);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase();

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const { book } = await getBook();
    const results: DetectedOpening[] = [];

    for (const fen in book) {
      const opening = book[fen];
      if (opening.name.toLowerCase().includes(q)) {
        results.push({
          name: opening.name,
          eco: opening.eco,
          moves: opening.moves,
          movesBack: 0,
        });
        if (results.length >= 20) break;
      }
    }

    results.sort((a, b) => a.moves.length - b.moves.length);

    return NextResponse.json({ results });
  } catch (err) {
    console.error('[openings search]', err);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
