import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  CLIENT_ID_COL,
  CLIENT_TABLE_NAME,
  normalizeClient,
  METRICS_TABLE_NAME,
} from '@/app/dashboard/clients/dataInformation'

const clientSelect = `
  client_id,
  first_name,
  last_name,
  email,
  status,
  created,
  last_updated,
  client_dob,
  goal_credit_score,
  goal_net_worth,
  goal_net_income
`

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const clientId = Number(id)

  console.log('[GET] clientId:', clientId)

  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
  }

  const { data: client, error: clientError } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select(clientSelect)
    .eq(CLIENT_ID_COL, clientId)
    .maybeSingle()

  if (clientError || !client) {
    console.log('[GET] client error:', clientError)
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const { data: metrics } = await supabase
    .from(METRICS_TABLE_NAME)
    .select('net_income, net_worth, credit_score, measurement_date')
    .eq('client_id', clientId)
    .order('measurement_date', { ascending: false })
    .limit(1)

  const latest = metrics?.[0] ?? null

  return NextResponse.json({
    clientInfo: normalizeClient({
      ...client,
      current_net_income: latest?.net_income ?? null,
      current_net_worth: latest?.net_worth ?? null,
      current_credit_score: latest?.credit_score ?? null,
    }),
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const clientId = Number(id)

  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
  }

  const body = await request.json()
  console.log('[PATCH] body:', body)

  // ✅ FIX: include goals
  const clientUpdates = {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    status: body.status,
    goal_credit_score: body.goal_credit_score,
    goal_net_income: body.goal_net_income,
    goal_net_worth: body.goal_net_worth,
    last_updated: new Date().toISOString(),
  }

  const { data: updatedClient, error: clientError } = await supabase
    .from(CLIENT_TABLE_NAME)
    .update(clientUpdates)
    .eq(CLIENT_ID_COL, clientId)
    .select(clientSelect)
    .maybeSingle()

  if (clientError) {
    console.log('[PATCH] client error:', clientError)
    return NextResponse.json({ error: clientError.message }, { status: 500 })
  }

  // Metrics insert (optional)
  const hasFinancialData =
    body.current_net_income != null ||
    body.current_net_worth != null ||
    body.current_credit_score != null

  if (hasFinancialData) {
    const { error: metricsError } = await supabase
      .from(METRICS_TABLE_NAME)
      .insert({
        client_id: clientId,
        net_income: body.current_net_income ?? null,
        net_worth: body.current_net_worth ?? null,
        credit_score: body.current_credit_score ?? null,
        measurement_date: new Date().toISOString(),
      })

    if (metricsError) {
      console.log('[PATCH] metrics error:', metricsError)
      return NextResponse.json({ error: metricsError.message }, { status: 500 })
    }
  }

  const { data: latestMetrics } = await supabase
    .from(METRICS_TABLE_NAME)
    .select('net_income, net_worth, credit_score')
    .eq('client_id', clientId)
    .order('measurement_date', { ascending: false })
    .limit(1)

  const latest = latestMetrics?.[0] ?? null

  return NextResponse.json({
    clientInfo: normalizeClient({
      ...updatedClient!,
      current_net_income: latest?.net_income ?? null,
      current_net_worth: latest?.net_worth ?? null,
      current_credit_score: latest?.credit_score ?? null,
    }),
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const clientId = Number(id)

  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
  }

  const { error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .delete()
    .eq(CLIENT_ID_COL, clientId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Client deleted successfully',
  })
}