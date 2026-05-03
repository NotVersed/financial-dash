import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CLIENT_TABLE_NAME } from '@/app/dashboard/clients/dataInformation'

export async function GET() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from(CLIENT_TABLE_NAME)
        .select('*')

    if (error || !data) {
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }
    const clientsWithFinancials = await Promise.all(
        data.map(async (client) => {
            const { data: financial } = await supabase
                .from('financial_info')
                .select('*')
                .eq('client_id', client.client_id)
                .order('financial_id', { ascending: false }) // IMPORTANT - b/c dates can be from same day for same client, use the financial_info row id to identify latest update
                .limit(1)
                .single()

            return {
                ...client,
                current_credit_score: financial?.credit_score ?? '',
                current_net_worth: financial?.net_worth ?? '',
                current_net_income: financial?.net_income ?? '',
            }
        })
    )

    const headers = [
        'client_id',
        'first_name',
        'last_name',
        'email',
        'client_dob',
        'current_credit_score',
        'current_net_worth',
        'current_net_income',
        'goal_credit_score',
        'goal_net_worth',
        'goal_net_income',
        'created',
        'last_updated',
    ]

    const escape = (val: any) =>
        `"${String(val ?? '').replace(/"/g, '""')}"`

    const rows = clientsWithFinancials.map(client => 
        headers.map(h => escape(client[h])).join(',')
    )

    const csv = [headers.join(','), ...rows].join('\n')

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="clients.csv"`,
        },
    })
}