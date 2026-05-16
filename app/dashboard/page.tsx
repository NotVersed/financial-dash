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
    // TODO: check if this is going to be innacurate b/c potentially (but not necessarily likely) multiple updates for a client can occur in one day
    .order('date', { ascending: false })
    .limit(1)

  const snapshot = latestClients?.[0]

  const avgCreditScore = snapshot?.avg_credit_score ?? null
  const avgNetIncome = snapshot?.avg_income ?? null
  const avgNetWorth = snapshot?.avg_net_worth ?? null


  // -------------------------
  //  MILESTONES & TOTAL NUM OF FINANCIAL RECORDS
  // -------------------------
  const { count: financialEntries } = await supabase
    .from('financial_info')
    .select('*', { count: 'exact', head: true })

  const { data: milestonesData, error: milestonesError } = await supabase
    .from('financial_info')
    .select(`
    credit_score,
    net_income,
    net_worth,
    clients!inner (
      goal_credit_score,
      goal_net_income,
      goal_net_worth
    )
  `)

  const milestonesCount = (milestonesData ?? []).reduce((total, record) => {
    const client = record.clients as unknown as {
      goal_credit_score: number | null
      goal_net_income: number | null
      goal_net_worth: number | null
    }
    if(!client) return total;
    if (record.credit_score != null && client.goal_credit_score != null && record.credit_score >= client.goal_credit_score) total++
    if (record.net_income != null && client.goal_net_income != null && record.net_income >= client.goal_net_income) total++
    if (record.net_worth != null && client.goal_net_worth != null && record.net_worth >= client.goal_net_worth) total++
    return total
  }, 0)




  // -------------------------
  // TIME SERIES NOW COMES FROM MATERIALIZED VIEW
  // -------------------------
  const { data: snapshotData } = await supabase
    .from('financial_snapshots') // MATERIALIZED VIEW
    .select('date, avg_income, avg_net_worth, avg_credit_score, total_clients')
    // TODO: check if this is going to be innacurate b/c potentially (but not necessarily likely) multiple updates for a client can occur in one day
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
    financialEntries,
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
      title: 'Financial Updates Logged',
      value: stats.financialEntries || 0,
      description: 'Total financial snapshots recorded',
      icon: TrendingUp,
      color: 'text-blue-600',
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
        <h1 className="text-2xl font-bold">Financial Dashboard</h1>
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
              href="/dashboard/clients?add=true"
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