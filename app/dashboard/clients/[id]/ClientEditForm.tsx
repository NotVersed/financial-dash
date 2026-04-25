'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

type ClientInfo = {
  id: number
  client_name: string
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

  const [formData, setFormData] = useState({
    client_name: client.client_name ?? '',
    current_credit_score: client.current_credit_score ?? '',
    current_net_worth: client.current_net_worth ?? '',
    current_net_income: client.current_net_income ?? '',
    goal_credit_score: client.goal_credit_score ?? '',
    goal_net_worth: client.goal_net_worth ?? '',
    goal_net_income: client.goal_net_income ?? '',
    notes: client.notes ?? '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({
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

    const payload = {
      client_name: formData.client_name.trim(),
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    // safe JSON parsing (no crash on empty response)
    const text = await res.text()
    const data = text ? JSON.parse(text) : null

    if (!res.ok) {
      setError(data?.error || 'Failed to update client')
      return
    }

    setSuccess('Client updated successfully!')

    startTransition(() => {
      router.push(`/dashboard/clients/${client.id}`)
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
          {/* Client Name */}
          <div>
            <label htmlFor="client_name" className="mb-2 block text-sm font-medium text-slate-700">
              Client Name
            </label>

            <input
              id="client_name"
              name="client_name"
              type="text"
              value={formData.client_name}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 bg-white px-3 py-2 text-lg font-semibold text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            {/* Credit Score */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Credit Score
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Current recorded score
                    </p>
                  </div>
                  <CreditCard className="w-5 h-5 text-blue-500" />
                </div>

                <input
                  id="current_credit_score"
                  name="current_credit_score"
                  type="number"
                  value={formData.current_credit_score}
                  onChange={handleChange}
                  className="w-full rounded-md border-slate-300 bg-white px-3 py-2 text-3xl font-semibold text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </CardContent>
            </Card>

            {/* Net Income */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Net Income
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Current recorded income
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>

                <input
                  name="current_net_income"
                  type="number"
                  value={formData.current_net_income}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-3xl font-bold text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

                <p className="mt-2 text-sm text-slate-600">
                  Preview: {formatCurrencyInput(formData.current_net_income) || '—'}
                </p>
              </CardContent>
            </Card>

            {/* Net Worth */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Net Worth
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Current recorded net worth
                    </p>
                  </div>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>

                <input
                  name="current_net_worth"
                  type="number"
                  value={formData.current_net_worth}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-3xl font-bold text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

                <p className="mt-2 text-sm text-slate-600">
                  Preview: {formatCurrencyInput(formData.current_net_worth) || '—'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="text-sm font-medium text-green-600">{success}</p>}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>

            <Link
              href={`/dashboard/clients/${client.id}`}
              className="rounded-md bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}