import PDFDocument from 'pdfkit'

type PDFDocType = InstanceType<typeof PDFDocument>

export function drawBarChart(
  doc: PDFDocType,
  x: number, y: number,
  width: number, height: number,
  bars: { label: string; currentVal: number; goalVal: number }[],
  maxVal: number,
  formatVal: (n: number) => string
) {
  const barWidth = 28
  const groupGap = 60
  const chartBottom = y + height

  const gridLines = 4
  for (let i = 0; i <= gridLines; i++) {
    const lineY = y + (height / gridLines) * i
    const val = maxVal - (maxVal / gridLines) * i
    doc.moveTo(x, lineY).lineTo(x + width, lineY)
       .strokeColor('#E5E5E5').lineWidth(0.5).stroke()
    doc.fontSize(8).fillColor('#999').text(formatVal(val), x - 42, lineY - 5, { width: 38, align: 'right' })
  }

  bars.forEach((bar, i) => {
    const groupX = x + 20 + i * groupGap

    const curH = (bar.currentVal / maxVal) * height
    doc.rect(groupX, chartBottom - curH, barWidth, curH)
       .fillColor('#1D9E75').fill()
    doc.fontSize(8).fillColor('#1D9E75')
       .text(formatVal(bar.currentVal), groupX - 4, chartBottom - curH - 12, { width: barWidth + 8, align: 'center' })

    const goalH = (bar.goalVal / maxVal) * height
    doc.rect(groupX + barWidth + 4, chartBottom - goalH, barWidth, goalH)
       .fillColor('#AFA9EC').fill()
    doc.fontSize(8).fillColor('#534AB7')
       .text(formatVal(bar.goalVal), groupX + barWidth, chartBottom - goalH - 12, { width: barWidth + 8, align: 'center' })

    const gap = bar.goalVal - bar.currentVal
    if (gap > 0) {
      const gapY = chartBottom - goalH - 22
      doc.fontSize(8).fillColor('#D85A30')
         .text(`+${formatVal(gap)}`, groupX, gapY, { width: barWidth * 2 + 4, align: 'center' })
    }

    doc.fontSize(8).fillColor('#999')
       .text(bar.label, groupX - 4, chartBottom + 6, { width: barWidth * 2 + 12, align: 'center' })
  })
}