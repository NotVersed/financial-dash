'use client'

import { FormEvent, useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, X } from 'lucide-react'

export default function CreateAdminAccountCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const closeModal = () => {
    setIsOpen(false)
    setEmail('')
    setFullName('')
    setPassword('')
    setError(null)
    setSuccess(null)
    setLoading(false)
  }

  const handleCreateAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/auth/admin-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin account')
      }

      setSuccess(`Admin account created for ${data.email ?? email}.`)
      window.setTimeout(() => {
        closeModal()
      }, 1200)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create admin account'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <UserPlus className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-base">Create New Admin</CardTitle>
                <CardDescription>Add a new administrator account directly to Supabase Auth</CardDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(true)
                setError(null)
                setSuccess(null)
              }}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 w-full md:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              Create Admin Account
            </button>
          </div>
        </CardHeader>
      </Card>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                <UserPlus className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create New Admin</h2>
                <p className="text-sm text-slate-500">Fill in the administrator details below</p>
              </div>
            </div>

            {success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm font-medium text-green-600">✅ {success}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label htmlFor="new-admin-email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="new-admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="new-admin-full-name" className="mb-1 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  id="new-admin-full-name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="new-admin-password" className="mb-1 block text-sm font-medium text-slate-700">
                  Temporary Password <span className="text-red-400">*</span>
                </label>
                <input
                  id="new-admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Must be at least 6 characters with uppercase, lowercase, number, and special character.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
