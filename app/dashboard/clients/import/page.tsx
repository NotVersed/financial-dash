'use client'

import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

type ImportResult = {
  message?: string
  importedCount?: number
  failedCount?: number
  errors?: string[]
  error?: string
}

export default function ImportClientsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

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

      const text = await response.text()
      let data: ImportResult = {}

      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        throw new Error(`Server did not return valid JSON: ${text}`)
      }

      if (!response.ok) {
        setMessage(data.error || 'Import failed.')
        return
      }

      setMessage(data.message || 'Import completed.')
      setResult(data)
    } catch (error: any) {
      console.error('Import error:', error)
      setMessage(error.message || 'Something went wrong while importing the CSV.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <Link
        href="/dashboard/reports"
        className="flex gap-2 text-sm text-slate-500 hover:text-slate-800 m-3"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reports
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Import Clients CSV</h1>
      <p className="text-slate-600 mb-4">
        Upload a CSV file to import client records into the system.
      </p>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4 mb-8 w-full md:w-1/2">
        <div>
          <label htmlFor="csvFile" className="block text-sm font-medium text-slate-700 mb-2 w-1/2">
            CSV File
          </label>
          <input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-1/2 md:w-1/2 text-sm border rounded-lg p-2 text-slate-500 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="border rounded-md p-4 bg-slate-50 text-slate-700">
            <p><strong>Imported:</strong> {result.importedCount ?? 0}</p>
            <p><strong>Failed:</strong> {result.failedCount ?? 0}</p>

            {result.errors && result.errors.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold">Errors:</p>
                <ul className="list-disc ml-6 text-sm text-red-600">
                  {result.errors.map((err, index) => (
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