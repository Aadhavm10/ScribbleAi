'use client';

export const dynamic = 'force-dynamic';

export default function ConnectorsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Connectors
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Unify your digital workspace by connecting external data sources for seamless AI-powered search
          </p>
        </div>

        {/* What is this page about */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8 mb-8 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                What are Connectors?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Connectors integrate your external data sources (like Gmail, Google Drive, Slack, etc.) into ScribblyAi&apos;s unified search system. 
                Once connected, our AI can search across all your content in one place using hybrid search technology.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Search Everything
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Find information across notes, emails, documents, and files with one query
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Automatic Sync
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your data stays up-to-date with periodic background synchronization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              We&apos;re working on bringing powerful integrations to ScribblyAi. Soon you&apos;ll be able to connect:
            </p>

            {/* Upcoming Connectors Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { name: 'Gmail', icon: '✉️', color: 'from-red-500 to-pink-500' },
                { name: 'Drive', icon: '📂', color: 'from-blue-500 to-cyan-500' },
                { name: 'Slack', icon: '💬', color: 'from-purple-500 to-pink-500' },
                { name: 'Notion', icon: '📝', color: 'from-gray-700 to-gray-900' },
                { name: 'Calendar', icon: '📅', color: 'from-green-500 to-teal-500' },
                { name: 'Docs', icon: '📄', color: 'from-indigo-500 to-blue-500' },
                { name: 'GitHub', icon: '⚡', color: 'from-gray-800 to-gray-900' },
                { name: 'More...', icon: '✨', color: 'from-yellow-500 to-orange-500' },
              ].map((connector) => (
                <div
                  key={connector.name}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="text-3xl mb-2">{connector.icon}</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{connector.name}</p>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                🚀 Stay Tuned
              </h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                These integrations are currently in development as part of our roadmap. 
                Follow our progress on <a href="https://github.com/Aadhavm10/ScribbleAi" target="_blank" rel="noopener noreferrer" className="underline font-medium">GitHub</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Explanation */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure OAuth</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All connections use industry-standard OAuth 2.0. Your credentials are never stored.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Sync</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatic background sync keeps your search index fresh without manual intervention.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unified Search</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Search across all sources with filters, AI-powered relevance, and instant results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

