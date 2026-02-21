import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Users, TrendingUp, DollarSign, PiggyBank, CreditCard, Target } from 'lucide-react'
import Link from 'next/link'
import DashboardCharts from '@/components/DashboardCharts'


async function getDashboardStats() {
  const supabase = await createClient()

  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  const { count: activeClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { data: recentMetrics } = await supabase
    .from('financial_metrics')
    .select('credit_score, net_income, net_worth')
    .not('credit_score', 'is', null)
    .order('metric_date', { ascending: false })
    .limit(100)

  const avgCreditScore = recentMetrics && recentMetrics.length > 0
    ? Math.round(recentMetrics.reduce((sum, m) => sum + (m.credit_score || 0), 0) / recentMetrics.length)
    : 0

  const avgNetIncome = recentMetrics && recentMetrics.length > 0
    ? Math.round(recentMetrics.reduce((sum, m) => sum + (m.net_income || 0), 0) / recentMetrics.length)
    : 0

  const avgNetWorth = recentMetrics && recentMetrics.length > 0
    ? Math.round(recentMetrics.reduce((sum, m) => sum + (m.net_worth || 0), 0) / recentMetrics.length)
    : 0

  const { data: loans } = await supabase
    .from('loan_participation')
    .select('loan_amount')

  const totalLoansAmount = loans?.reduce((sum, loan) => sum + Number(loan.loan_amount), 0) || 0
  const totalLoansCount = loans?.length || 0

  const { count: milestonesCount } = await supabase
    .from('milestones')
    .select('*', { count: 'exact', head: true })

  return {
    totalClients: totalClients || 0,
    activeClients: activeClients || 0,
    avgCreditScore,
    avgNetIncome,
    avgNetWorth,
    totalLoansAmount,
    totalLoansCount,
    milestonesCount: milestonesCount || 0,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const stats = await getDashboardStats()

  // Credit score, net income, net worth are FIRST as required
  const statCards = [
    {
      title: 'Avg Credit Score',
      value: stats.avgCreditScore || '—',
      description: 'Across all active clients',
      icon: CreditCard,
      color: 'text-blue-600',
    },
    {
      title: 'Avg Net Income',
      value: stats.avgNetIncome ? `$${stats.avgNetIncome.toLocaleString()}` : '—',
      description: 'Monthly average',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Avg Net Worth',
      value: stats.avgNetWorth ? `$${stats.avgNetWorth.toLocaleString()}` : '—',
      description: 'Client average',
      icon: DollarSign,
      color: 'text-emerald-600',
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      description: `${stats.activeClients} currently active`,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Total Loans Disbursed',
      value: `$${stats.totalLoansAmount.toLocaleString()}`,
      description: `${stats.totalLoansCount} loans active`,
      icon: PiggyBank,
      color: 'text-orange-600',
    },
    {
      title: 'Milestones Achieved',
      value: stats.milestonesCount,
      description: 'Client success markers',
      icon: Target,
      color: 'text-red-600',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">LIFE Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Client Financial Progress Tracking</p>
      </div>

      {/* Stats Grid — credit score, net income, net worth first */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and navigation</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                  href="/dashboard/clients"
                  className="h-24 flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700"
              >
                  <Users className="h-6 w-6" />
                  <span className="text-sm font-medium">View All Clients</span>
              </Link>

              <Link
                  href="/dashboard/clients/new"
                  className="h-24 flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700"
              >
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm font-medium">Add New Client</span>
              </Link>

              <Link
                  href="/dashboard/reports"
                  className="h-24 flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700"
              >
                  <PiggyBank className="h-6 w-6" />
                  <span className="text-sm font-medium">Generate Report</span>
              </Link>
            </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Recent client milestones and updates will appear here once client data is added.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
