'use client'

import { useMemo, useState } from 'react'

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card'

import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

import type { TimeSeriesMetrics } from '../components/timeSeriesAggregation'
import { aggregateMetrics, type Granularity } from '../components/timeSeriesAggregation'

type DashboardChartsProps = {
  metrics?: TimeSeriesMetrics[]
}

/**
 * Formats X-axis labels for readability
 */
function formatXAxisLabel(value: string, granularity: Exclude<Granularity, 'week'>) {
  if (!value) return ''

  switch (granularity) {
    case 'day': {
      // 2026-04-23 → 04/23
      const [, m, d] = value.split('-')
      return `${m}/${d}`
    }

    case 'month': {
      // 2026-04 → Apr '26
      const [y, m] = value.split('-')
      const date = new Date(Number(y), Number(m) - 1)
      return date.toLocaleString('en-US', { month: 'short' }) + ` '${String(y).slice(2)}`
    }

    case 'year':
      return value

    default:
      return value
  }
}

export default function DashboardCharts({ metrics = [] }: DashboardChartsProps) {

  const [granularity, setGranularity] = useState<Exclude<Granularity, 'week'>>('month')

  const chartData = useMemo(() => {
    const aggregated = aggregateMetrics(metrics, granularity)

    return aggregated.map(m => ({
      date: m.date,
      income: m.avgIncome,
      worth: m.avgNetWorth,
      score: m.avgCreditScore,
      clients: m.totalClients,
    }))
  }, [metrics, granularity])

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-slate-400 mb-8">
        No financial data yet (add metrics to see trends)
      </p>
    )
  }

  const granularityOptions: Exclude<Granularity, 'week'>[] = ['day', 'month', 'year']

  return (
    <div className="space-y-4 mb-8">

      {/* Controls */}
      <div className="flex gap-2">
        {granularityOptions.map(option => (
          <button
            key={option}
            onClick={() => setGranularity(option)}
            className={`px-3 py-1 rounded text-sm border ${
              granularity === option
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Credit Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Credit Score Trend
            </CardTitle>
            <CardDescription>
              Average across all clients over time
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatXAxisLabel(v, granularity)}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />

                <YAxis domain={[500, 850]} />
                <Tooltip />
                <Area dataKey="score" stroke="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Income */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Net Income Growth
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatXAxisLabel(v, granularity)}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />

                <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Area dataKey="income" stroke="#22c55e" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Net Worth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Net Worth Progress
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatXAxisLabel(v, granularity)}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />

                <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Area dataKey="worth" stroke="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Clients Over Time
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatXAxisLabel(v, granularity)}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />

                <YAxis />
                <Tooltip />
                <Area dataKey="clients" stroke="#8b5cf6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}