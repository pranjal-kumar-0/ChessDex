'use client';

import { useState } from 'react';

export interface Opening {
  id: string;
  name: string;
  eco: string;
  color: string;
  description: string;
}

export const OPENINGS: Opening[] = [
  { id: 'kings-pawn',    name: "King's Pawn",      eco: 'B00', color: '#C8963C', description: '1. e4 — the most popular first move' },
  { id: 'sicilian',      name: 'Sicilian Defence',  eco: 'B20', color: '#b45309', description: '1. e4 c5 — sharp and combative' },
  { id: 'french',        name: 'French Defence',    eco: 'C00', color: '#7c3aed', description: '1. e4 e6 — solid and counter-punching' },
  { id: 'caro-kann',     name: 'Caro-Kann',         eco: 'B10', color: '#047857', description: '1. e4 c6 — rock-solid' },
  { id: 'ruy-lopez',     name: 'Ruy Lopez',         eco: 'C60', color: '#b91c1c', description: '1. e4 e5 Nf3 Nc6 Bb5 — a classic' },
  { id: 'queens-gambit', name: "Queen's Gambit",    eco: 'D06', color: '#0369a1', description: '1. d4 d5 2. c4 — control the center' },
  { id: 'kings-indian',  name: "King's Indian",     eco: 'E60', color: '#9d174d', description: '1. d4 Nf6 2. c4 g6 — hyper-modern' },
  { id: 'english',       name: 'English Opening',   eco: 'A10', color: '#0f766e', description: '1. c4 — flexible and strategic' },
];

interface OpeningSelectorProps {
  onSelect: (opening: Opening) => void;
}

export default function OpeningSelector({ onSelect }: OpeningSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full max-w-xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#E1DCC9' }}>
          Pick an opening
        </h1>
        <p className="text-base" style={{ color: '#8C7B68' }}>
          Select one to study it on the board
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {OPENINGS.map((opening) => {
          const isHovered = opening.id === hovered;
          return (
            <button
              key={opening.id}
              id={`opening-card-${opening.id}`}
              onClick={() => onSelect(opening)}
              onMouseEnter={() => setHovered(opening.id)}
              onMouseLeave={() => setHovered(null)}
              className="w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-150 cursor-pointer"
              style={{
                background: isHovered ? '#2A1D10' : '#231610',
                borderColor: isHovered ? opening.color + '66' : '#3A2818',
              }}
            >
              {/* Color dot */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: opening.color }}
              />

              {/* Name + description */}
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-base block" style={{ color: '#E1DCC9' }}>
                  {opening.name}
                </span>
                <span className="text-sm block mt-0.5 truncate" style={{ color: '#8C7B68' }}>
                  {opening.description}
                </span>
              </div>

              {/* ECO */}
              <span
                className="font-mono text-xs font-semibold flex-shrink-0"
                style={{ color: '#8C7B68' }}
              >
                {opening.eco}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
