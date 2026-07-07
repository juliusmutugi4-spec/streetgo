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
  avatar_url?: string
  created_at: string
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
  setUser,

  profile,
  setProfile,

  unreadCount,
  setUnreadCount,
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
const lastScrollY = useRef(0)

const [createMode, setCreateMode] = useState<
  'none' | 'post' | 'prediction'
>('none')
  // Fetch unread messages count
const fetchUnreadMessages = async (userId: string) => {
  const { count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)

  setUnreadCount(count || 0)
}

const checkUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  setUser(session?.user ?? null)

  if (session?.user) {
    const { data } = await supabase
      .from('profiles')
      .select(`
        username,
        avatar_url,
        reputation,
        predictions_correct,
        predictions_wrong
      `)
      .eq('id', session.user.id)
      .single()

    setProfile(data)


    await fetchUnreadMessages(session.user.id)
  }


}





useEffect(() => {
  const initialize = async () => {
    await Promise.all([
      loadDriver(),
      fetchPosts(),
      fetchPredictions(),
      fetchVoteCounts(),
      loadPendingRideCount(),
    ])

    registerPushNotifications()
  }

  initialize()
}, [])







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






  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUnreadCount(0)
  }

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
    transition-transform
    duration-300
    ${
      showNav
        ? "translate-y-0"
        : "-translate-y-full"
    }
  `}
>
  <TopNav
    user={user}
    onLogin={() => setShowLogin(true)}
    onLogout={handleLogout}
  />
</div>

      {/* Feed scrollable */}
<div
  className="
    max-w-7xl
    mx-auto
    px-0
    pb-20
    lg:px-4
    lg:grid
    lg:grid-cols-12
    lg:gap-6
  "
>


{/* MAIN FEED */}
<div className="lg:col-span-6">
        {user && (
          <div className="group relative rounded-xl bg-zinc-900/20 border border-zinc-900 overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-zinc-800/80">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="p-4">


            </div>
          </div>
        )}

        {loading && posts.length === 0 ? (
          <div className="rounded-xl bg-zinc-900/10 border border-zinc-900/60 p-12 text-center backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.01] to-transparent animate-pulse" />
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
            <p className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase"> Synchronizing network feed... </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl bg-zinc-900/10 border border-zinc-900/60 p-12 text-center backdrop-blur-md">
            <p className="text-sm font-mono text-zinc-500 tracking-wide"> INDEX_EMPTY: No packets detected on this stream. </p>
          </div>
        ) : (
          <div className="space-y-4">






{predictions.map((prediction: any) => (
  <div
    key={prediction.id}
    className="
      rounded-2xl
      border
      border-cyan-500/20
      bg-[#05070b]
      p-5
      mb-4
    "
  >
    <div className="flex items-center gap-3">
      <img
        src={prediction.avatar_url || '/avatar-placeholder.png'}
        className="w-10 h-10 rounded-xl object-cover"
      />

      <div>
        <h3 className="font-bold text-white">
          {prediction.username}
        </h3>

        <p className="text-xs text-cyan-400">
          Prediction
        </p>
      </div>
    </div>

    <h2 className="mt-4 text-lg font-bold text-cyan-300">
      {prediction.title}
    </h2>

    <p className="mt-2 text-zinc-400">
      {prediction.description}
    </p>

<div className="mt-4 flex gap-3">
  <button
    onClick={() => votePrediction(prediction.id, 'agree')}
    className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs"
  >
    👍agree {voteCounts[prediction.id]?.agree || 0}
  </button>

  <button
    onClick={() => votePrediction(prediction.id, 'disagree')}
    className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs"
  >
    👎disagree {voteCounts[prediction.id]?.disagree || 0}
  </button>
</div>


<div className="mt-4 flex items-center gap-3">
  {/* Mark Correct Button */}
  <button
    type="button"
    onClick={() =>
      resolvePrediction(
        prediction.id,
        'correct',
        prediction.user_id
      )
    }
    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-100 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 active:scale-[0.98]"
  >
    <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
    Mark Correct
  </button>

  {/* Mark Wrong Button */}
  <button
    type="button"
    onClick={() =>
      resolvePrediction(
        prediction.id,
        'wrong',
        prediction.user_id
      )
    }
    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 transition-all duration-200 hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 active:scale-[0.98]"
  >
    <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
    Mark Wrong
  </button>
</div>

  </div>
))}


            {posts.map((post) => (
              <div 
                key={post.id} 
                className="group relative rounded-xl bg-[#0d0d11]/40 border border-zinc-900/80 overflow-hidden shadow-xl backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:shadow-black/50 hover:-translate-y-[1px]"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/20 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/10 transition-all duration-500" />
                <div className="p-0.5 relative z-10">



<Post
  post={post}
  user={user}
  profile={profile}
/>


                </div>
              </div>
            ))}
          </div>
        )}
      </div>
</div>
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

<div className="fixed bottom-0 left-0 right-0 z-[9999]">


  
  <BottomNav
  
    user={user}
    profile={profile}
    unreadCount={unreadCount}
    onCreateSelect={(mode) => {
      
      setCreateMode(mode)
    }}
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
        <LoginModal onClose={() => setShowLogin(false)} onLogin={fetchPosts} />
      )}




    </main>
  )
}
