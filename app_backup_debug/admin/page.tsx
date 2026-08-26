'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowser } from '../lib/supabase-browser'
import DashboardCards from './components/DashboardCards'
import QuickActions from './components/QuickActions'
import RecentActivity from './components/RecentActivity'
import SystemHealth from './components/SystemHealth'
import LatestDrivers from './components/LatestDrivers'
import AnalyticsCharts from './components/AnalyticsCharts'
import { checkAdmin } from '../lib/isAdmin'

import { useRouter } from 'next/navigation'
interface ActivityItem {
  username: string
  created_at: string
}

export default function AdminDashboard() {

  const supabase = getSupabaseBrowser()
  const router = useRouter()
  const [stats, setStats] = useState({ users: 0, videos: 0, drivers: 0 })
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
const [drivers, setDrivers] = useState<any[]>([])
const [userGrowth, setUserGrowth] = useState<any[]>([])
const [videoUploads, setVideoUploads] = useState<any[]>([])
const [authorized, setAuthorized] = useState(false)

useEffect(() => {
  async function verifyAdmin() {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push('/login')
      return
    }

    const admin = await checkAdmin(data.user.id)

if (!admin) {
  router.push('/')
  return
}

    setAuthorized(true)
  }

  verifyAdmin()
}, [])

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        



        // Execute all database calls concurrently to eliminate sequential waiting delays
const [
  usersRes,
  videosRes,
  driversRes,
  activitiesRes,
  latestDriversRes,
  growthRes,
  uploadsRes,
] = await Promise.all([
  // Users count
  supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true }),

  // Videos count
  supabase
    .from('videos')
    .select('*', { count: 'exact', head: true }),

  // Pending drivers count
  supabase
    .from('drivers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending'),

  // Recent users
  supabase
    .from('profiles')
    .select('username, created_at')
    .order('created_at', { ascending: false })
    .limit(5),

  // Latest drivers
  supabase
    .from('drivers')
    .select('full_name, vehicle_type, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5),

    supabase.rpc('user_growth_last_7_days'),
    supabase.rpc('video_uploads_last_7_days'),
])  
    

        setStats({
          users: usersRes.count || 0,
          videos: videosRes.count || 0,
          drivers: driversRes.count || 0,
        })

        setActivities((activitiesRes.data as ActivityItem[]) || [])
        setDrivers(latestDriversRes.data || [])
        setUserGrowth(growthRes.data || [])
        setVideoUploads(uploadsRes.data || [])
        console.log(videoUploads)
        console.log('User Growth:', growthRes.data)
      } catch (error) {
        console.error('Dashboard telemetry data synchronization failure:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])


  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        Checking permissions...
      </div>
    )
  }





  return (
    <main className="min-h-screen w-full bg-[#09090b] text-zinc-50 antialiased p-4 sm:p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6 sm:gap-8">
        
        {/* Navigation / Header Row */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-800/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100">
              StreetGO Studio
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Overview monitoring, global user analytics, and system operations.
            </p>
          </div>
          
          <Link
            href="/admin/videos"
            className="inline-flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-200 active:scale-[0.98] text-zinc-900 transition-all py-2 px-3.5 rounded-lg font-medium text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 12-6.75 4.5v-9l6.75 4.5Z" />
            </svg>
            <span>Video Management</span>
          </Link>
        </header>

        {/* Dashboard Operational Grid Blocks */}
        <DashboardCards stats={stats} loading={loading} />

        <QuickActions />

<AnalyticsCharts
  userGrowthData={userGrowth}
  videoUploadsData={videoUploads}
/>

        <RecentActivity activities={activities} loading={loading} />

<SystemHealth
  users={stats.users}
  videos={stats.videos}
  pendingDrivers={stats.drivers}
/>

<LatestDrivers
  drivers={drivers}
  loading={loading}
/>
      </div>
    </main>
  )
}
