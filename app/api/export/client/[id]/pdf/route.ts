import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { createClient } from '@/lib/supabase/server'
import { CLIENT_TABLE_NAME } from '@/app/dashboard/clients/dataInformation'
import { drawLineChart } from '../../shared/lineChart'

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

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const { data: financial } = await supabase
        .from('financial_info')
        .select('*')
        .eq('client_id', Number(id))
        .order('measurement_date', { ascending: false })
        .limit(1)
        .single()

    const clientWithFinancials = {
        ...data,
        current_credit_score: financial?.credit_score ?? '',
        current_net_worth: financial?.net_worth ?? '',
        current_net_income: financial?.net_income ?? '',
    }

    // Fetch full time series for chart
    const { data: timeSeries } = await supabase
        .from('financial_info')
        .select('measurement_date, credit_score, net_income, net_worth')
        .eq('client_id', Number(id))
        .order('measurement_date', { ascending: true })

    const chartData = (timeSeries ?? []).map(row => ({
        date: row.measurement_date,
        creditScore: row.credit_score ?? 0,
        netIncome: row.net_income ?? 0,
        netWorth: row.net_worth ?? 0,
    }))

    const doc = new PDFDocument({ margin: 40 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))

    const pdfPromise = new Promise<Buffer>((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)))
    })

    doc.fontSize(20).text('Client Report', { align: 'center' })
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown()

    doc.fontSize(12)
    doc.text(`Client ID: ${data.client_id}`)
    doc.text(`Name: ${data.first_name} ${data.last_name}`)
    doc.text(`Email: ${data.email}`)
    doc.text(`Date of Birth: ${data.client_dob || 'N/A'}`)
    doc.moveDown()

    doc.text(`Current Credit Score: ${clientWithFinancials.current_credit_score ?? 'N/A'}`)
    doc.text(`Current Net Worth: ${clientWithFinancials.current_net_worth ?? 'N/A'}`)
    doc.text(`Current Net Income: ${clientWithFinancials.current_net_income ?? 'N/A'}`)
    doc.moveDown()

    doc.text(`Goal Credit Score: ${clientWithFinancials.goal_credit_score ?? 'N/A'}`)
    doc.text(`Goal Net Worth: ${clientWithFinancials.goal_net_worth ?? 'N/A'}`)
    doc.text(`Goal Net Income: ${clientWithFinancials.goal_net_income ?? 'N/A'}`)
    doc.moveDown()

    doc.text(`Created: ${data.created}`)
    doc.text(`Last Updated: ${data.last_updated}`)

    // Chart page
    doc.moveDown()
    doc.moveDown()
    doc.font('Helvetica-Bold').fontSize(14).fillColor('black')
       .text('Financial Trends', { align: 'center' })
    doc.moveDown()

    drawLineChart(doc, 60, doc.y + 10, 480, 200, chartData)

    doc.end()

    const pdfBuffer = await pdfPromise

    return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="client-${id}.pdf"`,
        },
    })
}