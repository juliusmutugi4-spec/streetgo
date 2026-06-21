'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Post from './components/Post'
import CreatePost from './components/CreatePost'
import LoginModal from './components/LoginModal'
import TopNav from './components/TopNav'
import BottomNav from './components/BottomNav'
import CreatePrediction from './components/CreatePrediction'
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
  const [unreadCount, setUnreadCount] = useState(0)
  
  const [posts, setPosts] = useState<PostType[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [profile, setProfile] = useState<any>(null)
const [predictions, setPredictions] = useState<PredictionType[]>([])
const [voteCounts, setVoteCounts] = useState<any>({})
  // Fetch unread messages count
  const fetchUnreadMessages = async (userId: string) => {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)

    setUnreadCount(count || 0)
  }

  useEffect(() => {
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

        // ✅ fetch unread messages here
        await fetchUnreadMessages(session.user.id)
      }
fetchPosts()
fetchPredictions()
fetchVoteCounts()
    }

    checkUser()

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
console.log('PROFILE DATA:', data)
          // ✅ update unread messages on login
          await fetchUnreadMessages(session.user.id)
        } else {
          setProfile(null)
          setUnreadCount(0)
        }
      }
    )

    return () => sub.subscription.unsubscribe()
  }, [])

  const fetchPosts = async () => {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
 console.log('POSTS DATA:', postsData)
  console.log('POSTS ERROR:', postsError)
    if (postsError) {
      console.error('Supabase fetchPosts error:', postsError)
      return
    }



    const userIds = postsData?.map((p: any) => p.user_id) ?? []
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    const postsWithProfiles = postsData?.map((p: any) => {
      const profile = profiles?.find((u: any) => u.id === p.user_id)
      return { ...p, username: profile?.username, avatar_url: profile?.avatar_url }
    }) ?? []

    setPosts(postsWithProfiles)
    setLoading(false)
  }
const fetchPredictions = async () => {
  alert('FETCH PREDICTIONS START')

  const { data, error } = await supabase
    .from('predictions')
    .select('*')

  if (error) {
    alert('ERROR: ' + error.message)
    console.error(error)
    return
  }

  alert('FOUND: ' + data.length + ' predictions')

  setPredictions(data || [])
}
const votePrediction = async (
  predictionId: string,
  vote: 'agree' | 'disagree'
) => {
  if (!user) {
    alert('Login first')
    return
  }

  const { error } = await supabase
    .from('prediction_votes')
.upsert(
  {
    prediction_id: predictionId,
    user_id: user.id,
    vote,
  },
  {
    onConflict: 'prediction_id,user_id',
  }
)

  if (error) {
    alert(error.message)
    return
  }

  await fetchVoteCounts()
}
const fetchVoteCounts = async () => {
  const { data } = await supabase
    .from('prediction_votes')

    .select('*')

  const counts: any = {}

  data?.forEach((vote) => {
    if (!counts[vote.prediction_id]) {
      counts[vote.prediction_id] = {
        agree: 0,
        disagree: 0,
      }
    }

    counts[vote.prediction_id][vote.vote]++
  })

  setVoteCounts(counts)
}

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
    alert('ENTERED CORRECT BLOCK')
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
      <TopNav user={user} onLogin={() => setShowLogin(true)} onLogout={handleLogout} />

      {/* Feed scrollable */}
<div
  className="
    max-w-7xl
    mx-auto
    px-4
    pt-20
    pb-20
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
              <CreatePost userId={user.id} onPosted={fetchPosts} />

<CreatePrediction
  userId={user.id}
  username={profile?.username}
  avatarUrl={profile?.avatar_url}
  onCreated={fetchPredictions}
/>


            </div>
          </div>
        )}

        {loading ? (
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


<div className="bg-red-500 text-white p-3 rounded">
  Predictions Loaded: {predictions.length}
</div>



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
      <BottomNav
        user={user}
        profile={profile}
        unreadCount={unreadCount} // ✅ pass unread count to show badge
      />

      {/* Login Modal */}
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onLogin={fetchPosts} />
      )}
    </main>
  )
}