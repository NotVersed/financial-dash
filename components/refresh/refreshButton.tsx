'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export default function RefreshSnapshotsButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleRefresh() {
  const res = await fetch('/api/server/snapshot-refresh', {
    method: 'POST',
  })

  const data = await res.text()

  if (!res.ok) {
    console.error('Failed to refresh snapshots', data)
    return
  }

  router.refresh()
}

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
      Refresh
    </button>
  )
}