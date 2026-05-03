export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ClientEditForm from '../ClientEditForm'
import { ArrowLeft } from 'lucide-react'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clientId = Number(id)

  if (Number.isNaN(clientId)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // -------------------------
  // 1. Get client
  // -------------------------
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle()

  if (clientError || !client) {
    console.log('[EditClientPage] CLIENT FETCH FAILED', clientError)
    notFound()
  }

  // -------------------------
  // 2. Get latest metrics
  // -------------------------
  const { data: metricsData, error: metricsError } = await supabase
    .from('financial_info')
    .select('net_income, net_worth, credit_score, measurement_date')
    .eq('client_id', clientId)
    .order('measurement_date', { ascending: false })
    .limit(1)

  if (metricsError) {
    console.log('[EditClientPage] METRICS ERROR', metricsError)
  }

  const metrics = metricsData?.[0] ?? null

  // -------------------------
  // 3. Merge correctly
  // -------------------------
  const clientWithMetrics = {
    id: client.client_id,
    first_name: client.first_name ?? '',
    last_name: client.last_name ?? '',
    email: client.email ?? '',
    status: client.status ?? 'active',
    notes: null,

    // FIXED from when it was not working -  correct column mapping
    current_credit_score: metrics?.credit_score ?? null,
    current_net_worth: metrics?.net_worth ?? null,
    current_net_income: metrics?.net_income ?? null,

    // goals come from CLIENT table (not metrics!)
    goal_credit_score: client.goal_credit_score ?? null,
    goal_net_income: client.goal_net_income ?? null,
    goal_net_worth: client.goal_net_worth ?? null,
  }

  console.log('[EditClientPage] FINAL DATA:', clientWithMetrics)

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/clients/${clientId}`}
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