'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

interface RevenueData {
  day: string
  revenue: number
}

export default function RevenueChart({ data }: { data: RevenueData[] }) {
  // Format currency dynamically for the Y-Axis and Tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl backdrop-blur-sm mt-8">
      {/* Header section */}
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-zinc-50">
          Revenue Growth
        </h2>
        <p className="text-sm text-zinc-400">
          Daily overview of financial performance.
        </p>
      </div>

      {/* Chart container */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            {/* Subtle, dashed grid background */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#27272a" /* zinc-800 */
              vertical={false} 
            />

            {/* X Axis styling */}
            <XAxis
              dataKey="day"
              stroke="#71717a" /* zinc-500 */
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            {/* Y Axis styling with clean formatting */}
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
              dx={-5}
            />

            {/* Ultra-clean custom glassmorphism tooltip */}
            <Tooltip
              cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-3 shadow-2xl backdrop-blur-md">
                      <p className="text-xs font-medium text-zinc-400 mb-1">
                        {payload[0].payload.day}
                      </p>
                      <p className="text-sm font-bold text-zinc-50">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />

            {/* Main polished line */}
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e" /* emerald-500 for success/growth */
              strokeWidth={2.5}
              dot={{ r: 4, stroke: '#09090b', strokeWidth: 2, fill: '#22c55e' }}
              activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2, fill: '#4ade80' }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
