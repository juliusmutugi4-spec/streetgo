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
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
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
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <header className="sticky top-0 z-50 bg-[#111]/95 backdrop-blur border-b border-red-950">
        <div className="max-w-2xl mx-auto h-14 px-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">
              <span className="text-red-600">c</span>
              <span className=" bg-gradient-to-r from-green-500 via-green-500 to-white bg-clip-text text-transparent ">W</span>
              <span className="text-red-600">V</span>
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500"> LIVE NETWORK </span>
            </div>
          </div>
          {user? (
            <button onClick={handleLogout} className="bg-red-700 hover:bg-red-800 px-3 py-1.5 rounded-lg text-sm font-semibold transition">
              Logout
            </button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition">
              Login
            </button>
          )}
        </div>
        <div className="h-1 bg-green-500" />
      </header>

      <div className="max-w-xl mx-auto px-2 py-3">
        {user? (
          <div className="mb-3 rounded-xl bg-[#171717] border-red-950 overflow-hidden shadow-lg">
            <div className="h-1 bg-green-500" />
            <div className="p-2">
              <CreatePost userId={user.id} onPosted={fetchPosts} />
            </div>
          </div>
        ) : (
          <div className="mb-3 rounded-xl bg-[#171717] border-red-950 overflow-hidden shadow-lg">
            <div className="h-1 bg-green-500" />
            <div className="p-5 text-center">
              <p className="text-sm text-gray-400"> Login to start posting on cWV </p>
              <button onClick={() => setShowLogin(true)} className="mt-3 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold transition">
                Join cWV
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg"> News Feed </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-500 font-semibold"> {posts.length} POSTS </span>
          </div>
        </div>

        {loading? (
          <div className="rounded-xl bg-[#171717] border-red-950 p-6 text-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400"> Loading feed... </p>
          </div>
        ) : posts.length === 0? (
          <div className="rounded-xl bg-[#171717] border-red-950 p-6 text-center">
            <p className="text-gray-400"> No posts yet. </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="rounded-xl bg-[#171717] border-red-950 overflow-hidden shadow-lg">
                <div className="h-1 bg-green-500" />
                <Post post={post} />
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