export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CreditCard, TrendingUp, DollarSign, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ClientEditForm from './ClientEditForm'



type ClientInfo = {
  id: number
  client_name: string
  current_credit_score: number | null
  current_net_worth: number | null
  current_net_income: number | null
  notes: string | null
  goal_net_income: number | null
  goal_net_worth: number | null
  goal_credit_score: number | null
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()

  const res = await fetch(`http://localhost:3000/api/clients/${id}`, {
    headers: {
      cookie: cookieStore.toString(),
    },
    cache: 'no-store',
  })

  if (res.status === 401) {
    redirect('/login')
  }

  if (res.status === 404) {
    notFound()
  }

  if (!res.ok) {
    throw new Error('Failed to fetch client info')
  }

  const data: { clientInfo: ClientInfo } = await res.json()
  const client = data.clientInfo

  const metrics: any[] = []
  const loans: any[] = []
  const milestones: any[] = []

  return (
    <div className="p-8">
      <Link
        href="/dashboard/clients"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg">
            {client.client_name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{client.client_name}</h1>
            <p className="text-sm text-slate-500">
              Email: N/A · Status: N/A
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-500">
              {client.current_credit_score ?? '—'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Current recorded score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-500">
              {client.current_net_income != null
                ? `$${Number(client.current_net_income).toLocaleString()}`
                : '—'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Current recorded income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-500">
              {client.current_net_worth != null
                ? `$${Number(client.current_net_worth).toLocaleString()}`
                : '—'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Current recorded net worth</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial History</CardTitle>
            <CardDescription>All recorded metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <div className="space-y-3">
                {metrics.map((m: any) => (
                  <div key={m.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-500">{m.metric_date}</span>
                    <div className="flex gap-4 text-sm">
                      <span>Score: <strong>{m.credit_score ?? '—'}</strong></span>
                      <span>Income: <strong>{m.net_income ? `$${Number(m.net_income).toLocaleString()}` : '—'}</strong></span>
                      <span>Worth: <strong>{m.net_worth ? `$${Number(m.net_worth).toLocaleString()}` : '—'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No financial data recorded yet (feature coming soon)
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>Achievements and progress markers</CardDescription>
          </CardHeader>
          <CardContent>
            {milestones.length > 0 ? (
              <div className="space-y-2">
                {milestones.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-slate-700">{m.description || m.milestone_type}</span>
                    <span className="text-xs text-slate-400 ml-auto">{m.achieved_date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No milestones recorded yet (feature coming soon)
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Participation</CardTitle>
          <CardDescription>Active and past loans</CardDescription>
        </CardHeader>
        <CardContent>
          {loans.length > 0 ? (
            <div className="space-y-2">
              {loans.map((loan: any) => (
                <div key={loan.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-700">{loan.loan_type || 'Loan'}</span>
                  <span className="text-sm font-medium">${Number(loan.loan_amount).toLocaleString()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${loan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {loan.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No loan data available (feature coming soon)
            </p>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Link
          href={`/dashboard/clients/${client.id}/edit`}
          className="inline-block rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
        >
          Edit Client Information
        </Link>
      </div>

    </div>
  )
}