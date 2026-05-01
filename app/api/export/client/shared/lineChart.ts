import PDFDocument from 'pdfkit'

type PDFDocType = InstanceType<typeof PDFDocument>

export function drawLineChart(
  doc: PDFDocType,
  x: number, y: number,
  width: number, height: number,
  series: { date: string; creditScore: number; netIncome: number; netWorth: number }[]
) {
  if (series.length < 2) {
    doc.fontSize(10).fillColor('#999').text('Not enough data to display chart.', x, y + height / 2)
    return
  }

  const chartBottom = y + height
  const chartRight = x + width
  const padLeft = 50
  const padRight = 10
  const padTop = 10
  const plotX = x + padLeft
  const plotW = width - padLeft - padRight
  const plotH = height - padTop

  // Grid lines
  const gridLines = 4
  for (let i = 0; i <= gridLines; i++) {
    const lineY = y + padTop + (plotH / gridLines) * i
    doc.moveTo(plotX, lineY).lineTo(chartRight - padRight, lineY)
       .strokeColor('#E5E5E5').lineWidth(0.5).stroke()
  }

  // X axis labels (dates)
  const step = Math.max(1, Math.floor(series.length / 4))
  series.forEach((pt, i) => {
    if (i % step === 0 || i === series.length - 1) {
      const px = plotX + (i / (series.length - 1)) * plotW
      doc.fontSize(7).fillColor('#999')
         .text(pt.date.slice(0, 7), px - 15, chartBottom + 4, { width: 30, align: 'center' })
    }
  })

  // Draw a line for a metric
  function drawLine(getValue: (pt: typeof series[0]) => number, color: string) {
    const values = series.map(getValue)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    series.forEach((pt, i) => {
      const px = plotX + (i / (series.length - 1)) * plotW
      const py = y + padTop + plotH - ((getValue(pt) - min) / range) * plotH

      if (i === 0) {
        doc.moveTo(px, py)
      } else {
        doc.lineTo(px, py)
      }
    })
    doc.strokeColor(color).lineWidth(1.5).stroke()
  }

  drawLine(pt => pt.creditScore, '#5da292')
  drawLine(pt => pt.netIncome, '#EE99AA')
  drawLine(pt => pt.netWorth, '#6d66cc')

  // Legend
  const legendY = y + padTop
  doc.rect(plotX, legendY, 8, 8).fillColor('#5da292').fill()
  doc.fontSize(7).fillColor('#5da292').text('Credit Score', plotX + 10, legendY + 1)
  doc.rect(plotX + 70, legendY, 8, 8).fillColor('#EE99AA').fill()
  doc.fontSize(7).fillColor('#EE99AA').text('Net Income', plotX + 80, legendY + 1)
  doc.rect(plotX + 140, legendY, 8, 8).fillColor('#6d66cc').fill()
  doc.fontSize(7).fillColor('#6d66cc').text('Net Worth', plotX + 150, legendY + 1)
}