import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: { 'api_key': NEYNAR_API_KEY! }
      });
      
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json();
    
    if (!fid) {
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    // Fetch followers and following
    const [followersRes, followingRes, notifRes] = await Promise.all([
      fetchWithRetry(`https://api.neynar.com/v2/farcaster/followers?fid=${fid}&limit=100`),
      fetchWithRetry(`https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100`),
      fetchWithRetry(`https://api.neynar.com/v2/farcaster/notifications?fid=${fid}&limit=100`)
    ]);

    const followers = new Set(followersRes.users?.map((u: any) => u.fid) || []);
    const following = new Set(followingRes.users?.map((u: any) => u.fid) || []);
    
    // Find who doesn't follow back
    const notFollowingBackFids = Array.from(following).filter(
      (followedFid: any) => !followers.has(followedFid)
    );

    // Fetch details for users who don't follow back
    let notFollowingBack = [];
    if (notFollowingBackFids.length > 0) {
      const detailsRes = await fetchWithRetry(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${notFollowingBackFids.slice(0, 50).join(',')}`
      );
      notFollowingBack = detailsRes.users || [];
    }

    // Process engagement
    const engagementMap = new Map();
    (notifRes.notifications || []).forEach((notif: any) => {
      if (notif.reactions) {
        notif.reactions.forEach((reaction: any) => {
          if (reaction.user) {
            const username = reaction.user.username || `fid:${reaction.user.fid}`;
            const current = engagementMap.get(username) || {
              username,
              fid: reaction.user.fid,
              likes: 0,
              replies: 0,
              recasts: 0,
              pfp: reaction.user.pfp_url || '',
              displayName: reaction.user.display_name || username
            };
            
            if (notif.type === 'likes') current.likes++;
            else if (notif.type === 'replies') current.replies++;
            else if (notif.type === 'recasts') current.recasts++;
            
            engagementMap.set(username, current);
          }
        });
      }
    });

    const topEngagers = Array.from(engagementMap.values())
      .sort((a: any, b: any) => (b.likes + b.replies + b.recasts) - (a.likes + a.replies + a.recasts))
      .slice(0, 10);

    return NextResponse.json({
      followerCount: followers.size,
      followingCount: following.size,
      notFollowingBackCount: notFollowingBackFids.length,
      notFollowingBack,
      topEngagers
    });

  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}