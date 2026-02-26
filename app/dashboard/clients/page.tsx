import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import Link from 'next/link'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <p className="text-sm text-slate-500 mt-1">Select a client to view their financial progress</p>
      </div>

      {clients && clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client: any) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
              <Card className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {client.name?.charAt(0) || '?'}
                    </div>
                    {client.name || 'Unnamed Client'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm text-slate-500">Status:
                    <span className={`ml-1 font-medium ${client.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>
                      {client.status || 'N/A'}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">Email: {client.email || 'N/A'}</p>
                  <p className="text-xs text-slate-400 mt-2">Click to view full profile →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No clients yet</p>
            <p className="text-slate-400 text-sm mt-1">Clients added to your database will appear here</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
