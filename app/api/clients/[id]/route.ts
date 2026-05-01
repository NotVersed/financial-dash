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

/**
 * GET /api/clients/[id]
 * Client comes from clients table
 * Latest financial snapshot comes from metrics table
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const clientId = Number(id)

  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
  }

  // -------------------------
  // 1. Get client
  // -------------------------
  const { data: client, error: clientError } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select(clientSelect)
    .eq(CLIENT_ID_COL, clientId)
    .maybeSingle()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // -------------------------
  // 2. Get latest metrics (THIS is the key change)
  // -------------------------
  const { data: metrics, error: metricsError } = await supabase
    .from(METRICS_TABLE_NAME)
    .select('net_income, net_worth, credit_score, measurement_date')
    .eq('client_id', clientId)
    .order('measurement_date', { ascending: false })
    .limit(1)

  if (metricsError) {
    return NextResponse.json(
      { error: metricsError.message },
      { status: 500 }
    )
  }

  const latest = metrics?.[0] ?? null

  // -------------------------
  // 3. Merge response
  // -------------------------
  return NextResponse.json({
    clientInfo: normalizeClient({
      ...client,
      current_net_income: latest?.net_income ?? null,
      current_net_worth: latest?.net_worth ?? null,
      current_credit_score: latest?.credit_score ?? null,
    }),
  })
}

/**
 * PATCH /api/clients/[id]
 * Updates:
 * - clients table → identity fields
 * - metrics table → financial snapshot (append-only style)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const clientId = Number(id)

  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
  }

  const body = await request.json()

  // -------------------------
  // 1. Update client table (identity fields only)
  // -------------------------
  const clientUpdates = {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    status: body.status,
    last_updated: new Date().toISOString(),
  }

  const { data: updatedClient, error: clientError } = await supabase
    .from(CLIENT_TABLE_NAME)
    .update(clientUpdates)
    .eq(CLIENT_ID_COL, clientId)
    .select(clientSelect)
    .maybeSingle()

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 })
  }

  // -------------------------
  // 2. Insert metrics snapshot (history row per update)
  // -------------------------
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
      return NextResponse.json(
        { error: metricsError.message },
        { status: 500 }
      )
    }
  }

  // -------------------------
  // 3. Return merged client
  // -------------------------
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

/**
 * DELETE /api/clients/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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