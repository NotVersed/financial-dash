'use client'

export function DashboardSkeleton() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-48 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-64 bg-slate-100 rounded" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between mb-4">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-4 bg-slate-200 rounded" />
            </div>
            <div className="h-8 w-20 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-48 bg-slate-100 rounded mb-4" />
            <div className="h-48 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ClientsSkeleton() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-32 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-56 bg-slate-100 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
            <div className="h-3 w-24 bg-slate-100 rounded mb-2" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ClientDetailSkeleton() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-4 w-32 bg-slate-200 rounded mb-6" />
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-slate-200" />
        <div>
          <div className="h-6 w-40 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-56 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
            <div className="h-8 w-20 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
