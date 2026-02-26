import { createServerClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() : Promise<SupabaseClient> {
  const cookieStore = await cookies()
  const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll(): {name: string; value: string; options?: Record<string, any>}[] {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, any> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch(err) {
            console.error('Error setting cookies', err)
        }
      },
    },
  })
}