export interface BroadcasterProps {
  liveId?: string
}

export interface LiveSession {
  live_id: string
  title: string
  description?: string | null
  host_id: string
  host_name: string
  location?: string | null
  status: string
  viewer_count: number
  created_at?: string
  started_at?: string | null
  ended_at?: string | null
}