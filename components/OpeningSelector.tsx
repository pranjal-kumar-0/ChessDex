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
  onSelect: (opening: Opening, color: 'white' | 'black') => void;
  onFreePlay: () => void;
}

export default function OpeningSelector({ onSelect, onFreePlay }: OpeningSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DetectedOpening[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedForColor, setSelectedForColor] = useState<Opening | null>(null);
  
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
      {selectedForColor ? (
        <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
             <h2 className="text-3xl font-bold mb-2 text-[#E1DCC9] drop-shadow-md">{selectedForColor.name}</h2>
             <p className="text-sm font-mono text-[#8C7B68]">{selectedForColor.description}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full rounded-2xl overflow-hidden border border-[#3A2818] shadow-2xl relative min-h-[300px]">
            {/* VS Badge in the center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#2A1D10] text-[#E1DCC9] w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg border-4 border-[#1F150C] shadow-lg">
               VS
            </div>

            {/* White Side */}
            <button 
              onClick={() => onSelect(selectedForColor, 'white')}
              className="group flex-1 flex flex-col items-center justify-center p-8 bg-[#E1DCC9] hover:bg-[#F3EFE0] transition-all duration-300 relative overflow-hidden border-b sm:border-b-0 sm:border-r border-[#3A2818]"
            >
               <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="w-20 h-20 mb-4 bg-contain bg-no-repeat bg-center drop-shadow-md" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 45 45\'%3E%3Cpath d=\'M22.5 11.63V6M20 8h5\' stroke=\'%23000\' stroke-width=\'1.5\' stroke-linecap=\'round\'/%3E%3Cpath d=\'M22.5 25c0-10.31-7.2-12.75-7.2-12.75b10.45 10.45 0 0 0-4.05-2.25C13.24 9.4 15.68 7 15.68 7s4.11 3.2 10.82 3.2c6.71 0 10.82-3.2 10.82-3.2s2.44 2.4-4.43 3c-1.35.12-2.9.5-4.05 2.25 0 0-7.2 2.44-7.2 12.75z\' fill=\'%23fff\' stroke=\'%23000\' stroke-width=\'1.5\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M11.5 37c5.5 0 16.5 0 22 0M11.5 33c5.5 0 16.5 0 22 0M11.5 37l-1-4M33.5 37l1-4\' stroke=\'%23000\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M12.5 33c-1.5-1.5-3-2.5-3-6 0-3.5 2.5-5 5-5 1.5 0 3 .5 4 1 0 0 1.5 3 4 3 2.5 0 4-3 4-3 1-.5 2.5-1 4-1 2.5 0 5 1.5 5 5 0 3.5-1.5 4.5-3 6\' fill=\'%23fff\' stroke=\'%23000\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")' }} />
               <span className="text-xl font-bold text-[#1F150C] group-hover:scale-105 transition-transform">Play as White</span>
            </button>

            {/* Black Side */}
            <button 
              onClick={() => onSelect(selectedForColor, 'black')}
              className="group flex-1 flex flex-col items-center justify-center p-8 bg-[#2A1D10] hover:bg-[#3A2818] transition-all duration-300 relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="w-20 h-20 mb-4 bg-contain bg-no-repeat bg-center drop-shadow-md" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 45 45\'%3E%3Cpath d=\'M22.5 11.63V6M20 8h5\' stroke=\'%23000\' stroke-width=\'1.5\' stroke-linecap=\'round\'/%3E%3Cpath d=\'M22.5 25c0-10.31-7.2-12.75-7.2-12.75b10.45 10.45 0 0 0-4.05-2.25C13.24 9.4 15.68 7 15.68 7s4.11 3.2 10.82 3.2c6.71 0 10.82-3.2 10.82-3.2s2.44 2.4-4.43 3c-1.35.12-2.9.5-4.05 2.25 0 0-7.2 2.44-7.2 12.75z\' fill=\'%23000\' stroke=\'%23000\' stroke-width=\'1.5\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M11.5 37c5.5 0 16.5 0 22 0M11.5 33c5.5 0 16.5 0 22 0M11.5 37l-1-4M33.5 37l1-4\' stroke=\'%23000\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M12.5 33c-1.5-1.5-3-2.5-3-6 0-3.5 2.5-5 5-5 1.5 0 3 .5 4 1 0 0 1.5 3 4 3 2.5 0 4-3 4-3 1-.5 2.5-1 4-1 2.5 0 5 1.5 5 5 0 3.5-1.5 4.5-3 6\' fill=\'%23000\' stroke=\'%23000\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M12.5 33c-1.5-1.5-3-2.5-3-6 0-3.5 2.5-5 5-5 1.5 0 3 .5 4 1 0 0 1.5 3 4 3 2.5 0 4-3 4-3 1-.5 2.5-1 4-1 2.5 0 5 1.5 5 5 0 3.5-1.5 4.5-3 6\' fill=\'none\' stroke=\'%23fff\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M22.5 25c0-10.31-7.2-12.75-7.2-12.75b10.45 10.45 0 0 0-4.05-2.25C13.24 9.4 15.68 7 15.68 7s4.11 3.2 10.82 3.2c6.71 0 10.82-3.2 10.82-3.2s2.44 2.4-4.43 3c-1.35.12-2.9.5-4.05 2.25 0 0-7.2 2.44-7.2 12.75z\' fill=\'none\' stroke=\'%23fff\' stroke-width=\'1.5\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M11.5 37c5.5 0 16.5 0 22 0M11.5 33c5.5 0 16.5 0 22 0M11.5 37l-1-4M33.5 37l1-4\' stroke=\'%23fff\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M22.5 11.63V6M20 8h5\' stroke=\'%23fff\' stroke-width=\'1.5\' stroke-linecap=\'round\'/%3E%3C/svg%3E")' }} />
               <span className="text-xl font-bold text-[#E1DCC9] group-hover:scale-105 transition-transform">Play as Black</span>
            </button>
          </div>

          <button
            onClick={() => setSelectedForColor(null)}
            className="mt-6 text-sm font-medium hover:underline text-[#8C7B68] hover:text-[#C8963C] mx-auto block transition-colors"
          >
            ← Back to openings
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#E1DCC9' }}>
          Chess Openings
        </h1>
        <p className="text-sm" style={{ color: '#8C7B68' }}>
          Practice a preset or play freely with live opening detection
        </p>
      </div>

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
            Detect the opening and improvise
          </span>
        </div>
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
                  onClick={() => setSelectedForColor({ id: r.name, name: r.name, eco: r.eco, color: '#C8963C', description: r.moves, pgn: r.moves })}
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
                onClick={() => setSelectedForColor(opening)}
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
        </>
      )}
    </div>
  );
}
