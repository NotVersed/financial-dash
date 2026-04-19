'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Search, UserCircle2, X } from 'lucide-react'

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
  currentUserId: string
}

export default function UserAccountsCard({ userAccounts, hasError, currentUserId }: UserAccountsCardProps) {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [authFilter, setAuthFilter] = useState<'all' | 'authenticated' | 'not-authenticated'>('all')
  const [roleDrafts, setRoleDrafts] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [loadingAction, setLoadingAction] = useState<{
    userId: string
    action: 'role' | 'status' | 'password' | 'delete'
  } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const [passwordModalUser, setPasswordModalUser] = useState<UserAccount | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null)

  const normalizeRole = (role: string | null) => {
    if (!role || role === 'user') {
      return 'employee'
    }

    return role
  }

  const roleOptions = useMemo(() => {
    const roles = new Set<string>()
    userAccounts?.forEach((account) => {
      roles.add(normalizeRole(account.role))
    })

    roles.add('admin')
    roles.add('employee')

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
      const role = normalizeRole(account.role)
      const isAuthenticated = Boolean(account.is_active)
      const isActive = Boolean(account.is_active)

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

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive)

      return matchesSearch && matchesRole && matchesAuth && matchesStatus
    })
  }, [authFilter, roleFilter, searchQuery, statusFilter, userAccounts])

  const getDraftRole = (account: UserAccount) => {
    return roleDrafts[account.id] ?? normalizeRole(account.role)
  }

  const setMessage = (message: string | null, type: 'error' | 'success') => {
    if (type === 'error') {
      setActionError(message)
      setActionSuccess(null)
      return
    }

    setActionSuccess(message)
    setActionError(null)
  }

  const runUserAction = async (
    account: UserAccount,
    action: 'role' | 'status' | 'password' | 'delete',
    options: {
      method: 'PATCH' | 'POST' | 'DELETE'
      body?: Record<string, unknown>
      successMessage: string
    }
  ) => {
    setLoadingAction({ userId: account.id, action })
    setActionError(null)
    setActionSuccess(null)

    try {
      const response = await fetch(`/api/auth/admin-users/${account.id}`, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Action failed')
      }

      setMessage(options.successMessage, 'success')
      router.refresh()
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed'
      setMessage(message, 'error')
      return false
    } finally {
      setLoadingAction(null)
    }
  }

  const handleRoleSave = async (account: UserAccount) => {
    const selectedRole = getDraftRole(account).trim()
    const currentRole = normalizeRole(account.role).trim()

    if (selectedRole === currentRole) {
      setMessage('No role change to save.', 'error')
      return
    }

    await runUserAction(account, 'role', {
      method: 'PATCH',
      body: { role: selectedRole },
      successMessage: `Role updated for ${account.email ?? account.id}.`,
    })
  }

  const handleStatusToggle = async (account: UserAccount) => {
    const nextStatus = !Boolean(account.is_active)
    const label = nextStatus ? 'activate' : 'deactivate'

    if (!window.confirm(`Are you sure you want to ${label} this account?`)) {
      return
    }

    await runUserAction(account, 'status', {
      method: 'PATCH',
      body: { isActive: nextStatus },
      successMessage: `Account status updated for ${account.email ?? account.id}.`,
    })
  }

  const handleDelete = async (account: UserAccount) => {
    if (account.id === currentUserId) {
      setMessage('You cannot delete your own account.', 'error')
      return
    }

    const confirmed = window.confirm(
      `Delete ${account.email ?? account.id}? This removes authentication and profile data and cannot be undone.`
    )
    if (!confirmed) {
      return
    }

    await runUserAction(account, 'delete', {
      method: 'DELETE',
      successMessage: `Deleted ${account.email ?? account.id}.`,
    })
  }

  const closePasswordModal = () => {
    setPasswordModalUser(null)
    setNewPassword('')
    setPasswordSubmitting(false)
    setPasswordModalError(null)
  }

  const handlePasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!passwordModalUser) {
      return
    }

    setPasswordModalError(null)
    setPasswordSubmitting(true)
    setLoadingAction({ userId: passwordModalUser.id, action: 'password' })

    try {
      const response = await fetch(`/api/auth/admin-users/${passwordModalUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setMessage(`Password reset for ${passwordModalUser.email ?? passwordModalUser.id}.`, 'success')
      router.refresh()
      closePasswordModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password'
      setPasswordModalError(message)
    } finally {
      setPasswordSubmitting(false)
      setLoadingAction(null)
    }
  }

  const isLoading = (accountId: string, action: 'role' | 'status' | 'password' | 'delete') => {
    return loadingAction?.userId === accountId && loadingAction.action === action
  }

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
              {(actionError || actionSuccess) && (
                <div
                  className={`rounded-lg border p-3 text-sm ${
                    actionError
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-green-200 bg-green-50 text-green-700'
                  }`}
                >
                  {actionError ?? actionSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
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

                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-600">Status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
                      const role = normalizeRole(account.role)
                      const isAuthenticated = Boolean(account.is_active)
                      const isSelf = account.id === currentUserId
                      const draftRole = getDraftRole(account)

                      return (
                        <div
                          key={account.id}
                          className="rounded-lg border border-slate-100 p-3"
                        >
                          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
                              <p className="truncate text-xs text-slate-500">{account.email || 'No email on file'}</p>
                              <p className="truncate text-[11px] text-slate-400">ID: {account.id}</p>
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
                                {isAuthenticated ? 'Active' : 'Inactive'}
                              </span>
                              {isSelf && (
                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                  You
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                            <div className="flex items-center gap-2">
                              <select
                                value={draftRole}
                                onChange={(event) =>
                                  setRoleDrafts((prev) => ({
                                    ...prev,
                                    [account.id]: event.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                {roleOptions
                                  .filter((roleOption) => roleOption !== 'all')
                                  .map((roleOption) => (
                                    <option key={roleOption} value={roleOption}>
                                      {roleOption}
                                    </option>
                                  ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRoleSave(account)}
                                disabled={isLoading(account.id, 'role')}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                              >
                                {isLoading(account.id, 'role') ? 'Saving...' : 'Save Role'}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setNewPassword('')
                                setPasswordModalError(null)
                                setPasswordModalUser(account)
                              }}
                              disabled={isLoading(account.id, 'password')}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                            >
                              Reset Password
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusToggle(account)}
                              disabled={isLoading(account.id, 'status')}
                              className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50"
                            >
                              {isLoading(account.id, 'status')
                                ? 'Updating...'
                                : isAuthenticated
                                  ? 'Deactivate'
                                  : 'Activate'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(account)}
                              disabled={isSelf || isLoading(account.id, 'delete')}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isLoading(account.id, 'delete') ? 'Deleting...' : 'Delete'}
                            </button>
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

      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={closePasswordModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">Reset Password</h2>
              <p className="text-sm text-slate-500">
                Set a new password for {passwordModalUser.email ?? passwordModalUser.id}.
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              {passwordModalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {passwordModalError}
                </div>
              )}

              <div>
                <label htmlFor="admin-reset-password" className="mb-1 block text-sm font-medium text-slate-700">
                  New Temporary Password
                </label>
                <input
                  id="admin-reset-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Must be at least 6 characters with uppercase, lowercase, number, and special character.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {passwordSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  )
}
