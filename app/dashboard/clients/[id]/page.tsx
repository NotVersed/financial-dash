import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CreditCard, TrendingUp, DollarSign, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get client info
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!client) notFound()

  // Get latest financial metrics for this client
  const { data: metrics } = await supabase
    .from('financial_metrics')
    .select('*')
    .eq('client_id', params.id)
    .order('metric_date', { ascending: false })
    .limit(10)

  const latest = metrics?.[0]

  // Get loans for this client
  const { data: loans } = await supabase
    .from('loan_participation')
    .select('*')
    .eq('client_id', params.id)

  // Get milestones for this client
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('client_id', params.id)
    .order('achieved_date', { ascending: false })

  return (
    <div className="p-8">

      {/* Back button */}
      <Link
        href="/dashboard/clients"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>

      {/* Client header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg">
            {client.name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
            <p className="text-sm text-slate-500">{client.email} · Status:
              <span className={`ml-1 font-medium ${client.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>
                {client.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Key metrics — credit score, net income, net worth FIRST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latest?.credit_score ?? '—'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Latest recorded score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latest?.net_income ? `$${Number(latest.net_income).toLocaleString()}` : '—'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Most recent entry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latest?.net_worth ? `$${Number(latest.net_worth).toLocaleString()}` : '—'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Most recent entry</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial History</CardTitle>
            <CardDescription>All recorded metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics && metrics.length > 0 ? (
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
              <p className="text-sm text-slate-400">No financial data recorded yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>Achievements and progress markers</CardDescription>
          </CardHeader>
          <CardContent>
            {milestones && milestones.length > 0 ? (
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
              <p className="text-sm text-slate-400">No milestones recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Participation</CardTitle>
          <CardDescription>Active and past loans</CardDescription>
        </CardHeader>
        <CardContent>
          {loans && loans.length > 0 ? (
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
            <p className="text-sm text-slate-400">No loans recorded yet</p>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
