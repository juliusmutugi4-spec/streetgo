'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'


export default function VideosPage() {
const router = useRouter()
const [videos, setVideos] = useState<any[]>([])
const [trendingVideos, setTrendingVideos] = useState<any[]>([])
const [featured, setFeatured] = useState<any>(null)
const [loading, setLoading] = useState(true)


useEffect(() => {
  fetchVideos()
}, [])

const fetchVideos = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

if (error) {
  console.log('SUPABASE ERROR:', error)
  alert(JSON.stringify(error))
  return
}

  setVideos(data || [])

const { data: trending } = await supabase
  .from('videos')
  .select('*')
  .order('views', { ascending: false })
  .limit(10)

setTrendingVideos(trending || [])


const featuredMovie =
data?.find((v: any) => v.featured)

setFeatured(featuredMovie)
  setLoading(false)
}

if (loading) {
  return (
    <main className="min-h-screen bg-[#060608] text-white flex items-center justify-center">
      Loading videos...
    </main>
  )
}
return (
  <main className="min-h-screen bg-[#141414] text-[#e5e5e5] font-sans antialiased select-none overflow-x-hidden">
    
    {/* Ambient Background Glows */}
    <div className="absolute inset-0 pointer-events-none z-0">
      <div className="absolute top-0 right-0 w-full h-[60vh] bg-gradient-to-b from-red-900/10 via-transparent to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-full h-[60vh] bg-gradient-to-t from-emerald-950/10 via-transparent to-transparent blur-3xl" />
    </div>

    {/* Z-Indexed Content Wrapper */}
    <div className="relative z-10 space-y-12 pb-24">
      
      {/* 1. HERO BILLBOARD SECTION */}
      {featured && (
        <section className="relative h-[75vh] min-h-[450px] lg:h-[85vh] w-full bg-black flex items-center overflow-hidden">
          {/* Hero Media Background */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={featured.thumbnail_url} 
              alt={featured.title}
              className="w-full h-full object-cover object-top select-none" 
            />
            {/* Cinematic Netflix Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent w-full md:w-[70%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />
          </div>

          {/* Hero Content */}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 transition-all duration-500">
            <div className="max-w-2xl space-y-4">
              {/* Brand Tag */}
              <div className="flex items-center gap-2 tracking-widest text-xs font-black text-red-600 drop-shadow">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                TUNDA ORIGINAL
              </div>
              
              {/* Dynamic Title sizing */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-md leading-[1.1] max-w-xl">
                {featured.title}
              </h1>
              
              {/* Micro-sized Summary Paragraph */}
              <p className="text-sm sm:text-base text-[#gray-300] text-zinc-300 font-medium drop-shadow-sm max-w-md leading-relaxed line-clamp-3">
                {featured.description}
              </p>
              
              {/* Premium Netflix Style Call-To-Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={() => router.push(`/videos/${featured.id}`)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-white text-black font-bold text-sm md:text-base hover:bg-white/80 active:scale-95 transition-all duration-200 shadow-md"
                >
                  <span className="text-lg">▶</span> Play
                </button>
                <button 
                  onClick={() => router.push(`/videos/${featured.id}`)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-zinc-500/30 text-white font-bold text-sm md:text-base hover:bg-zinc-500/40 backdrop-blur active:scale-95 transition-all duration-200"
                >
                  <span className="text-lg">ⓘ</span> More Info
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. ROWS CONTAINER */}
      <div className="space-y-10 px-4 sm:px-6 lg:px-12">
        
        {/* ROW A: RECENTLY ADDED (16:9 Live Previews) */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-lg lg:text-xl font-semibold text-[#e5e5e5] tracking-wide cursor-pointer hover:text-white inline-flex items-center gap-1 group">
            Recently Added <span className="text-[10px] text-sky-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-5px] group-hover:translate-x-0">Explore All &gt;</span>
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {trendingVideos.map((video) => (
              <div 
                key={`recent-${video.id}`} 
                onClick={() => router.push(`/videos/${video.id}`)}
                className="group relative flex-none w-[200px] sm:w-[240px] aspect-video bg-zinc-900 rounded-sm overflow-hidden cursor-pointer snap-start transition-all duration-300 origin-center hover:scale-105 hover:z-30 hover:shadow-2xl hover:shadow-black"
              >
                <video 
                  src={video.video_url} 
                  poster={video.thumbnail_url} 
                  className="w-full h-full object-cover" 
                  muted 
                  preload="none"
                  onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-[11px] font-bold text-white truncate">{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ROW B: CONTINUE WATCHING (Slim Minimal Cards with Micro Progress Bar) */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-lg lg:text-xl font-semibold text-[#e5e5e5] tracking-wide cursor-pointer hover:text-white inline-flex items-center gap-1 group">
            Continue Watching
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {videos.map((video) => (
              <div 
                key={`continue-${video.id}`} 
                onClick={() => router.push(`/videos/${video.id}`)}
                className="group relative flex-none w-[140px] sm:w-[180px] aspect-video bg-zinc-900 rounded-sm overflow-hidden cursor-pointer snap-start transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl"
              >
                <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                {/* Fake Netflix Simulated View Progress bar */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-zinc-600">
                  <div className="h-full bg-red-600 w-[45%]" />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-white/20 border border-white/40 backdrop-blur-sm flex items-center justify-center text-white text-xs">▶</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ROW C: TRENDING NOW (Netflix Style Premium 2:3 Vertical Posters) */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-lg lg:text-xl font-semibold text-[#e5e5e5] tracking-wide cursor-pointer hover:text-white inline-flex items-center gap-1 group">
            Trending Now
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
            {trendingVideos.map((video, index) => (
              <div 
                key={`trend-${video.id}`} 
                onClick={() => router.push(`/videos/${video.id}`)}
                className="group relative flex-none w-[110px] sm:w-[145px] aspect-[2/3] bg-zinc-900 rounded-sm overflow-hidden cursor-pointer snap-start transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl"
              >
                {/* Optional Rank Styling Indicator */}
                <div className="absolute top-1 left-1 bg-black/70 text-[10px] font-black px-1.5 py-0.5 rounded text-zinc-400 z-10">
                  #{index + 1}
                </div>
                <img 
                  src={video.thumbnail_url} 
                  alt={video.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent p-2 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-[10px] font-bold text-white line-clamp-2 leading-tight">{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  </main>
);

}