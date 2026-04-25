export type Granularity = 'day' | 'month' | 'year'

export type TimeSeriesMetrics = {
  date: string
  avgIncome: number
  avgNetWorth: number
  avgCreditScore: number
  totalClients: number
}

/**
 * SQL already provides correct "as-of-date" snapshots.
 * This function ONLY adjusts time granularity for display.
 */
export function aggregateMetrics(
  metrics: TimeSeriesMetrics[],
  granularity: Granularity
): TimeSeriesMetrics[] {
  if (!metrics.length) return []

  const formatKey = (dateStr: string) => {
    const date = new Date(dateStr)

    const y = date.getFullYear()
    const m = date.getMonth() + 1
    const d = date.getDate()

    switch (granularity) {
      case 'day':
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      case 'month':
        return `${y}-${String(m).padStart(2, '0')}`
      case 'year':
        return `${y}`
    }
  }

  const map = new Map<string, TimeSeriesMetrics[]>

  for (const row of metrics) {
    const key = formatKey(row.date)

    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }

  return Array.from(map.entries()).map(([key, values]) => {
    const n = values.length

    return {
      date: key,

      // These are already "true snapshot values" → safe to average ONLY for display
      avgIncome: Math.round(values.reduce((s, v) => s + v.avgIncome, 0) / n),
      avgNetWorth: Math.round(values.reduce((s, v) => s + v.avgNetWorth, 0) / n),
      avgCreditScore: Math.round(values.reduce((s, v) => s + v.avgCreditScore, 0) / n),

      // This is NOT averaged — it's a state value
      totalClients: values[values.length - 1].totalClients,
    }
  })
}