'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import Post from './components/Post'
import CreatePost from './components/CreatePost'
import LoginModal from './components/LoginModal'
import TopNav from './components/TopNav'
import BottomNav from './components/BottomNav'
import CreatePrediction from './components/CreatePrediction'
import PostSchema from './components/PostSchema'
import { registerPushNotifications } from './lib/pushNotifications'
import { useFeed } from './hooks/useFeed'
import { usePredictions } from "./hooks/usePredictions"
import { useAuth } from "./hooks/useAuth"
import { useDriver } from "./hooks/useDriver"
import PredictionDrawer from './components/PredictionDrawer'
import SplashScreen from './components/SplashScreen'
type PostType = {
  id: string
  content: string
  video_url?: string | null
  user_id: string
  created_at: string
  username?: string
  avatar_url?: string | null
}

type PredictionType = {
  id: string
  title: string
  description: string
  username?: string
  avatar_url?: string | null
  created_at: string
  user_id: string
}


export default function Home() {

  
  const {
  posts,
  setPosts,
  loading,
  fetchPosts,
} = useFeed()
const {
  user,
  profile,
  unreadCount,
  checkUser,
  handleLogout,
} = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  
const {
  isApprovedDriver,
  setIsApprovedDriver,

  driverOnline,
  setDriverOnline,

  pendingRideCount,
  setPendingRideCount,

  loadPendingRideCount,
  loadDriver,
  toggleDriverOnline,
} = useDriver(user)

const {
  predictions,
  setPredictions,
  voteCounts,
  setVoteCounts,
  fetchPredictions,
  fetchVoteCounts,
  votePrediction,
} = usePredictions(user)
const [showNav, setShowNav] = useState(true)
const [videoPortalOpen, setVideoPortalOpen] = useState(false)
const [showLoader, setShowLoader] = useState(false)
const [showSplash, setShowSplash] = useState(true)
const [loadingProgress, setLoadingProgress] = useState(0)
const [loadingStatus, setLoadingStatus] = useState("Starting StreetGO...")
const [activePostId, setActivePostId] = useState<string | null>(null)
const lastScrollY = useRef(0)

const [predictionDrawerOpen, setPredictionDrawerOpen] = useState(false)

const [createMode, setCreateMode] = useState<
  'none' | 'post' | 'prediction'
>('none')

const onCreateSelect = (
  mode: 'post' | 'prediction'
) => {
  setCreateMode(mode)
}



  // Fetch unread messages count








useEffect(() => {
  const initialize = async () => {
    setLoadingStatus("Loading driver...")
    setLoadingProgress(15)
    await loadDriver()

    setLoadingStatus("Loading predictions...")
    setLoadingProgress(35)
    await fetchPredictions()

    setLoadingStatus("Loading votes...")
    setLoadingProgress(55)
    await fetchVoteCounts()

    setLoadingStatus("Loading rides...")
    setLoadingProgress(75)
    await loadPendingRideCount()

    setLoadingStatus("Registering notifications...")
    setLoadingProgress(90)
    await registerPushNotifications()

    setLoadingStatus("Ready")
    setLoadingProgress(100)

    setTimeout(() => {
      setShowSplash(false)
    }, 400)
  }

  initialize()
}, [user])


useEffect(() => {
  let timer: NodeJS.Timeout

  if (loading) {
    timer = setTimeout(() => {
      setShowLoader(true)
    }, 150) // show loader only if loading lasts >150ms
  } else {
    setShowLoader(false)
  }

  return () => clearTimeout(timer)
}, [loading])

useEffect(() => {
  if (!loading) {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 1200)

    return () => clearTimeout(timer)
  }
}, [loading])


useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY

    // Hide nav when scrolling down
    if (
  currentScrollY > lastScrollY.current &&
  currentScrollY > 80
) {
      setShowNav(false)
    }

    // Show nav when scrolling up
    if (currentScrollY < lastScrollY.current) {
      setShowNav(true)
    }

    lastScrollY.current = currentScrollY
  }

  window.addEventListener("scroll", handleScroll)

  return () => {
    window.removeEventListener("scroll", handleScroll)
  }
}, [])








const resolvePrediction = async (
  predictionId: string,
  status: 'correct' | 'wrong',
  creatorId: string
) => {

  // Update prediction status
const { data, error: predictionError } = await supabase
  .from('predictions')
  .update({ status })
  .eq('id', predictionId)
  .select()


  // Get creator profile
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select('reputation, predictions_correct, predictions_wrong')
  .eq('id', creatorId)
  .single()


  if (!profileData) return

  if (status === 'correct') {
  
    await supabase
      .from('profiles')
      .update({
        reputation: (profileData.reputation || 0) + 10,
        predictions_correct:
          (profileData.predictions_correct || 0) + 1,
      })
      .eq('id', creatorId)
  }

  if (status === 'wrong') {
const { data: updateData, error: updateError } = await supabase
  .from('profiles')
  .update({
    reputation: (profileData.reputation || 0) + 10,
    predictions_correct:
      (profileData.predictions_correct || 0) + 1,
  })
  .eq('id', creatorId)
  .select()


  }

  fetchPredictions()
}

if (showSplash) {
  return (
    <SplashScreen
      progress={loadingProgress}
      status={loadingStatus}
    />
  )
}

  return (
    <main className="min-h-screen bg-[#060608] text-[#f4f4f5] antialiased selection:bg-emerald-500/30 font-sans tracking-tight relative overflow-x-hidden">
      {/* TopNav fixed */}
<div
  className={`
    fixed
    top-0
    left-0
    right-0
    z-50
    transition-all
duration-700 ease-in-out
    ${
      videoPortalOpen
        ? "-translate-y-full opacity-0"
        : showNav
        ? "translate-y-0 opacity-100"
        : "-translate-y-full opacity-0"
    }
  `}
>
  <TopNav
    user={user}
    onLogin={() => setShowLogin(true)}
    onLogout={handleLogout}
  />
</div>

      {/* Feeleo  ni  kunyambad scrollable */}
<div
  className="
    max-w-7xl
    mx-auto
    pt-[64px]
    px-0
    pb-20
    lg:px-4
    lg:grid
    lg:grid-cols-12
    lg:gap-6
  "
>


{/* MAIN FEED */}
<div className="w-full min-w-0 lg:col-span-6">
        {user && (
          <div className="group relative rounded-xl bg-zinc-900/20 border border-zinc-900 overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-zinc-800/80">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="p-4">


            </div>
          </div>
        )}

        {showLoader && posts.length === 0 ? (
          <div className="rounded-xl bg-zinc-900/10 border border-zinc-900/60 p-12 text-center backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.01] to-transparent animate-pulse" />
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
            
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl bg-zinc-900/10 border border-zinc-900/60 p-12 text-center backdrop-blur-md">
            <p className="text-sm font-mono text-zinc-500 tracking-wide"> INDEX_EMPTY: No packets detected on this stream. </p>
          </div>
        ) : (
          <div className="space-y-4">




            {posts.map((post) => (
              <div 
                key={post.id} 
                className="group relative rounded-xl bg-[#0d0d11]/40 border border-zinc-900/80 overflow-hidden shadow-xl backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:shadow-black/50 hover:-translate-y-[1px]"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/20 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/10 transition-all duration-500" />
                <div className="p-0.5 relative z-10">



<Post
  key={post.id}
  post={post}
  user={user}
  profile={profile}
  isActive={activePostId === post.id}
  setActivePostId={setActivePostId}
/>


                </div>
              </div>
            ))}
          </div>
        )}
      </div>
</div>




<button 
  onClick={() => setPredictionDrawerOpen(true)} 
  className="fixed left-0 top-1/2 -translate-y-1/2 z-50 h-32 w-7 rounded-r-lg bg-slate-900 hover:bg-blue-600 border-y border-r border-slate-800 hover:border-blue-500 shadow-md hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 ease-in-out flex items-center justify-center group"
  aria-label="Open predictions"
> 
  {/* Rotating Text */} 
  <span className="block -rotate-90 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 group-hover:text-white transition-colors duration-200 pointer-events-none"> 
    Predict 
  </span> 

  {/* Subtle indicator bar on the left edge */}
  <div className="absolute left-0 top-1/4 h-1/2 w-[2px] bg-slate-700 group-hover:bg-white transition-colors duration-200" />
</button>







      {/* BottomNav fixed */}
{isApprovedDriver && (
  <div className="fixed bottom-20 left-4 right-4 z-40">
   <div
  className="
    absolute
    top-0
    left-0
    right-0
    h-1
    rounded-t-2xl
    bg-gradient-to-r
    from-green-400
    via-emerald-500
    to-green-400
  "
/> 
<div
  role="button"
  tabIndex={0}
  onClick={() => {
    window.location.href = '/driver'
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      window.location.href = '/driver'
    }
  }}
  className="
    relative
    w-full
    rounded-2xl
    bg-[#111315]
    px-4
    py-3
    shadow-xl
    border
    border-zinc-800
    flex
    items-center
    justify-between
    text-white
    transition-all
    duration-300
    hover:border-green-500/40
  "
>
      <div>
        <h2 className="font-bold text-lg">
          🚗 Driver Dashboard
        </h2>

<p className="text-sm text-red-200">
  {driverOnline
    ? `${pendingRideCount} ride request${pendingRideCount === 1 ? '' : 's'} waiting`
    : 'Tap to start driving'}
</p>
      </div>
<button
  onClick={(e) => {
    e.stopPropagation()
    toggleDriverOnline()
  }}
  className={`
    px-3
    py-2
    rounded-full
    text-xs
    font-bold
    transition-all
    duration-300
    ${
      driverOnline
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white'
    }
  `}
>
  {driverOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
</button>
   </div>
  </div>
)}

<div
  className={`
    fixed
    bottom-0
    left-0
    right-0
    z-[9999]
    transition-all
    duration-700
    ease-in-out
 ${
  videoPortalOpen
    ? "translate-y-full opacity-0 pointer-events-none"
    : showNav
    ? "translate-y-0 opacity-100"
    : "translate-y-full opacity-0 pointer-events-none"
}
  `}
>


  
<BottomNav
  profile={profile}
  unreadCount={unreadCount}
  onCreateSelect={onCreateSelect}
/>
</div>

{createMode === 'post' && (
  <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm">

    <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-[#060608] border-t border-cyan-500/20 p-4 max-h-[90vh] overflow-y-auto">

<button
  onClick={() => setCreateMode('none')}
  className="
    absolute
    top-4
    right-4
    z-[999]
    h-10
    w-10
    rounded-full
    bg-red-500
    text-white
    flex
    items-center
    justify-center
    shadow-lg
  "
>
  ✕
</button>

<CreatePost
  userId={user.id}
  profile={profile}
  onPosted={(newPost) => {
    if (newPost) {
      setPosts((prev) => [
        {
          ...newPost,
          username: profile?.username,
          avatar_url: profile?.avatar_url,
        },
        ...prev,
      ])
    }

    setCreateMode('none')
  }}
/>

    </div>

  </div>
)}

{createMode === 'prediction' && (
  <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm">

    <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-[#060608] border-t border-orange-500/20 p-4 max-h-[90vh] overflow-y-auto">

      <button
        onClick={() => setCreateMode('none')}
        className="absolute right-4 top-4 text-red-400 font-bold"
      >
        ✕
      </button>

      <CreatePrediction
        userId={user.id}
        username={profile?.username}
        avatarUrl={profile?.avatar_url}
        onCreated={() => {
          fetchPredictions()
          setCreateMode('none')
        }}
      />

    </div>

  </div>
)}


      {/* Login Modal */}
{showLogin && (
  <LoginModal
    onClose={() => setShowLogin(false)}
    onLogin={async () => {
      await checkUser()
      await fetchPosts()
    }}
  />
)}

<PredictionDrawer
  open={predictionDrawerOpen}
  onClose={() => setPredictionDrawerOpen(false)}
  predictions={predictions}
  voteCounts={voteCounts}
  votePrediction={votePrediction}
/>


    </main>
  )
}
