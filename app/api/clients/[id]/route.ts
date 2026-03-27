import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CLIENT_TABLE_NAME } from '@/app/dashboard/clients/dataInformation'

export async function GET(
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

  const { data: clientInfo, error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select(`
      id,
      client_name,
      current_credit_score,
      current_net_worth,
      current_net_income,
      notes,
      goal_net_income,
      goal_net_worth,
      goal_credit_score
    `)
    .eq('id', Number(id))
    .maybeSingle()

  if (error || !clientInfo) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json({ clientInfo })
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

  const updates = {
    client_name: body.client_name,
    current_credit_score: body.current_credit_score,
    current_net_income: body.current_net_income,
    current_net_worth: body.current_net_worth,
    notes: body.notes,
    goal_credit_score: body.goal_credit_score,
    goal_net_income: body.goal_net_income,
    goal_net_worth: body.goal_net_worth,
  }

  const clientId = Number(id)

  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
  }

  const { data: updatedRows, error:  updateError } = await supabase
    .from(CLIENT_TABLE_NAME)
    .update(updates)
    .eq('id', clientId)
    .select()

    console.log('UPDATED ROWS:', updatedRows)
    console.log('UPDATE ERROR:', updateError)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const { data: clientInfo, error: fetchError } = await supabase
    .from(CLIENT_TABLE_NAME)
    .update(updates)
    .eq('id', clientId)
    .select(`
      id,
      client_name,
      current_credit_score,
      current_net_income,
      current_net_worth,
      notes,
      goal_credit_score,
      goal_net_income,
      goal_net_worth
    `)
    .maybeSingle()

    console.log('UPDATED ROWS:', updatedRows)
    console.log('UPDATE ERROR:', updateError)


  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!clientInfo) {
    return NextResponse.json(
      { error: 'Client not found after update' },
      { status: 404 }
    )
  }

  return NextResponse.json({ clientInfo })
  return NextResponse.json({
    clientInfo: client,
  })
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
    .eq('id', clientId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json({ message: 'Client deleted successfully' })
}