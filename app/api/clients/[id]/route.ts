import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  CLIENT_ID_COL,
  CLIENT_TABLE_NAME,
  normalizeClient,
} from '@/app/dashboard/clients/dataInformation'

const clientSelect = `
  client_id,
  first_name,
  last_name,
  email,
  created,
  last_updated,
  client_dob,
  current_credit_score,
  current_net_worth,
  current_net_income,
  goal_credit_score,
  goal_net_worth,
  goal_net_income
`

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: clientInfo, error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select(clientSelect)
    .eq(CLIENT_ID_COL, Number(id))
    .maybeSingle()

  if (error || !clientInfo) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json({ clientInfo: normalizeClient(clientInfo) })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const clientId = Number(id)

  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
  }

  const fullName =
    typeof body.client_name === 'string' ? body.client_name.trim() : ''
  const nameParts = fullName ? fullName.split(/\s+/) : []

  const updates = Object.fromEntries(
    Object.entries({
      first_name:
        typeof body.first_name === 'string' && body.first_name.trim()
          ? body.first_name.trim()
          : nameParts[0] ?? undefined,
      last_name:
        typeof body.last_name === 'string' && body.last_name.trim()
          ? body.last_name.trim()
          : fullName
            ? nameParts.slice(1).join(' ')
            : undefined,
      current_credit_score:
        body.current_credit_score === undefined ? undefined : body.current_credit_score,
      current_net_income:
        body.current_net_income === undefined ? undefined : body.current_net_income,
      current_net_worth:
        body.current_net_worth === undefined ? undefined : body.current_net_worth,
      goal_credit_score:
        body.goal_credit_score === undefined ? undefined : body.goal_credit_score,
      goal_net_income:
        body.goal_net_income === undefined ? undefined : body.goal_net_income,
      goal_net_worth:
        body.goal_net_worth === undefined ? undefined : body.goal_net_worth,
      last_updated: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined)
  )

  const { data: clientInfo, error: updateError } = await supabase
    .from(CLIENT_TABLE_NAME)
    .update(updates)
    .eq(CLIENT_ID_COL, clientId)
    .select(clientSelect)
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ clientInfo: normalizeClient(clientInfo) })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const clientId = Number(id)

  if (!Number.isInteger(clientId) || clientId <= 0) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .delete()
    .eq(CLIENT_ID_COL, clientId)
    .select(CLIENT_ID_COL)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json({ message: 'Client deleted successfully' })
}