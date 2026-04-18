import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import ExcelJS from 'exceljs'
import { CLIENT_TABLE_NAME } from '@/app/dashboard/clients/dataInformation'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

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
        .eq('client_id', Number(id))
        .maybeSingle()

    if (error || !data) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Client')

    sheet.columns = [
        { header: 'client_id', key: 'client_id' },
        { header: 'first_name', key: 'first_name' },
        { header: 'last_name', key: 'last_name' },
        { header: 'email', key: 'email' },
        { header: 'client_dob', key: 'client_dob' },
        { header: 'current_credit_score', key: 'current_credit_score' },
        { header: 'current_net_worth', key: 'current_net_worth' },
        { header: 'current_net_income', key: 'current_net_income' },
        { header: 'goal_credit_score', key: 'goal_credit_score' },
        { header: 'goal_net_worth', key: 'goal_net_worth' },
        { header: 'goal_net_income', key: 'goal_net_income' },
        { header: 'created', key: 'created' },
        { header: 'last_updated', key: 'last_updated' },
    ]

    sheet.addRow(data)

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
        headers: {
            'Content-Type':
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="client-${id}.xlsx"`,
        },
    })
}