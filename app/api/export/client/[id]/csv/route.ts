import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CLIENT_TABLE_NAME } from '@/app/dashboard/clients/dataInformation'


export async function GET(
  _req: Request,
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

  const clientId = Number(id)

  const { data, error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const { data: financial } = await supabase
    .from('financial_info')
    .select('*')
    .eq('client_id', Number(id))
    .order('measurement_date', { ascending: false })
    .limit(1)
    .single()

  const clientWithFinancials = {
    ...data,
    current_credit_score: financial?.credit_score ?? '',
    current_net_worth: financial?.net_worth ?? '',
    current_net_income: financial?.net_income ?? '',
  }

  const headers = [
    'client_id',
    'first_name',
    'last_name',
    'email',
    'client_dob',
    'current_credit_score',
    'current_net_worth',
    'current_net_income',
    'goal_credit_score',
    'goal_net_worth',
    'goal_net_income',
    'created',
    'last_updated',
  ]

  const escape = (val: any) =>
    `"${String(val ?? '').replace(/"/g, '""')}"`

  const row = headers.map(h => escape(clientWithFinancials[h])).join(',')

  const csv = [headers.join(','), row].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="client-${clientId}.csv"`,
    },
  })
}