'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Database } from 'lucide-react'

type TableStatus = {
  table: string
  available: boolean
  count: number
}

type DatabaseTablesCardProps = {
  tableStatuses: TableStatus[]
}

export default function DatabaseTablesCard({ tableStatuses }: DatabaseTablesCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Database Tables</CardTitle>
              <CardDescription>Configured tables for the current schema</CardDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 md:w-auto"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4" />
                Expand
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse
              </>
            )}
          </button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent>
          <div className="space-y-2">
            {tableStatuses.map(({ table, available, count }) => (
              <div key={table} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <div>
                  <span className="text-sm font-mono text-slate-700">{table}</span>
                  <p className="text-xs text-slate-500 mt-1">{count} record{count === 1 ? '' : 's'}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {available ? 'Available' : 'Missing / blocked'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
