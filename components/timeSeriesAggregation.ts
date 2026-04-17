export type Granularity = 'day' | 'week' | 'month' | 'year'

export type TimeSeriesMetrics = {
  date: string
  avgIncome: number
  avgNetWorth: number
  avgCreditScore: number
  totalClients: number 
}

type Bucket = {
  key: string
  incomes: number[]
  worths: number[]
  scores: number[]
  clients: number[]
}

// ISO week helper
function getISOWeek(date: Date) {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = temp.getUTCDay() || 7
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1))
  return Math.ceil((((temp as any) - (yearStart as any)) / 86400000 + 1) / 7)
}

function getBucketKey(date: Date, granularity: Granularity) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()

  switch (granularity) {
    case 'day':
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    case 'week':
      return `${y}-W${getISOWeek(date)}`
    case 'month':
      return `${y}-${String(m).padStart(2, '0')}`
    case 'year':
      return `${y}`
    default:
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
}

export function aggregateMetrics(
  metrics: TimeSeriesMetrics[],
  granularity: Granularity
): TimeSeriesMetrics[] {
  const map = new Map<string, Bucket>()

  for (const m of metrics) {
    const date = new Date(m.date)
    const key = getBucketKey(date, granularity)

    if (!map.has(key)) {
      map.set(key, {
        key,
        incomes: [],
        worths: [],
        scores: [],
        clients: [],
      })
    }

    const bucket = map.get(key)!

    bucket.incomes.push(m.avgIncome)
    bucket.worths.push(m.avgNetWorth)
    bucket.scores.push(m.avgCreditScore)
    bucket.clients.push(m.totalClients) // ✅ NEW
  }

  return Array.from(map.values()).map(b => ({
    date: b.key,
    avgIncome: Math.round(b.incomes.reduce((a, v) => a + v, 0) / b.incomes.length),
    avgNetWorth: Math.round(b.worths.reduce((a, v) => a + v, 0) / b.worths.length),
    avgCreditScore: Math.round(b.scores.reduce((a, v) => a + v, 0) / b.scores.length),

    // CRITICAL: use LAST value (not average)
    totalClients: b.clients[b.clients.length - 1],
  }))
}