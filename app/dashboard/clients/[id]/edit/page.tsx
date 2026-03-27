export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import ClientEditForm from '../ClientEditForm'
import { ArrowLeft } from 'lucide-react'



type ClientInfo = {
  id: number
  client_name: string
  current_credit_score: number | null
  current_net_worth: number | null
  current_net_income: number | null
  notes: string | null
  goal_net_income: number | null
  goal_net_worth: number | null
  goal_credit_score: number | null
}

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()

  const res = await fetch(`http://localhost:3000/api/clients/${id}`, {
    headers: {
      cookie: cookieStore.toString(),
    },
    cache: 'no-store',
  })

  if (res.status === 401) {
    redirect('/login')
  }

  if (res.status === 404) {
    notFound()
  }

  if (!res.ok) {
    throw new Error('Failed to fetch client info')
  }

  const data: { clientInfo: ClientInfo } = await res.json()
  const client = data.clientInfo

  const metrics: any[] = []
  const loans: any[] = []
  const milestones: any[] = []

    return (
        <div className="p-8">
            <div className="mb-6">
            <Link
                href={`/dashboard/clients/${id}`}
                className="text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 inline-block mr-1" />
                Back to Client
            </Link>
        </div>
            <ClientEditForm client={client} />
        </div>
    )
}
