'use client'

import { useState } from 'react'

export default function ImportClientsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a CSV file first.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      setMessage('')
      setResult(null)

      const response = await fetch('/api/import/clients/csv', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Import failed.')
        return
      }

      setMessage(data.message || 'Import completed.')
      setResult(data)
    } catch (error) {
      setMessage('Something went wrong while importing the CSV.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Import Clients CSV</h1>
      <p className="text-slate-600 mb-6">
        Upload a CSV file to import client records into the system.
      </p>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label htmlFor="csvFile" className="block text-sm font-medium text-slate-700 mb-2">
            CSV File
          </label>
          <input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm border rounded-lg p-2 text-slate-500 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Importing...' : 'Import CSV'}
        </button>

        {message && (
          <div className="text-sm text-slate-700 border rounded-md p-3 bg-slate-50">
            {message}
          </div>
        )}

        {result && (
          <div className="border rounded-md p-4 bg-slate-50">
            <p><strong>Imported:</strong> {result.importedCount}</p>
            <p><strong>Failed:</strong> {result.failedCount}</p>

            {result.errors?.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold">Errors:</p>
                <ul className="list-disc ml-6 text-sm text-red-600">
                  {result.errors.map((err: string, index: number) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}