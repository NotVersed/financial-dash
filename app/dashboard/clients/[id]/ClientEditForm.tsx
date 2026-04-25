'use client'

import { useState, useTransition } from 'react'
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
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    first_name: client.first_name ?? '',
    last_name: client.last_name ?? '',
    email: client.email ?? '',
    status: client.status ?? 'active',
    current_credit_score: client.current_credit_score ?? '',
    current_net_worth: client.current_net_worth ??'',
    current_net_income: client.current_net_income ?? '',
    goal_credit_score: client.goal_credit_score ?? '',
    goal_net_worth: client.goal_net_worth ?? '',
    goal_net_income: client.goal_net_income ?? '',
    notes: client.notes ?? '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function toNullableNumber(value: string | number) {
    const strValue = String(value)
    if(strValue.trim() === ''){
      return null
    }
    const num = Number(strValue)

    if(Number.isNaN(num)){
      return null
    }
    return num
  }

  function formatCurrencyInput(value: string | number) {
    const strValue = String(value)
    if(strValue.trim() === ''){
      return ''
    }
    const num = Number(strValue)
    if(Number.isNaN(num)){
      return ''
    }
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>){
    e.preventDefault()
    setError('')

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if(!res.ok){
      setError(data.error || 'Failed to update client')
      return
    }

    if (!res.ok) {
      setError(data.error || 'Failed to update client')
      return
    }

    setSuccess('Client updated successfully!')
    
    startTransition(() => {
      window.location.href = `/dashboard/clients/${client.id}`
    })
    
  }

  return (
  <form onSubmit={handleSubmit} className='space-y-6'>
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-slate-900">
          Edit Client Information
          </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="mb-2 block text-sm font-medium text-slate-700">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="mb-2 block text-sm font-medium text-slate-700">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
              
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

                  <label htmlFor="current_credit_score" className="sr-only">
                    Current Credit Score
                  </label>
                  <input
                    id="current_credit_score"
                    name="current_credit_score"
                    type="number"
                    value={formData.current_credit_score}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-3xl font-bold text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </CardContent> 
              </Card>

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

                <label htmlFor="current_net_income" className="sr-only">
                  Current Net Income
                </label>
                <input
                  id="current_net_income"
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

                <label htmlFor="current_net_worth" className="sr-only">
                  Current Net Worth
                </label>
                <input
                  id="current_net_worth"
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


          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}

          {success ? (
            <p className="text-sm font-medium text-green-600">{success}</p>
          ) : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>

              <Link
                href={`/dashboard/clients/${client.id}`}
                className="rounded-md bg-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

