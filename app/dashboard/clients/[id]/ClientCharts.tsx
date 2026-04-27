'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type Props = {
  data: {
    date: string
    creditScore: number | null
    netIncome: number | null
    netWorth: number | null
  }[],
  creditScoreStroke?: string
  netIncomeStroke?: string 
  netWorthStroke?: string
  strokeWidth?: number
}

export default function ClientChart({
  data,
  creditScoreStroke = "#61a25d",
  netIncomeStroke = "#EE99AA",
  netWorthStroke = "#6699CC",
  strokeWidth = 3
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />

        <Legend wrapperStyle={{ fontSize: 18 }} />

        <Line
          type="monotone"
          dataKey="creditScore"
          stroke={creditScoreStroke}
          name="Credit Score"
          strokeWidth={strokeWidth}
        />

        <Line
          type="monotone"
          dataKey="netIncome"
          stroke={netIncomeStroke}
          name="Net Income"
          strokeWidth={strokeWidth}
        />

        <Line
          type="monotone"
          dataKey="netWorth"
          stroke={netWorthStroke}
          name="Net Worth"
          strokeWidth={strokeWidth}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}