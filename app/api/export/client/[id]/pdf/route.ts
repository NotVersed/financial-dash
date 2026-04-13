import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { createClient } from '@/lib/supabase/server'
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

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const doc = new PDFDocument()

    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
    })

    const pdfPromise = new Promise<Buffer>((resolve) => {
        doc.on('end', () => {
            resolve(Buffer.concat(chunks))
        })
    })

    doc.fontSize(20).text('Client Report', { align: 'center' })
    doc.moveDown()

    doc.fontSize(12)

    doc.text(`Client ID: ${data.client_id}`)
    doc.text(`Name: ${data.first_name} ${data.last_name}`)
    doc.text(`Email: ${data.email}`)
    doc.text(`Date of Birth: ${data.client_dob || 'N/A'}`)
    doc.moveDown()

    doc.text(`Current Credit Score: ${data.current_credit_score}`)
    doc.text(`Current Net Worth: ${data.current_net_worth}`)
    doc.text(`Current Net Income: ${data.current_net_income}`)
    doc.moveDown()

    doc.text(`Goal Credit Score: ${data.goal_credit_score}`)
    doc.text(`Goal Net Worth: ${data.goal_net_worth}`)
    doc.text(`Goal Net Income: ${data.goal_net_income}`)
    doc.moveDown()

    doc.text(`Created: ${data.created}`)
    doc.text(`Last Updated: ${data.last_updated}`)

    doc.end()

    const pdfBuffer = await pdfPromise

    return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="client-${id}.pdf"`,
        },
    })
}