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

    <main className="
min-h-screen
text-white
p-6
bg-black
relative
overflow-hidden
">
<div className="
absolute
top-0
left-0
w-full
h-full
pointer-events-none
bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,.12),transparent_30%)]
"/>

<div className="
absolute
bottom-0
left-0
w-full
h-full
pointer-events-none
bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,.12),transparent_30%)]
"/>

<div className="
absolute
top-1/2
left-1/2
w-full
h-full
pointer-events-none
bg-[radial-gradient(circle,rgba(220,38,38,.08),transparent_50%)]
"/>

{featured && (
  <div
className="
  relative
h-[50vh]
min-h-[320px]
lg:min-h-[500px]
  overflow-hidden
  mb-12
"
  >

<div
  className="
    absolute
    inset-0
    bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,.25),transparent_30%)]
  "
/>

<div
  className="
    absolute
    inset-0
    bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,.25),transparent_30%)]
  "
/>

<div
  className="
    absolute
    inset-0
    bg-[radial-gradient(circle_at_center,rgba(220,38,38,.15),transparent_50%)]
  "
/>

    <img
      src={featured.thumbnail_url}
      className="
        absolute
        inset-0
        w-full
        h-full
        object-cover
      "
    />

    <div
      className="
        absolute
        inset-0
bg-gradient-to-r
from-black
via-black/85
to-black/20
      "
    />

    <div className="
  relative
  z-10
  p-6
  sm:p-8
  lg:p-14
  max-w-xl
  h-full
  flex
  flex-col
  justify-center
">

<div className="
inline-flex
items-center
gap-2
px-4
py-2
rounded-full
bg-white/10
backdrop-blur-xl
border
border-white/10
">
  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
  TUNDA ORIGINAL
</div>

 <h1 className="
  text-5xl
  sm:text-6xl
  lg:text-8xl
  font-black
  mt-3
">
        {featured.title}
      </h1>

      <p className="
  text-sm
  sm:text-base
  lg:text-lg
  text-zinc-300
  mt-4
  max-w-lg
">
        {featured.description}
      </p>

<button
  onClick={() => router.push(`/videos/${featured.id}`)}
  className="
    mt-6
    w-fit
    px-8
    py-3
    rounded-xl
    font-bold
    bg-gradient-to-r
    from-red-700
    via-emerald-500
    to-sky-500
    shadow-xl
    hover:scale-105
    transition
  "
>
  ▶ Watch Now
</button>
    </div>
  </div>
)}


<h2 className="text-2xl font-bold mb-4">
  📺 Recently Added
</h2>

<div
  className="
    flex
    gap-4
    overflow-x-auto
    pb-4
    scrollbar-hide
  "
>

  {trendingVideos.map((video) => (
<div
  key={video.id}
  onClick={() => router.push(`/videos/${video.id}`)}
  className="
  min-w-[240px]
  sm:min-w-[280px]
  bg-zinc-900
  rounded-2xl
  overflow-hidden
  cursor-pointer
  hover:scale-105
  transition
  border
  border-white/10
"
>

<video
  src={video.video_url}
  poster={video.thumbnail_url}
  className="w-full h-48 object-cover"
  muted
  preload="metadata"
/>

<div className="p-2">
  <h3 className="text-xs font-semibold truncate">
    {video.title}
  </h3>
</div>

    </div>
  ))}

</div>


<h2 className="text-2xl font-bold mt-10 mb-4">
  ▶ Continue Watching
</h2>

<div className="flex gap-2 overflow-x-auto pb-4 px-1">

  {videos.map((video) => (
    <div
      key={`continue-${video.id}`}
      onClick={() => router.push(`/videos/${video.id}`)}
className="
  group
  min-w-[100px]
  sm:min-w-[120px]
        bg-white/[0.03]
        backdrop-blur-xl
        rounded-2xl
        overflow-hidden
        border
        border-white/10
        hover:border-sky-400
        hover:shadow-[0_0_40px_rgba(239,68,68,.25)]
        hover:scale-105
        transition-all
        duration-300
      "
    >
<img
  src={video.thumbnail_url}
className="
  w-full
  h-40
  sm:h-52
  object-cover
    transition-transform
    duration-500
    group-hover:scale-110
  "
/>

<div className="p-4">
  <h3 className="font-bold">
    {video.title}
  </h3>

  <p className="text-xs text-zinc-500 mt-1">
    👁 {video.views || 0} views
  </p>
</div>
    </div>
  ))}

</div>


<h2 className="text-2xl font-bold mt-10 mb-4">
  🔥 Trending Now
</h2>

<div className="flex gap-2 overflow-x-auto pb-4 px-1">

  {trendingVideos.map((video) => (
    <div
     key={`trend-${video.id}`}
      onClick={() => router.push(`/videos/${video.id}`)}
className="
  group
  min-w-[100px]
  sm:min-w-[120px]
  bg-white/[0.03]
  backdrop-blur-xl
  rounded-2xl
  overflow-hidden
  border
  border-white/10
  hover:border-sky-400
  hover:shadow-[0_0_40px_rgba(239,68,68,.25)]
  hover:scale-105
  transition-all
  duration-300
"
    >
<img
  src={video.thumbnail_url}
  className="
    w-full
    h-56
    sm:h-64
    object-cover
    transition-transform
    duration-500
    group-hover:scale-110
  "
/>

      <div className="p-4">
        <h3 className="font-bold">
          {video.title}
        </h3>
      </div>

    </div>
  ))}

</div>

    </main>
  )
}