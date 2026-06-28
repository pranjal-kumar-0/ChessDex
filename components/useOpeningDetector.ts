'use client';

import { useState, useEffect, useRef } from 'react';
import type { DetectedOpening } from '../app/api/openings/route';

interface UseOpeningDetectorResult {
  results: DetectedOpening[];
  isLoading: boolean;
  isReady: boolean; 
}

export function useOpeningDetector(fenHistory: string[]): UseOpeningDetectorResult {
  const [results, setResults] = useState<DetectedOpening[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isReady = fenHistory.length > 0;

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      try {
        const res = await fetch('/api/openings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fens: fenHistory }),
          signal: abortRef.current.signal,
        });
        const data = await res.json() as { results: DetectedOpening[] };
        setResults(data.results);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('[useOpeningDetector]', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fenHistory, isReady]);

  return { results: isReady ? results : [], isLoading, isReady };
}
