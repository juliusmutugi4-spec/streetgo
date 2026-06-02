'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Post from './components/Post'
import CreatePost from './components/CreatePost'
import LoginModal from './components/LoginModal'

type PostType = {
  id: string
  content: string
  video_url: string | null
  username: string
  created_at: string
}

export default function Home() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)





useEffect(() => {
  const checkUser = async () => {
const {
  data: { session },
} = await supabase.auth.getSession()

setUser(session?.user ?? null)
    fetchPosts() // 👈 Moved inside
  }
  checkUser()

  const { data: sub } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user?? null)
    }
  )
  return () => sub.subscription.unsubscribe()
}, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    if (error) console.error('Fetch error:', error)
    setPosts(data || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

return (
  <main className="min-h-screen bg-[#060608] text-[#f4f4f5] antialiased selection:bg-emerald-500/30 font-sans tracking-tight relative overflow-x-hidden">
    {/* Futuristic Background Matrix Gradients */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
    <div className="absolute top-[20vh] right-[-10%] w-[400px] h-[400px] bg-red-600/3 opacity-[0.02] blur-[120px] pointer-events-none rounded-full" />
    
    <header className="sticky top-0 z-50 bg-[#060608]/75 backdrop-blur-xl border-b border-zinc-900/80 transition-all duration-300">
      <div className="max-w-2xl mx-auto h-16 px-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter leading-none select-none drop-shadow-[0_0_15px_rgba(220,38,38,0.15)]">
            <span className="text-red-500 transition-colors duration-300 hover:text-red-400">c</span>
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent inline-block hover:scale-[1.02] transition-transform duration-300">W</span>
            <span className="text-red-500 transition-colors duration-300 hover:text-red-400">V</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </span>
            <span className="text-[10px] font-black tracking-[0.15em] text-emerald-500 uppercase font-mono">LIVE_NETWORK</span>
          </div>
        </div>
        
        {user ? (
          <button 
            onClick={handleLogout} 
            className="group relative bg-zinc-900/60 hover:bg-red-950/20 text-red-400 border border-zinc-800 hover:border-red-900/50 px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 active:scale-95 overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            Logout
          </button>
        ) : (
          <button 
            onClick={() => setShowLogin(true)} 
            className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.15)] hover:shadow-[0_0_25px_rgba(220,38,38,0.3)]"
          >
            Login
          </button>
        )}
      </div>
      {/* Cybernetic HUD bar line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
    </header>

    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 relative z-10">
      {user ? (
        <div className="group relative rounded-xl bg-zinc-900/20 border border-zinc-900 overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-zinc-800/80">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <div className="p-4">
            <CreatePost userId={user.id} onPosted={fetchPosts} />
          </div>
        </div>
      ) : (
        <div className="group relative rounded-xl bg-zinc-900/20 border border-zinc-900 overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-zinc-800/80 p-6 text-center">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <p className="text-sm text-zinc-400 font-medium tracking-wide"> 
            Authentication required to beam transmissions to <span className="text-zinc-200 font-bold">cWV</span> 
          </p>
          <button 
            onClick={() => setShowLogin(true)} 
            className="mt-4 inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-6 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all duration-300 active:scale-95 text-white shadow-[0_0_20px_rgba(220,38,38,0.15)] hover:shadow-[0_0_30px_rgba(220,38,38,0.35)]"
          >
            Join cWV
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="font-black text-xs tracking-[0.15em] text-zinc-500 uppercase font-mono"> DATAFEED // TERMINAL </h2>
        <div className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-900/60 px-2.5 py-1 rounded-full backdrop-blur-md">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-wider"> {posts.length} NODE_POSTS </span>
        </div>
      </div>

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
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="group relative rounded-xl bg-[#0d0d11]/40 border border-zinc-900/80 overflow-hidden shadow-xl backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:shadow-black/50 hover:-translate-y-[1px]"
            >
              {/* Sci-Fi Micro Glow Edge */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/20 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/10 transition-all duration-500" />
              
              <div className="p-0.5 relative z-10">
                <Post post={post} user={user} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {showLogin && (
      <LoginModal onClose={() => setShowLogin(false)} onLogin={fetchPosts} />
    )}
  </main>
)
}