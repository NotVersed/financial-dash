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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select(clientSelect)
    .eq(CLIENT_ID_COL, Number(id))
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json({ clientInfo: normalizeClient(data) })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const clientId = Number(id)

  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
  }

  const updates = {
    first_name: body.first_name,
    last_name: body.last_name,
    current_credit_score: body.current_credit_score,
    current_net_income: body.current_net_income,
    current_net_worth: body.current_net_worth,
    goal_credit_score: body.goal_credit_score,
    goal_net_income: body.goal_net_income,
    goal_net_worth: body.goal_net_worth,
    last_updated: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .update(updates)
    .eq(CLIENT_ID_COL, clientId)
    .select(clientSelect)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ clientInfo: normalizeClient(data) })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const clientId = Number(id)

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .delete()
    .eq(CLIENT_ID_COL, clientId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Client deleted successfully' })
}