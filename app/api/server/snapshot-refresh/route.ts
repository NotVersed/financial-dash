import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  // optional: verify user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase.rpc('refresh_financial_snapshots')

  if (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to refresh snapshots' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}