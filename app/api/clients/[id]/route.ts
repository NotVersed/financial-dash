import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CLIENT_TABLE_NAME } from '@/app/dashboard/clients/dataInformation'

export async function GET(
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

  const { data: client, error } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select('*')
    .eq('id', clientId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

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