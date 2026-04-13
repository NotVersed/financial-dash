'use client'

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card'
import {
  AreaChart, BarChart, Area, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

type DailyMetrics = {
  date: string
  avgIncome: number
  avgNetWorth: number
  avgCreditScore: number
}

export default function DashboardCharts({ metrics }: { metrics: DailyMetrics[] }) {

  const chartData = metrics.map(m => ({
    date: m.date,
    income: m.avgIncome,
    worth: m.avgNetWorth,
    score: m.avgCreditScore,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

      {/* Credit Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Credit Score Trend</CardTitle>
          <CardDescription>Average across all clients over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[500, 850]} />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleDateString()}
                formatter={(v) => [`${v}`, 'Avg Credit Score']}
              />
              <Area dataKey="score" stroke="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Income */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Income']} />
              <Area dataKey="income" stroke="#22c55e" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Net Worth */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Net Worth']} />
              <Area dataKey="worth" stroke="#10b981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribution (still static for now) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Credit Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">Coming soon</p>
        </CardContent>
      </Card>

    </div>
  )
}