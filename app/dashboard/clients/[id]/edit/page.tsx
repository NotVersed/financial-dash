export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ClientEditForm from '../ClientEditForm'
import { ArrowLeft } from 'lucide-react'

type Client = {
  id: number
  first_name: string
  last_name: string
  email: string | null
}

type FinancialMetric = {
  current_credit_score: number | null
  current_net_worth: number | null
  current_net_income: number | null
  goal_net_income: number | null
  goal_net_worth: number | null
  goal_credit_score: number | null
}

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Get client (identity)
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('client_id', id)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // 2. Get latest financial snapshot
  const { data: metrics } = await supabase
    .from('financial_info')
    .select('*')
    .eq('client_id', id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  // 3. Merge into one object
  const clientWithMetrics = {
    ...client,
    id: client.client_id ?? client.id,
    client_name: `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim(),
    current_credit_score: metrics?.current_credit_score ?? null,
    current_net_worth: metrics?.current_net_worth ?? null,
    current_net_income: metrics?.current_net_income ?? null,
    goal_net_income: metrics?.goal_net_income ?? null,
    goal_net_worth: metrics?.goal_net_worth ?? null,
    goal_credit_score: metrics?.goal_credit_score ?? null,
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/clients/${id}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 inline-block mr-1" />
          Back to Client
        </Link>
      </div>

      <ClientEditForm client={clientWithMetrics} />
    </div>
  )
}