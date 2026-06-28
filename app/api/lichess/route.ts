import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fen = searchParams.get('fen');
    
    if (!fen) {
      return NextResponse.json({ error: 'Missing FEN' }, { status: 400 });
    }

    const token = process.env.LICHESS_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'LICHESS_API_TOKEN is not set in environment variables' },
        { status: 500 }
      );
    }

    // We use the player database to get low-elo traps/blunders as requested
    const url = `https://explorer.lichess.org/lichess?fen=${encodeURIComponent(fen)}&speeds=blitz,rapid,classical&ratings=1400,1600,1800,2000`;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Lichess API Error:', res.status, text);
      return NextResponse.json({ error: 'Failed to fetch from Lichess' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      }
    });
  } catch (err) {
    console.error('[lichess proxy error]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
