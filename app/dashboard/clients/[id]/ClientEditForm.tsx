'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

type ClientInfo = {
  id: number
  first_name: string
  last_name: string
  email: string
  status: string
  current_credit_score: number | null
  current_net_worth: number | null
  current_net_income: number | null
  notes: string | null
  goal_credit_score: number | null
  goal_net_income: number | null
  goal_net_worth: number | null
}

type Props = {
  client: ClientInfo
}

export default function ClientEditForm({ client }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<{
    first_name: string
    last_name: string
    email: string
    status: string
    current_credit_score: string | number
    current_net_worth: string | number
    current_net_income: string | number
    goal_credit_score: string | number
    goal_net_worth: string | number
    goal_net_income: string | number
    notes: string
  }>({
    first_name: client.first_name ?? '',
    last_name: client.last_name ?? '',
    email: client.email ?? '',
    status: client.status ?? 'active',
    current_credit_score: client.current_credit_score ?? '',
    current_net_worth: client.current_net_worth ?? '',
    current_net_income: client.current_net_income ?? '',
    goal_credit_score: client.goal_credit_score ?? '',
    goal_net_worth: client.goal_net_worth ?? '',
    goal_net_income: client.goal_net_income ?? '',
    notes: client.notes ?? '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  function toNullableNumber(value: string | number) {
    const str = String(value).trim()
    if (!str) return null

    const num = Number(str)
    return Number.isNaN(num) ? null : num
  }

  function formatCurrencyInput(value: string | number) {
    const str = String(value).trim()
    if (!str) return ''

    const num = Number(str)
    if (Number.isNaN(num)) return ''

    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      setError('First name, last name, and email are required.')
      return
    }

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      status: formData.status,
      current_credit_score: toNullableNumber(formData.current_credit_score),
      current_net_income: toNullableNumber(formData.current_net_income),
      current_net_worth: toNullableNumber(formData.current_net_worth),
      goal_credit_score: toNullableNumber(formData.goal_credit_score),
      goal_net_income: toNullableNumber(formData.goal_net_income),
      goal_net_worth: toNullableNumber(formData.goal_net_worth),
      notes: formData.notes.trim() || null,
    }

    const res = await fetch(`/api/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    const data = text ? JSON.parse(text) : null

    if (!res.ok) {
      setError(data?.error || 'Failed to update client')
      return
    }

    setSuccess('Client updated successfully!')

    startTransition(() => {
      router.push(`/dashboard/clients/${client.id}`)
      router.refresh() // ensures fresh data after navigation
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold text-slate-900">
            Edit Client Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                First Name *
              </label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Last Name *
              </label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full input"
              />
            </div>

            <div className="md:col-span-2">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Financial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Credit Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between mb-3">
                  <p className="text-sm font-medium">Credit Score</p>
                  <CreditCard className="w-5 h-5 text-blue-500" />
                </div>
                <input
                  name="current_credit_score"
                  type="number"
                  value={formData.current_credit_score}
                  onChange={handleChange}
                  className="w-full input text-2xl"
                />
              </CardContent>
            </Card>

            {/* Income */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between mb-3">
                  <p className="text-sm font-medium">Net Income</p>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <input
                  name="current_net_income"
                  type="number"
                  value={formData.current_net_income}
                  onChange={handleChange}
                  className="w-full input text-2xl"
                />
                <p className="text-sm mt-2">
                  {formatCurrencyInput(formData.current_net_income) || '—'}
                </p>
              </CardContent>
            </Card>

            {/* Net Worth */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between mb-3">
                  <p className="text-sm font-medium">Net Worth</p>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <input
                  name="current_net_worth"
                  type="number"
                  value={formData.current_net_worth}
                  onChange={handleChange}
                  className="w-full input text-2xl"
                />
                <p className="text-sm mt-2">
                  {formatCurrencyInput(formData.current_net_worth) || '—'}
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Messages */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>

            <Link href={`/dashboard/clients/${client.id}`} className="btn-secondary">
              Cancel
            </Link>
          </div>

        </CardContent>
      </Card>
    </form>
  )
}