"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Search } from 'lucide-react'
import Link from 'next/link'

type Client = {
  id: string | number
  client_name?: string
  email?: string
  status?: string
  name?: string
}

type ClientListProps = {
  clients?: Client[]
}

export default function ClientList({ clients = [] }: ClientListProps) {
  const [search, setSearch] = useState('')

  const filteredClients = clients.filter((client) => {
    const searchLower = search.toLowerCase()

    return (
      client.client_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <>
      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {/* Client Grid */}
      {filteredClients && filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client: any) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
              <Card className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {client.name?.charAt(0) || '?'}
                    </div>
                    {client.client_name || 'Unnamed Client'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm text-slate-500">
                    Status:
                    <span
                      className={`ml-1 font-medium ${
                        client.status === 'active'
                          ? 'text-green-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {client.status || 'N/A'}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">
                    Email: {client.email || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Click to view full profile →
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No matching clients</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}