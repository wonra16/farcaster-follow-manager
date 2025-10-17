import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fid, targetFid } = await request.json();

    if (!fid || !targetFid) {
      return NextResponse.json(
        { error: 'FID and target FID are required' },
        { status: 400 }
      );
    }

    // Unfollow işlemi burada yapılacak
    // Şimdilik basit bir response dönüyoruz
    
    return NextResponse.json({ 
      success: true,
      message: 'Unfollow successful'
    });

  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow' },
      { status: 500 }
    );
  }
}