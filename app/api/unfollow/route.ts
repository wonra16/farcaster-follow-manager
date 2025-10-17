import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { fid, targetFid } = await request.json();
    
    if (!fid || !targetFid) {
      return NextResponse.json({ error: 'FID and targetFid required' }, { status: 400 });
    }

    // Note: This requires a signer_uuid which needs to be set up separately
    // For now, return a message
    return NextResponse.json({ 
      message: 'Unfollow requires signer setup. See Neynar docs for details.' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Unfollow error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}