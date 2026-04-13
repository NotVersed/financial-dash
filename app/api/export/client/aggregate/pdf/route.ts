import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
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

    const doc = new PDFDocument({ margin: 40 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))

    const pdfPromise = new Promise<Buffer>((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)))
    })

    doc.fontSize(20).text('All Clients Report', { align: 'center' })
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown()

    data.forEach((client, index) => {
        if (index > 0) {
            doc.addPage()
        }

        doc.font('Helvetica-Bold').fontSize(14).text(`${client.first_name} ${client.last_name}`)
        doc.font('Helvetica').fontSize(12)
        doc.moveDown(0.5)

        doc.fontSize(12)
        doc.text(`Client ID: ${client.client_id}`)
        doc.text(`Name: ${client.first_name} ${client.last_name}`)
        doc.text(`Email: ${client.email}`)
        doc.text(`Date of Birth: ${client.client_dob || 'N/A'}`)
        doc.moveDown()

        doc.text(`Current Credit Score: ${client.current_credit_score}`)
        doc.text(`Current Net Worth: ${client.current_net_worth}`)
        doc.text(`Current Net Income: ${client.current_net_income}`)
        doc.moveDown()

        doc.text(`Goal Credit Score: ${client.goal_credit_score}`)
        doc.text(`Goal Net Worth: ${client.goal_net_worth}`)
        doc.text(`Goal Net Income: ${client.goal_net_income}`)
        doc.moveDown()

        doc.text(`Created: ${client.created}`)
        doc.text(`Last Updated: ${client.last_updated}`)
    })

    doc.end()

    const pdfBuffer = await pdfPromise

    return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="clients.pdf"`,
        },
    })
}