'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const ctx = await sdk.context;
        setContext(ctx);
        setIsSDKLoaded(true);
        sdk.actions.ready();
      } catch (err) {
        console.error('SDK load error:', err);
        setIsSDKLoaded(true); // Yine de devam et
      }
    };
    load();
  }, []);

  const loadData = async () => {
    if (!context?.user?.fid) {
      setError('User FID not found');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid: context.user.fid })
      });
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (targetFid: number) => {
    try {
      await fetch('/api/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fid: context.user.fid,
          targetFid 
        })
      });
      loadData();
    } catch (err) {
      console.error('Unfollow error:', err);
    }
  };

  if (!isSDKLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading SDK...</div>
      </div>
    );
  }

  const user = context?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          {user?.pfpUrl && (
            <img 
              src={user.pfpUrl} 
              alt={user.username}
              className="w-20 h-20 rounded-full mx-auto mb-3 ring-4 ring-purple-500/50"
            />
          )}
          <h1 className="text-2xl font-bold text-white">
            {user?.displayName || user?.username || 'Welcome'}
          </h1>
          <p className="text-purple-300 text-sm">
            {user?.fid ? `FID: ${user.fid}` : 'Loading...'}
          </p>
        </div>

        {!data && !loading && (
          <button
            onClick={loadData}
            disabled={!user?.fid}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg disabled:opacity-50"
          >
            🚀 Analyze My Network
          </button>
        )}

        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center border border-white/20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
            <p className="text-white">Analyzing...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 mb-4">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="text-purple-300 text-xs mb-1">Followers</div>
                <div className="text-2xl font-bold text-white">{data.followerCount}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="text-purple-300 text-xs mb-1">Following</div>
                <div className="text-2xl font-bold text-white">{data.followingCount}</div>
              </div>
            </div>

            {data.notFollowingBack?.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <h2 className="text-lg font-bold text-white mb-3">Not Following Back</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.notFollowingBack.slice(0, 20).map((user: any) => (
                    <div key={user.fid} className="bg-purple-900/30 rounded-lg p-3 flex items-center gap-3">
                      <img 
                        src={user.pfp_url} 
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                          {user.display_name || user.username}
                        </div>
                        <div className="text-purple-300 text-sm">@{user.username}</div>
                      </div>
                      <button
                        onClick={() => handleUnfollow(user.fid)}
                        className="bg-red-500/20 text-red-300 px-3 py-1 rounded text-sm"
                      >
                        Unfollow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={loadData}
              className="w-full bg-purple-500/20 text-white py-3 rounded-xl font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}