'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

// Mock Data
const userGrowthData = [
  { day: 'Mon', users: 5 },
  { day: 'Tue', users: 8 },
  { day: 'Wed', users: 12 },
  { day: 'Thu', users: 18 },
  { day: 'Fri', users: 24 },
  { day: 'Sat', users: 30 },
  { day: 'Sun', users: 36 },
]



// Futuristic Glassmorphic Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-lg p-3 shadow-2xl flex flex-col gap-1.5 min-w-[120px]">
        <p className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="text-xs text-zinc-400 capitalize">{item.name}:</span>
            <span className="text-xs font-semibold tabular-nums" style={{ color: item.color }}>
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

interface UserGrowth {
  day: string
  users: number
}

interface ChartData {
  day: string
  uploads: number
}

interface AnalyticsChartsProps {
  userGrowthData: UserGrowth[]
  videoUploadsData: ChartData[]
}

export default function AnalyticsCharts({
  userGrowthData,
  videoUploadsData,
}: AnalyticsChartsProps) {

  const totalUploads = videoUploadsData.reduce(
    (total, item) => total + item.uploads,
    0
  )

  
  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6 shadow-xl max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-md font-medium tracking-tight text-zinc-100 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Platform Analytics
          </h2>
          <p className="text-xs text-zinc-500">Live operational telemetry</p>
        </div>

        <span className="text-[11px] font-medium tracking-wider text-zinc-400 bg-zinc-800/50 px-2.5 py-1 rounded-md border border-zinc-700/30 uppercase">
          Last 7 Days
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Growth Chart */}
        <div className="bg-zinc-950/40 rounded-xl p-5 border border-zinc-800/60 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">User Growth</h3>
<p className="text-xl font-semibold text-zinc-100 tracking-tight mt-1">
  {userGrowthData.reduce((sum, item) => sum + item.users, 0)}
</p>
          </div>

          <div className="h-52 w-100">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="users"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 0 }}
                  activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#09090b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Video Uploads Chart */}
        <div className="bg-zinc-950/40 rounded-xl p-5 border border-zinc-800/60 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Video Uploads</h3>
           <p className="text-xl font-semibold text-zinc-100 tracking-tight mt-1">
  {totalUploads}
</p>
          </div>

          <div className="h-52 w-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={videoUploadsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="uploads"
                  name="uploads"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cyanGlow)"
                  dot={{ r: 0 }}
                  activeDot={{ r: 4, stroke: '#06b6d4', strokeWidth: 2, fill: '#09090b' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
