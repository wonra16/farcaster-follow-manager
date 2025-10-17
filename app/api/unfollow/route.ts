import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { fid, targetFid } = await request.json();
    
    if (!fid || !targetFid) {
      return NextResponse.json(
        { error: 'FID and targetFid required' }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Unfollow requires signer setup' 
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}