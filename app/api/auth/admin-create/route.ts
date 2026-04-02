import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validatePassword } from '@/app/api/utils/password-validator'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: requesterProfile, error: requesterProfileError } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (requesterProfileError || !requesterProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (requesterProfile.role !== 'admin' || requesterProfile.is_active !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, password, fullName } = await req.json()
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const trimmedFullName = typeof fullName === 'string' ? fullName.trim() : ''

    if (!trimmedEmail || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
      app_metadata: {
        role: 'admin',
      },
      user_metadata: {
        created_by_admin_id: user.id,
        full_name: trimmedFullName || null,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const createdUserId = data.user?.id
    if (!createdUserId) {
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
    }

    const { error: profileUpsertError } = await (adminClient.from('users') as any).upsert({
        id: createdUserId,
        email: trimmedEmail,
        full_name: trimmedFullName || null,
        role: 'admin',
        is_active: true,
      }, { onConflict: 'id' })

    if (profileUpsertError) {
      await adminClient.auth.admin.deleteUser(createdUserId)
      return NextResponse.json({ error: profileUpsertError.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        message: 'Admin account created successfully.',
        userId: createdUserId,
        email: trimmedEmail,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin create failed:', error)

    if (error instanceof Error && error.message.includes('Missing Supabase admin environment variables')) {
      return NextResponse.json(
        {
          error:
            'Server configuration is missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local and restart the dev server.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
