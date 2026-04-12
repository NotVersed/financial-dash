import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
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

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Clients')

    sheet.columns = headers.map(h => ({
        header: h,
        key: h,
    }))

    data.forEach(client => {
        const row: any = {}

        headers.forEach(h => {
            row[h] = client[h] ?? ''
        })

        sheet.addRow(row)
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
        headers: {
            'Content-Type':
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="clients.xlsx"`,
        },
    })
}