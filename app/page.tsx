'use client';

import { useRouter } from 'next/navigation';
import OpeningSelector from '../components/OpeningSelector';

export default function Home() {
  const router = useRouter();

  return (
    <OpeningSelector
      onSelect={(opening) => {
        const params = new URLSearchParams({
          name: opening.name,
          eco: opening.eco,
          moves: opening.pgn || opening.description
        });
        router.push(`/live-board?${params.toString()}`);
      }}
      onFreePlay={() => {
        router.push('/live-board');
      }}
    />
  );
}
