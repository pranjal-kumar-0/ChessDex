'use client';

import { useState, useEffect, useRef } from 'react';
import type { DetectedOpening } from '../app/api/openings/route';

export interface Opening {
  id: string;
  name: string;
  eco: string;
  color: string;
  description: string;
  pgn: string; 
}

export const OPENINGS: Opening[] = [
  { id: 'kings-pawn',    name: "King's Pawn",      eco: 'B00', color: '#C8963C', description: '1. e4', pgn: '1. e4' },
  { id: 'sicilian',      name: 'Sicilian Defence',  eco: 'B20', color: '#b45309', description: '1. e4 c5', pgn: '1. e4 c5' },
  { id: 'french',        name: 'French Defence',    eco: 'C00', color: '#7c3aed', description: '1. e4 e6', pgn: '1. e4 e6' },
  { id: 'caro-kann',     name: 'Caro-Kann',         eco: 'B10', color: '#047857', description: '1. e4 c6', pgn: '1. e4 c6' },
  { id: 'ruy-lopez',     name: 'Ruy Lopez',         eco: 'C60', color: '#b91c1c', description: '1. e4 e5 2. Nf3 Nc6 3. Bb5', pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5' },
  { id: 'queens-gambit', name: "Queen's Gambit",    eco: 'D06', color: '#0369a1', description: '1. d4 d5 2. c4', pgn: '1. d4 d5 2. c4' },
  { id: 'kings-indian',  name: "King's Indian",     eco: 'E60', color: '#9d174d', description: '1. d4 Nf6 2. c4 g6', pgn: '1. d4 Nf6 2. c4 g6' },
  { id: 'english',       name: 'English Opening',   eco: 'A10', color: '#0f766e', description: '1. c4', pgn: '1. c4' },
];

interface OpeningSelectorProps {
  onSelect: (opening: Opening) => void;
  onFreePlay: () => void;
}

export default function OpeningSelector({ onSelect, onFreePlay }: OpeningSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DetectedOpening[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setIsSearching(true);
      try {
        const res = await fetch(`/api/openings?q=${encodeURIComponent(query)}`, {
          signal: abortRef.current.signal,
        });
        const data = await res.json() as { results: DetectedOpening[] };
        setSearchResults(data.results);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Search failed:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const countMoves = (movesStr: string) => {
    return movesStr.split(' ').filter(token => !token.includes('.')).length;
  };

  return (
    <div className="w-full max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#E1DCC9' }}>
          Chess Openings
        </h1>
        <p className="text-sm" style={{ color: '#8C7B68' }}>
          Practice a preset or play freely with live opening detection
        </p>
      </div>

      {/* Free play button */}
      <button
        id="free-play-btn"
        onClick={onFreePlay}
        onMouseEnter={() => setHovered('freeplay')}
        onMouseLeave={() => setHovered(null)}
        className="w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border mb-4 transition-all duration-150 cursor-pointer"
        style={{
          background: hovered === 'freeplay' ? '#2A1D10' : '#231610',
          borderColor: hovered === 'freeplay' ? '#C8963C66' : '#3A2818',
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#C8963C' }} />
        <div className="flex-1">
          <span className="font-semibold text-base block" style={{ color: '#E1DCC9' }}>
            Free Play
          </span>
          <span className="text-sm block mt-0.5" style={{ color: '#8C7B68' }}>
            Play freely and detect your opening live
          </span>
        </div>
        <span className="text-xs font-mono flex-shrink-0" style={{ color: '#C8963C' }}>
          detect
        </span>
      </button>

      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search 12,000+ openings (e.g. Najdorf)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-5 py-3.5 rounded-xl border text-sm outline-none transition-colors"
          style={{
            background: '#231610',
            borderColor: '#3A2818',
            color: '#E1DCC9',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#C8963C')}
          onBlur={(e) => (e.target.style.borderColor = '#3A2818')}
        />
        {isSearching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#8C7B68' }}>
            searching...
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: '#3A2818' }} />
        <span className="text-xs" style={{ color: '#4A3520' }}>
          {query.length >= 2 ? 'Search Results' : 'or pick a preset'}
        </span>
        <div className="flex-1 h-px" style={{ background: '#3A2818' }} />
      </div>

      {/* Openings List */}
      <div className="flex flex-col gap-2">
        {query.length >= 2 ? (
          searchResults.length === 0 && !isSearching ? (
            <p className="text-sm text-center py-4" style={{ color: '#8C7B68' }}>No openings found.</p>
          ) : (
            searchResults.map((r, i) => {
              const isHovered = `search-${r.name}` === hovered;
              const movesCount = countMoves(r.moves);
              return (
                <button
                  key={r.name + i}
                  onClick={() => onSelect({ id: r.name, name: r.name, eco: r.eco, color: '#C8963C', description: r.moves, pgn: r.moves })}
                  onMouseEnter={() => setHovered(`search-${r.name}`)}
                  onMouseLeave={() => setHovered(null)}
                  className="w-full text-left flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer"
                  style={{
                    background: isHovered ? '#2A1D10' : '#231610',
                    borderColor: isHovered ? '#C8963C55' : '#3A2818',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm block truncate" style={{ color: '#E1DCC9' }}>
                      {r.name}
                    </span>
                    <span className="text-xs block mt-0.5 truncate font-mono" style={{ color: '#8C7B68' }}>
                      {r.moves}
                    </span>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="font-mono text-xs" style={{ color: '#4A3520' }}>{r.eco}</span>
                    <span className="text-xs" style={{ color: '#8C7B68' }}>{movesCount} {movesCount === 1 ? 'move' : 'moves'}</span>
                  </div>
                </button>
              );
            })
          )
        ) : (
          OPENINGS.map((opening) => {
            const isHovered = opening.id === hovered;
            const movesCount = countMoves(opening.pgn);
            return (
              <button
                key={opening.id}
                id={`opening-card-${opening.id}`}
                onClick={() => onSelect(opening)}
                onMouseEnter={() => setHovered(opening.id)}
                onMouseLeave={() => setHovered(null)}
                className="w-full text-left flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer"
                style={{
                  background: isHovered ? '#2A1D10' : '#231610',
                  borderColor: isHovered ? opening.color + '55' : '#3A2818',
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: opening.color }}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block" style={{ color: '#E1DCC9' }}>
                    {opening.name}
                  </span>
                  <span className="text-xs block mt-0.5 font-mono" style={{ color: '#8C7B68' }}>
                    {opening.description}
                  </span>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="font-mono text-xs" style={{ color: '#4A3520' }}>{opening.eco}</span>
                  <span className="text-xs" style={{ color: '#8C7B68' }}>{movesCount} {movesCount === 1 ? 'move' : 'moves'}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
