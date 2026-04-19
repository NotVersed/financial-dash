import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientList from './ClientList'
import {
  CLIENT_TABLE_NAME,
  mergeClientWithMetrics
} from './dataInformation'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch clients
  const { data: clients } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select('*')

  // Fetch financial metrics
  const { data: metrics } = await supabase
    .from('financial_metrics')
    .select('*')
    .order('updated_at', { ascending: false })

  // Merge them
  const combinedClients = mergeClientWithMetrics(
    clients ?? [],
    metrics ?? []
  )

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>

        <ClientList clients={combinedClients} />
      </div>
    </div>
  )
}