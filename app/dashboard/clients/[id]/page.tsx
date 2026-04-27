

export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NotesSection from './NotesSection'
import DeleteClientButton from './DeleteClientButton'
import { METRICS_TABLE_NAME } from '@/app/dashboard/clients/dataInformation'

import ClientChart from './ClientCharts'

type Note = {
  note_id: number
  note: string
  created_at: string
}

// type Client = {
//   id: number
//   first_name: string
//   last_name: string
// }

export default async function ClientDetailPage({
  params,
}: {
  // FIX: params is a Promise in modern Next.js
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const clientId = Number(id)

// Guard invalid route param early
if (Number.isNaN(clientId)) {
  console.log('[ClientDetailPage] INVALID CLIENT ID PARAM:', {
    raw: id,
    parsed: clientId,
  })

  notFound()
}

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // -------------------------
  // Client data
  // -------------------------
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('client_id, first_name, last_name, goal_credit_score, goal_net_income, goal_net_worth')
    .eq('client_id', clientId)
    .maybeSingle()

  if (clientError || !client) notFound()

  // -------------------------
  // Latest metrics
  // -------------------------
  const { data: metrics } = await supabase
    .from(METRICS_TABLE_NAME)
    .select('net_income, net_worth, credit_score')
    .eq('client_id', clientId)
    .order('measurement_date', { ascending: false })
    .limit(1)

  const latest = metrics?.[0] ?? null

  // colors for charts and bars
  const creditScoreColor = "#5da292"
  const netIncomeColor = "#EE99AA"
  const netWorthColor = "#6d66cc"

  // ------------------------
  // For Chart - time series for 1 client
  // --------------------

  const { data: timeSeries } = await supabase
    .from(METRICS_TABLE_NAME)
    .select('measurement_date, credit_score, net_income, net_worth')
    .eq('client_id', clientId)
    .order('measurement_date', { ascending: true })

  // -------------------------
  // Notes
  // -------------------------
  const { data: notesData } = await supabase
    .from('notes')
    .select('*')
    .eq('client_id', clientId)
  

  const chartMetrics = (timeSeries ?? []).map(row => ({
    date: row.measurement_date,
    creditScore: row.credit_score,
    netIncome: row.net_income,
    netWorth: row.net_worth,
  }))
  

  const sortedNotes: Note[] = (notesData ?? []).sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  )

  return (
    <div className="p-8 text-slate-900">

      <Link
        href="/dashboard/clients"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {client.first_name} {client.last_name}
        </h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Credit Score</CardTitle>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {latest?.credit_score ?? '—'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Net Income</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {latest?.net_income != null
              ? `$${Number(latest.net_income).toLocaleString()}`
              : '—'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Net Worth</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {latest?.net_worth != null
              ? `$${Number(latest.net_worth).toLocaleString()}`
              : '—'}
          </CardContent>
        </Card>

      </div>
      
      

      {/* Goal Progress + Chart */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

      {/* LEFT: Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Trends</CardTitle>
          <CardDescription>
            Credit score, income, and net worth over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientChart data={chartMetrics} creditScoreStroke={creditScoreColor} netIncomeStroke={netIncomeColor} netWorthStroke={netWorthColor} />
        </CardContent>
      </Card>

      {/* RIGHT: Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>Current vs Target Goals</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {/* Credit Score */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Credit Score</span>
              <span className="text-slate-600">
                {latest?.credit_score ?? 0} / {client.goal_credit_score ?? '—'}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  backgroundColor: creditScoreColor,
                  width: `${
                    client.goal_credit_score
                      ? Math.min(
                          100,
                          ((latest?.credit_score ?? 0) /
                            client.goal_credit_score) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Net Income */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Net Income</span>
              <span className="text-slate-600">
                ${(latest?.net_income ?? 0).toLocaleString()} /{' '}
                {client.goal_net_income
                  ? `$${client.goal_net_income.toLocaleString()}`
                  : '—'}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  backgroundColor: netIncomeColor,
                  width: `${
                    client.goal_net_income
                      ? Math.min(
                          100,
                          ((latest?.net_income ?? 0) /
                            client.goal_net_income) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Net Worth */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Net Worth</span>
              <span className="text-slate-600">
                ${(latest?.net_worth ?? 0).toLocaleString()} /{' '}
                {client.goal_net_worth
                  ? `$${client.goal_net_worth.toLocaleString()}`
                  : '—'}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  backgroundColor: netWorthColor,
                  width: `${
                    client.goal_net_worth
                      ? Math.min(
                          100,
                          ((latest?.net_worth ?? 0) /
                            client.goal_net_worth) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Client history</CardDescription>
        </CardHeader>
        <CardContent>
          <NotesSection notes={sortedNotes} clientId={clientId} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <Link
          href={`/dashboard/clients/${clientId}/edit`}
          className="rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          Edit Client
        </Link>

        <DeleteClientButton
          clientId={clientId}
          clientName={`${client.first_name} ${client.last_name}`}
        />
      </div>

    </div>
  )
}