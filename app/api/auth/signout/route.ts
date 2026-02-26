import { NextResponse } from 'next/server'
import { createClient } from '@/app/api/server/serverClient'

export async function POST() {
  // create server client instance
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}