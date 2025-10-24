'use client';

import { useSession, signIn, getSession } from 'next-auth/react';
import { useState } from 'react';

export default function ConnectorsPage() {
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<{ gmail: number; drive: number; docs: number } | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>(['gmail', 'drive', 'docs']);

  const handleConnectGoogle = async () => {
    // Trigger Google OAuth sign-in with additional scopes
    await signIn('google');
  };

  const handleSync = async () => {
    if (!session?.user?.id) {
      alert('Please sign in first');
      return;
    }

    setSyncing(true);
    setSyncStats(null);

    try {
      // Get fresh session with JWT token
      const currentSession = await getSession() as any;
      const backendToken = currentSession?.backendToken;

      if (!backendToken) {
        alert('Authentication token missing. Please sign out and sign in again.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/connect/google/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${backendToken}`,
        },
        body: JSON.stringify({
          sources: selectedSources,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sync failed:', errorText);
        throw new Error('Sync failed');
      }

      const data = await response.json();
      setSyncStats(data.stats);
      alert(`Sync complete! Gmail: ${data.stats.gmail}, Drive: ${data.stats.drive}, Docs: ${data.stats.docs}`);
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync Google data. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Connected Sources</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Connect your Google accounts to search across Gmail, Drive, and Docs
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Google Account</h2>
          
          {session?.user?.email ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {session.user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{session.user.name || 'User'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{session.user.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select Sources to Sync</h3>
                <div className="space-y-2">
                  {['gmail', 'drive', 'docs'].map(source => (
                    <label key={source} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(source)}
                        onChange={() => toggleSource(source)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 dark:text-white capitalize">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSync}
                disabled={syncing || selectedSources.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>

              {syncStats && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Sync Complete!</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-green-700 dark:text-green-300 font-medium">Gmail</p>
                      <p className="text-green-900 dark:text-green-100 text-lg">{syncStats.gmail}</p>
                    </div>
                    <div>
                      <p className="text-green-700 dark:text-green-300 font-medium">Drive</p>
                      <p className="text-green-900 dark:text-green-100 text-lg">{syncStats.drive}</p>
                    </div>
                    <div>
                      <p className="text-green-700 dark:text-green-300 font-medium">Docs</p>
                      <p className="text-green-900 dark:text-green-100 text-lg">{syncStats.docs}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your Google account to get started</p>
              <button
                onClick={handleConnectGoogle}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Connect Google Account
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            After syncing, you can search across all your connected sources using the AI Search feature. 
            Use the filter options to search specific sources (notes, Gmail, Drive).
          </p>
        </div>
      </div>
    </div>
  );
}

