export function NoteCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-1/3"></div>
          </div>
        </div>
        <div className="bg-slate-100 rounded-lg p-4 mb-3 h-20"></div>
        <div className="flex gap-2 mb-3">
          <div className="h-5 bg-slate-100 rounded-full w-16"></div>
          <div className="h-5 bg-slate-100 rounded-full w-20"></div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="h-4 bg-slate-100 rounded w-24"></div>
          <div className="h-4 bg-slate-100 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3 mb-3"></div>
        <div className="h-5 bg-slate-100 rounded w-1/4"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notes Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-7 bg-slate-200 rounded w-40 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full animate-pulse">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 p-5 border-b border-slate-200 h-32"></div>
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-8 bg-slate-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotesPageLoadingSkeleton() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div>
            <div className="h-10 bg-slate-200 rounded w-48 mb-2"></div>
            <div className="h-5 bg-slate-100 rounded w-64"></div>
          </div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 animate-pulse">
          <div className="flex-1 h-11 bg-slate-200 rounded-lg"></div>
          <div className="h-11 bg-slate-200 rounded-lg w-40"></div>
        </div>
      </div>

      {/* Notes Grid Skeleton */}
      <div className="h-5 bg-slate-100 rounded w-48 mb-4 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <NoteCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
