'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus } from 'lucide-react'

export default function CreateAdminAccountCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
      setEmail('')
      setFullName('')
      setPassword('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create admin account'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
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
          <Button
            type="button"
            variant={isOpen ? 'secondary' : 'outline'}
            onClick={() => {
              setIsOpen((prev) => !prev)
              setError(null)
              setSuccess(null)
            }}
            className="w-full md:w-auto"
          >
            {isOpen ? 'Cancel' : 'Create Admin Account'}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-admin-email" className="text-sm font-semibold text-slate-700">
                Admin Email
              </label>
              <Input
                id="new-admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-admin-full-name" className="text-sm font-semibold text-slate-700">
                Full Name (optional)
              </label>
              <Input
                id="new-admin-full-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-admin-password" className="text-sm font-semibold text-slate-700">
                Temporary Password
              </label>
              <Input
                id="new-admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a strong password"
                required
              />
              <p className="text-xs text-slate-500">
                Must be at least 6 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>
            )}

            <Button type="submit" disabled={loading} className="bg-slate-700 text-white hover:bg-slate-800">
              {loading ? 'Creating...' : 'Create Admin'}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  )
}
