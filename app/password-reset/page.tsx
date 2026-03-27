'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  if (!/[^A-Za-z0-9\s]/.test(password)) return 'Password must contain a special character'
  if (!/[0-9]/.test(password)) return 'Password must contain a number'
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return 'Password must have both uppercase and lowercase letters'
  }
  return null
}

export default function PasswordResetPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [recoveryReady, setRecoveryReady] = useState(false)

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setRecoveryReady(Boolean(data.session))
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryReady(true)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess('Password updated successfully. Redirecting to sign in...')

    setTimeout(async () => {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100 p-4">
      <div className="absolute top-8 left-8">
        <h2 className="text-2xl font-bold text-slate-800">LIFE</h2>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-slate-200">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold text-slate-800">Reset Password</CardTitle>
          <CardDescription className="text-base text-slate-600">
            Choose a new password for your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {recoveryReady ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>

              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
              )}

              {success && (
                <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-slate-700 hover:bg-slate-800 text-white font-semibold shadow-md"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-600">
                This reset link is invalid or expired. Request a new password reset email.
              </p>
              <Button asChild className="w-full h-11 bg-slate-700 hover:bg-slate-800 text-white font-semibold shadow-md">
                <Link href="/login">Back to Sign In</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="absolute bottom-8 text-center text-sm text-slate-500">
        <p>© 2026 LIFE Programs. All rights reserved.</p>
      </div>
    </div>
  )
}
