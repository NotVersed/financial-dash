'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AreaChart, BarChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const creditScoreData = [
  { month: 'Jan', score: 580 },
  { month: 'Feb', score: 595 },
  { month: 'Mar', score: 610 },
  { month: 'Apr', score: 605 },
  { month: 'May', score: 625 },
  { month: 'Jun', score: 640 },
  { month: 'Jul', score: 638 },
  { month: 'Aug', score: 655 },
]

const incomeData = [
  { month: 'Jan', income: 2200 },
  { month: 'Feb', income: 2400 },
  { month: 'Mar', income: 2350 },
  { month: 'Apr', income: 2600 },
  { month: 'May', income: 2750 },
  { month: 'Jun', income: 2900 },
  { month: 'Jul', income: 3100 },
  { month: 'Aug', income: 3250 },
]

const netWorthData = [
  { month: 'Jan', worth: 5000 },
  { month: 'Feb', worth: 5400 },
  { month: 'Mar', worth: 5200 },
  { month: 'Apr', worth: 6100 },
  { month: 'May', worth: 6800 },
  { month: 'Jun', worth: 7200 },
  { month: 'Jul', worth: 7800 },
  { month: 'Aug', worth: 8500 },
]

const distributionData = [
  { range: '300-499', clients: 3 },
  { range: '500-599', clients: 8 },
  { range: '600-649', clients: 12 },
  { range: '650-699', clients: 15 },
  { range: '700-749', clients: 10 },
  { range: '750+', clients: 6 },
]

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

      {/* Credit Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Credit Score Trend</CardTitle>
          <CardDescription>Average across all clients over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={creditScoreData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[500, 700]} />
              <Tooltip formatter={(v) => [`${v}`, 'Avg Credit Score']} />
              <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Net Income Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Net Income Growth</CardTitle>
          <CardDescription>Average monthly net income across clients</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={incomeData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Net Income']} />
              <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#colorIncome)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Net Worth Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Net Worth Progress</CardTitle>
          <CardDescription>Average client net worth growth</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={netWorthData}>
              <defs>
                <linearGradient id="colorWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Net Worth']} />
              <Area type="monotone" dataKey="worth" stroke="#10b981" strokeWidth={2} fill="url(#colorWorth)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Credit Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Credit Score Distribution</CardTitle>
          <CardDescription>Number of clients per score range</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v}`, 'Clients']} />
              <Bar dataKey="clients" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  )
}
