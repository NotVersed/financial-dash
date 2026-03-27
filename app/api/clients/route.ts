import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CLIENT_TABLE_NAME } from '@/app/dashboard/clients/dataInformation'

export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from(CLIENT_TABLE_NAME)
        .select('*')
        .order('client_name', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
}
export async function POST(request: Request) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
        client_name,
        current_credit_score,
        current_net_worth,
        current_net_income,
        notes,
        goal_net_income,
        goal_net_worth,
        goal_credit_score,
    } = body

    if (!client_name || typeof client_name !== 'string' || !client_name.trim()) {
        return NextResponse.json(
            { error: 'Client name is required' },
            { status: 400 }
        )
    }

    const { data, error } = await supabase
        .from(CLIENT_TABLE_NAME)
        .insert([
            {
                client_name: client_name.trim(),
                current_credit_score,
                current_net_worth,
                current_net_income,
                notes,
                goal_net_income,
                goal_net_worth,
                goal_credit_score,
            },
        ])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
        {
            message: 'Client created successfully',
            clientInfo: data,
        },
        { status: 201 }
    )
}