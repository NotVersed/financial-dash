import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validatePassword } from '@/app/api/utils/password-validator'

type RouteContext = {
  params: Promise<{
    id: string
  }> | {
    id: string
  }
}

type RequesterContext = {
  requesterId: string
}

async function requireActiveAdmin(): Promise<RequesterContext | NextResponse> {
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

  return { requesterId: user.id }
}

function getTargetUserId(params: { id: string }) {
  return typeof params.id === 'string' ? params.id.trim() : ''
}

async function resolveRouteParams(context: RouteContext) {
  return await Promise.resolve(context.params)
}

function handleAdminClientError(error: unknown) {
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

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await requireActiveAdmin()
    if (adminCheck instanceof NextResponse) {
      return adminCheck
    }

    const params = await resolveRouteParams(context)
    const targetUserId = getTargetUserId(params)
    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const payload = await req.json()
    const role = typeof payload.role === 'string' ? payload.role.trim() : null
    const isActive =
      typeof payload.isActive === 'boolean'
        ? payload.isActive
        : null

    if (role === null && isActive === null) {
      return NextResponse.json(
        { error: 'At least one field is required: role or isActive' },
        { status: 400 }
      )
    }

    if (role !== null && role.length === 0) {
      return NextResponse.json({ error: 'Role cannot be empty' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: existingUserData, error: existingUserError } = await adminClient.auth.admin.getUserById(targetUserId)
    if (existingUserError || !existingUserData.user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 })
    }

    const usersUpdate: Record<string, unknown> = {}
    if (role !== null) usersUpdate.role = role
    if (isActive !== null) usersUpdate.is_active = isActive

    const { error: usersUpdateError } = await adminClient
      .from('users')
      .update(usersUpdate as never)
      .eq('id', targetUserId)

    if (usersUpdateError) {
      return NextResponse.json({ error: usersUpdateError.message }, { status: 400 })
    }

    if (role !== null) {
      const appMetadata = existingUserData.user.app_metadata || {}
      const userMetadata = existingUserData.user.user_metadata || {}

      const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(targetUserId, {
        app_metadata: {
          ...appMetadata,
          role,
        },
        user_metadata: userMetadata,
      })

      if (authUpdateError) {
        return NextResponse.json({ error: authUpdateError.message }, { status: 400 })
      }
    }

    return NextResponse.json({
      message: 'User account updated successfully.',
      userId: targetUserId,
      role: role ?? undefined,
      isActive: isActive ?? undefined,
    })
  } catch (error) {
    console.error('Admin user update failed:', error)
    return handleAdminClientError(error)
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await requireActiveAdmin()
    if (adminCheck instanceof NextResponse) {
      return adminCheck
    }

    const params = await resolveRouteParams(context)
    const targetUserId = getTargetUserId(params)
    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const payload = await req.json()
    const newPassword = typeof payload.newPassword === 'string' ? payload.newPassword : ''

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    })

    if (authUpdateError) {
      return NextResponse.json({ error: authUpdateError.message }, { status: 400 })
    }

    const { error: userStatusError } = await adminClient
      .from('users')
      .update({ is_active: true } as never)
      .eq('id', targetUserId)

    if (userStatusError) {
      return NextResponse.json({ error: userStatusError.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Password reset successfully.',
      userId: targetUserId,
    })
  } catch (error) {
    console.error('Admin password reset failed:', error)
    return handleAdminClientError(error)
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await requireActiveAdmin()
    if (adminCheck instanceof NextResponse) {
      return adminCheck
    }

    const { requesterId } = adminCheck
    const params = await resolveRouteParams(context)
    const targetUserId = getTargetUserId(params)

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (requesterId === targetUserId) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(targetUserId)
    if (deleteAuthError) {
      return NextResponse.json({ error: deleteAuthError.message }, { status: 400 })
    }

    const { error: deleteProfileError } = await adminClient
      .from('users')
      .delete()
      .eq('id', targetUserId)

    if (deleteProfileError) {
      return NextResponse.json({ error: deleteProfileError.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'User account deleted successfully.',
      userId: targetUserId,
    })
  } catch (error) {
    console.error('Admin user delete failed:', error)
    return handleAdminClientError(error)
  }
}
