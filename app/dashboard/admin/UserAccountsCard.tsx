'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Search, UserCircle2 } from 'lucide-react'

type UserAccount = {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
  is_active: boolean | null
  created_at: string | null
}

type UserAccountsCardProps = {
  userAccounts: UserAccount[] | null
  hasError: boolean
}

export default function UserAccountsCard({ userAccounts, hasError }: UserAccountsCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [authFilter, setAuthFilter] = useState<'all' | 'authenticated' | 'not-authenticated'>('all')

  const roleOptions = useMemo(() => {
    const roles = new Set<string>()
    userAccounts?.forEach((account) => {
      if (account.role) {
        roles.add(account.role)
      }
    })

    return ['all', ...Array.from(roles).sort((a, b) => a.localeCompare(b))]
  }, [userAccounts])

  const filteredUsers = useMemo(() => {
    if (!userAccounts) {
      return []
    }

    const normalizedSearch = searchQuery.trim().toLowerCase()

    return userAccounts.filter((account) => {
      const displayName = account.full_name?.trim() || ''
      const email = account.email || ''
      const role = account.role || 'user'
      const isAuthenticated = Boolean(account.is_active)

      const matchesSearch =
        normalizedSearch.length === 0 ||
        displayName.toLowerCase().includes(normalizedSearch) ||
        email.toLowerCase().includes(normalizedSearch) ||
        account.id.toLowerCase().includes(normalizedSearch)

      const matchesRole = roleFilter === 'all' || role === roleFilter

      const matchesAuth =
        authFilter === 'all' ||
        (authFilter === 'authenticated' && isAuthenticated) ||
        (authFilter === 'not-authenticated' && !isAuthenticated)

      return matchesSearch && matchesRole && matchesAuth
    })
  }, [authFilter, roleFilter, searchQuery, userAccounts])

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base">User Accounts</CardTitle>
              <CardDescription>Accounts from the users table with role and authentication status</CardDescription>
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
        <CardContent className="space-y-4">
          {hasError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Failed to load user accounts.
            </div>
          ) : !userAccounts || userAccounts.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No user accounts found in the users table.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="md:col-span-1">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Search users</span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Name, email, or ID"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </label>

                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-600">Role</span>
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role === 'all' ? 'All roles' : role}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-600">Authentication</span>
                  <select
                    value={authFilter}
                    onChange={(event) => setAuthFilter(event.target.value as 'all' | 'authenticated' | 'not-authenticated')}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All users</option>
                    <option value="authenticated">Authenticated</option>
                    <option value="not-authenticated">Not authenticated</option>
                  </select>
                </label>
              </div>

              <div className="rounded-lg border border-slate-100">
                <div className="max-h-[420px] space-y-2 overflow-y-auto p-2">
                  {filteredUsers.length === 0 ? (
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                      No users match the current filters.
                    </div>
                  ) : (
                    filteredUsers.map((account) => {
                      const displayName = account.full_name?.trim() || account.email || account.id
                      const role = account.role || 'user'
                      const isAuthenticated = Boolean(account.is_active)

                      return (
                        <div
                          key={account.id}
                          className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 md:flex-row md:items-center"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
                            <p className="truncate text-xs text-slate-500">{account.email || 'No email on file'}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 md:justify-end">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              Role: {role}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                isAuthenticated
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Showing {filteredUsers.length} of {userAccounts.length} users.
              </p>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
