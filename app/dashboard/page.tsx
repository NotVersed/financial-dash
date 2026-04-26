import { createClient } from '@/lib/supabase/server'
import DashboardCharts from '@/components/DashboardCharts'
import { aggregateMetrics, type Granularity, type TimeSeriesMetrics } from '../../components/timeSeriesAggregation'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import { redirect } from 'next/navigation'
import {
  Users, TrendingUp, DollarSign,
  PiggyBank, CreditCard, Target
} from 'lucide-react'
import Link from 'next/link'
import { CLIENT_TABLE_NAME } from './clients/dataInformation'

type ClientMetricRow = {
  current_credit_score: number | null
  current_net_income: number | null
  current_net_worth: number | null
}

function calculateAverage(values: Array<number | string | null | undefined>) {
  const nums = values
    .map(v => (v == null ? null : Number(v)))
    .filter((v): v is number => v != null && Number.isFinite(v))

  if (nums.length === 0) return null

  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

/**
 * NOW USING MATERIALIZED VIEW (NO RAW TIME SERIES LOGIC HERE)
 */
async function getDashboardStats() {
  const supabase = await createClient()

  // -------------------------
  // BASIC METRICS
  // -------------------------
  const { count: totalClients } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select('*', { count: 'exact', head: true })

  const { count: activeClients } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { data: latestClients } = await supabase
  .from('financial_snapshots')
  .select('avg_credit_score, avg_income, avg_net_worth')
  .order('date', { ascending: false })
  .limit(1)

  const snapshot = latestClients?.[0]

  const avgCreditScore = snapshot?.avg_credit_score ?? null
  const avgNetIncome = snapshot?.avg_income ?? null
  const avgNetWorth = snapshot?.avg_net_worth ?? null


  // -------------------------
  // LOANS / MILESTONES
  // -------------------------
  const { data: loans } = await supabase
    .from('loan_participation')
    .select('loan_amount')

  const totalLoansAmount =
    loans?.reduce((sum, l) => sum + Number(l.loan_amount), 0) || 0

  const totalLoansCount = loans?.length || 0

  const { count: milestonesCount } = await supabase
    .from('milestones')
    .select('*', { count: 'exact', head: true })

  // -------------------------
  // TIME SERIES NOW COMES FROM MATERIALIZED VIEW
  // -------------------------
  const { data: snapshotData } = await supabase
    .from('financial_snapshots') // MATERIALIZED VIEW
    .select('date, avg_income, avg_net_worth, avg_credit_score, total_clients')
    .order('date', { ascending: true })

  const aggregatedMetrics: TimeSeriesMetrics[] = (snapshotData ?? []).map(row => ({
    date: row.date,
    avgIncome: row.avg_income,
    avgNetWorth: row.avg_net_worth,
    avgCreditScore: row.avg_credit_score,
    totalClients: row.total_clients,
  }))

  return {
    totalClients: totalClients || 0,
    activeClients: activeClients || 0,
    avgCreditScore,
    avgNetIncome,
    avgNetWorth,
    totalLoansAmount,
    totalLoansCount,
    milestonesCount: milestonesCount || 0,

    // already clean from SQL
    aggregatedMetrics,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Avg Credit Score',
      value: stats.avgCreditScore ?? '—',
      description: 'Across current client records',
      icon: CreditCard,
      color: 'text-blue-600',
    },
    {
      title: 'Avg Net Income',
      value: stats.avgNetIncome != null ? `$${stats.avgNetIncome.toLocaleString()}` : '—',
      description: 'Based on current client income',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Avg Net Worth',
      value: stats.avgNetWorth != null ? `$${stats.avgNetWorth.toLocaleString()}` : '—',
      description: 'Based on current client net worth',
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
    <div className="p-8 text-slate-900">

      <div className="mb-8">
        <h1 className="text-2xl font-bold">LIFE Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Client Financial Progress Tracking
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts (now clean SQL output) */}
      <DashboardCharts metrics={stats.aggregatedMetrics} />

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
              href="/dashboard/clients"
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

    </div>
  )
}