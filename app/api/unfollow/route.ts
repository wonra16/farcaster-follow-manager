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

// ============================================
// DOSYA 4: app/layout.tsx
// ============================================
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Follow Manager - Farcaster Mini App",
  description: "Manage your Farcaster followers and engagement",
  other: {
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: 'https://i.imgur.com/follow-manager.png',
      button: {
        title: 'Open Follow Manager',
        action: {
          type: 'launch_frame',
          name: 'Follow Manager',
          url: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
          splashImageUrl: 'https://i.imgur.com/splash.png',
          splashBackgroundColor: '#7c3aed'
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}