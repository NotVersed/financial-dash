'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const deactivated = searchParams.get('deactivated') === '1'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
  }

  // const handleSignUp = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   setError(null)

  //   try {
  //     const res = await fetch('/api/auth/signup', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email, password }),
  //     })

  //     const data = await res.json()
  //     if (!res.ok) throw new Error(data.error || 'Sign up failed')

  //     setError('Check your email for the confirmation link!')
  //   } catch (err: any) {
  //     setError(err.message)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  return (
    // Neutral Gray Background
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100 p-4">

      {/* Logo/Brand */}
      <div className="absolute top-8 left-8">
        <h2 className="text-2xl font-bold text-slate-800">LIFE</h2>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-slate-200">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold text-slate-800">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Client Financial Progress Tracking System
          </CardDescription>
        </CardHeader>

        <CardContent>
          {deactivated && !error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Account deactivated, please contact your administrator.
            </div>
          )}

          {forgotPasswordMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {resetSent ? (
                <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                  Password reset email sent! Check your inbox.
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-600">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </p>
                  <div className="space-y-2">
                    <label htmlFor="reset-email" className="text-sm font-semibold text-slate-700">
                      Email Address
                    </label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    />
                  </div>
                  {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-700 hover:bg-slate-800 text-white font-semibold shadow-md"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                </>
              )}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setForgotPasswordMode(false); setResetSent(false); setError(null) }}
                  className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>

            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              {/* Neutral Gray Buttons */}
              <Button
                type="submit"
                className="h-11 bg-slate-700 hover:bg-slate-800 text-white font-semibold shadow-md"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Create Account button hidden — accounts are managed manually by admins */}
              {/* <Button
                type="button"
                variant="outline"
                className="h-11 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                onClick={handleSignUp}
                disabled={loading}
              >
                Create Account
              </Button> */}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setForgotPasswordMode(true); setError(null) }}
                className="text-sm text-slate-600 hover:text-slate-800 font-medium"
              >
                Forgot password?
              </button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-sm text-slate-500">
        <p>© 2026 LIFE Programs. All rights reserved.</p>
      </div>
    </div>
  )
}
