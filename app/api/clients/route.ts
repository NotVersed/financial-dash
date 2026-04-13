import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  CLIENT_NAME_COL,
  CLIENT_TABLE_NAME,
  normalizeClient,
} from '@/app/dashboard/clients/dataInformation'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select('*')
    .order(CLIENT_NAME_COL, { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data ?? []).map(normalizeClient))
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const fullName =
    typeof body.client_name === 'string' ? body.client_name.trim() : ''
  const nameParts = fullName ? fullName.split(/\s+/) : []

  const firstName =
    typeof body.first_name === 'string' && body.first_name.trim()
      ? body.first_name.trim()
      : nameParts[0] ?? ''

  const lastName =
    typeof body.last_name === 'string' && body.last_name.trim()
      ? body.last_name.trim()
      : nameParts.slice(1).join(' ')

  const email =
    typeof body.email === 'string' && body.email.trim()
      ? body.email.trim()
      : ''

  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { error: 'First name, last name, and email are required.' },
      { status: 400 }
    )
  }

  const now = new Date()

  const { data, error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        email,
        client_dob: body.client_dob ?? null,
        current_credit_score: body.current_credit_score ?? null,
        current_net_worth: body.current_net_worth ?? null,
        current_net_income: body.current_net_income ?? null,
        goal_net_income: body.goal_net_income ?? null,
        goal_net_worth: body.goal_net_worth ?? null,
        goal_credit_score: body.goal_credit_score ?? null,
        created: now.toISOString().slice(0, 10),
        last_updated: now.toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      message: 'Client created successfully',
      clientInfo: normalizeClient(data),
    },
    { status: 201 }
  )
}