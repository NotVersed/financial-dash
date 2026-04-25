import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { createClient } from '@/lib/supabase/server'
import { CLIENT_TABLE_NAME } from '@/app/dashboard/clients/dataInformation'
import { buildStats } from './stats'
import { drawBarChart } from './chart'

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

    const stats = buildStats(data)

    const formatMoney = (n: number) => {
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
        if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
        return `$${n}`
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

    doc.addPage()
    doc.font('Helvetica-Bold').fontSize(16).text('Portfolio Summary', { align: 'center' })
    // Legend
    const legendY = doc.y
    doc.rect(80, legendY, 10, 10).fillColor('#1D9E75').fill()
    doc.fontSize(9).fillColor('#1D9E75').text('Current', 94, legendY + 1)
    doc.rect(150, legendY, 10, 10).fillColor('#AFA9EC').fill()
    doc.fontSize(9).fillColor('#534AB7').text('Goal', 164, legendY + 1)
    doc.rect(200, legendY, 10, 10).fillColor('#D85A30').fill()
    doc.fontSize(9).fillColor('#D85A30').text('Gap to goal', 214, legendY + 1)
    doc.moveDown(2)

    doc.font('Helvetica-Bold').fontSize(10).fillColor('black').text('Credit Score', 130, 115)
    drawBarChart(doc, 80, 140, 480, 100, [
    { label: 'mean',   currentVal: stats.creditScore.mean,   goalVal: stats.goalCreditScore.mean },
    { label: 'median', currentVal: stats.creditScore.median, goalVal: stats.goalCreditScore.median },
    ], 900, (n) => Math.round(n).toString())

    doc.font('Helvetica-Bold').fontSize(10).fillColor('black').text('Net Worth', 130, 275)
    drawBarChart(doc, 80, 300, 480, 100, [
    { label: 'mean',   currentVal: stats.netWorth.mean,   goalVal: stats.goalNetWorth.mean },
    { label: 'median', currentVal: stats.netWorth.median, goalVal: stats.goalNetWorth.median },
    ], Math.max(stats.netWorth.max, stats.goalNetWorth.max) * 1.2, formatMoney)

    doc.font('Helvetica-Bold').fontSize(10).fillColor('black').text('Net Income', 130, 435)
    drawBarChart(doc, 80, 460, 480, 100, [
    { label: 'mean',   currentVal: stats.netIncome.mean,   goalVal: stats.goalNetIncome.mean },
    { label: 'median', currentVal: stats.netIncome.median, goalVal: stats.goalNetIncome.median },
    ], Math.max(stats.netIncome.max, stats.goalNetIncome.max) * 1.2, formatMoney)

    doc.end()

    const pdfBuffer = await pdfPromise

    return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="clients.pdf"`,
        },
    })
}