import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  CLIENT_TABLE_NAME,
  normalizeClient,
} from '@/app/dashboard/clients/dataInformation'

/**
 * GET /api/clients
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from(CLIENT_TABLE_NAME)
      .select('*')
      .order('last_name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clients: (data ?? []).map(normalizeClient),
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/clients
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    const { first_name, last_name, email, status } = body

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from(CLIENT_TABLE_NAME)
      .insert([
        {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.trim(),
          status: status ?? 'active',
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { client: normalizeClient(data) },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}