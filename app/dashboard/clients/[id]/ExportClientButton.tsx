'use client'

import { useState } from 'react'

export default function ExportClientButton({ clientId }: { clientId: number }) {
  const [selected, setSelected] = useState<'csv' | 'xlsx' | 'pdf'>('pdf')

  const handleExport = () => {
    window.location.href = `/api/export/client/${clientId}/${selected}`
  }

  return (
    <div className="flex rounded-md overflow-hidden border border-emerald-600">
      <button
        onClick={handleExport}
        className="px-4 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Export
      </button>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as 'csv' | 'xlsx' | 'pdf')}
        className="px-2 py-2 text-sm bg-white text-emerald-700 border-l border-emerald-600 focus:outline-none"
      >
        <option value="pdf">PDF</option>
        <option value="csv">CSV</option>
        <option value="xlsx">XLSX</option>
      </select>
    </div>
  )
}