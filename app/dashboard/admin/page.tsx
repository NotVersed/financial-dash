import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldCheck, Users, Database, Activity } from 'lucide-react'
import CreateAdminAccountCard from './CreateAdminAccountCard'
import UserAccountsCard from './UserAccountsCard'
import DatabaseTablesCard from './DatabaseTablesCard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (currentProfileError || !currentProfile || currentProfile.role !== 'admin' || currentProfile.is_active !== true) {
    redirect('/dashboard')
  }

  const databaseTables = ['users', 'clients', 'financial_info'] as const

  const tableStatuses = await Promise.all(
    databaseTables.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      return {
        table,
        available: !error,
        count: count ?? 0,
      }
    })
  )

  const { data: userAccounts, error: userAccountsError } = await supabase
    .from('users')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: false })

  const totalUsers = tableStatuses.find(({ table }) => table === 'users')?.count ?? 0
  const totalClients = tableStatuses.find(({ table }) => table === 'clients')?.count ?? 0
  const totalFinancialRecords = tableStatuses.find(({ table }) => table === 'financial_info')?.count ?? 0

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">System overview and management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600 font-bold">{totalClients ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Registered in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Records</CardTitle>
            <Database className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600 font-bold">{totalFinancialRecords}</div>
            <p className="text-xs text-slate-500 mt-1">Entries in `financial_info`</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Users</CardTitle>
            <Activity className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600 font-bold">{totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">Profiles in the `users` table</p>
          </CardContent>
        </Card>
      </div>

      <CreateAdminAccountCard />

      {/* Current Admin */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base">Logged-in Administrator</CardTitle>
              <CardDescription>Currently authenticated user</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{user.email}</p>
              <p className="text-xs text-slate-500">Administrator · ID: {user.id}</p>
            </div>
            <span className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              Active
            </span>
          </div>
        </CardContent>
      </Card>

      <UserAccountsCard
        userAccounts={userAccounts}
        hasError={Boolean(userAccountsError)}
        currentUserId={user.id}
      />

      <DatabaseTablesCard tableStatuses={tableStatuses} />
    </div>
  )
}
