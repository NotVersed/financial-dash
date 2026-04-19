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

async function getDashboardStats() {
  const supabase = await createClient()

  const { count: totalClients } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select('*', { count: 'exact', head: true })

  const { count: activeClients } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { data: clientMetrics } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select('current_credit_score, current_net_income, current_net_worth')

  const metricRows: ClientMetricRow[] = clientMetrics ?? []

  const avgCreditScore = calculateAverage(metricRows.map(r => r.current_credit_score))
  const avgNetIncome = calculateAverage(metricRows.map(r => r.current_net_income))
  const avgNetWorth = calculateAverage(metricRows.map(r => r.current_net_worth))

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
  // FINANCIAL METRICS (WITH CLIENT GROWTH)
  // -------------------------
  const { data: rawMetrics } = await supabase
    .from('financial_info')
    .select('measurement_date, net_income, net_worth, credit_score, client_id')
    .order('measurement_date', { ascending: true })

  const metricsByDate = new Map<string, {
    date: string
    incomes: number[]
    worths: number[]
    scores: number[]
    clients: Set<string>
  }>()

  const seenClients = new Set<string>()

  for (const row of rawMetrics ?? []) {
    if (!row.measurement_date) continue

    const date = new Date(row.measurement_date).toISOString().split('T')[0]

    if (!metricsByDate.has(date)) {
      metricsByDate.set(date, {
        date,
        incomes: [],
        worths: [],
        scores: [],
        clients: new Set(),
      })
    }

    const bucket = metricsByDate.get(date)!

    if (row.net_income != null) bucket.incomes.push(Number(row.net_income))
    if (row.net_worth != null) bucket.worths.push(Number(row.net_worth))
    if (row.credit_score != null) bucket.scores.push(Number(row.credit_score))

    if (row.client_id) {
      seenClients.add(row.client_id)
    }

    bucket.clients = new Set(seenClients)
  }

  const dailyMetrics: TimeSeriesMetrics[] = Array.from(metricsByDate.values()).map(d => ({
    date: d.date,
    avgIncome: d.incomes.length
      ? Math.round(d.incomes.reduce((a, b) => a + b, 0) / d.incomes.length)
      : 0,
    avgNetWorth: d.worths.length
      ? Math.round(d.worths.reduce((a, b) => a + b, 0) / d.worths.length)
      : 0,
    avgCreditScore: d.scores.length
      ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length)
      : 0,
    totalClients: d.clients.size,
  }))

  const granularity: Granularity = 'month'
  const aggregatedMetrics = aggregateMetrics(dailyMetrics, granularity)

  return {
    totalClients: totalClients || 0,
    activeClients: activeClients || 0,
    avgCreditScore,
    avgNetIncome,
    avgNetWorth,
    totalLoansAmount,
    totalLoansCount,
    milestonesCount: milestonesCount || 0,
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

      {/* Header */}
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

      {/* Charts */}
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

    </div>
  )
}