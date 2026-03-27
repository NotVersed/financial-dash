import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { Search } from 'lucide-react'
import Link from 'next/link'
import ClientList from './ClientList'  

import { CLIENT_NAME_COL, CLIENT_TABLE_NAME } from './dataInformation.js'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from(CLIENT_TABLE_NAME)
    .select('*')
    .order(CLIENT_NAME_COL, { ascending: true })
 
   
return (
  
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        {/**<p className="text-sm text-slate-500 mt-1">Select a client to view their financial progress</p>*/}
        <ClientList clients={clients || []}/>
      </div>
    </div>
     
)

}
