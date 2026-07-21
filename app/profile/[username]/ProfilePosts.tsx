'use client'

import React, { useMemo } from "react"
import { Terminal, Clock, CornerDownRight } from "lucide-react"

interface Post {
  id: string
  content?: string | null
  video_url?: string | null
  created_at: string
}

interface Profile {
  username: string
  avatar_url?: string | null
}

interface ProfilePostsProps {
  posts: Post[]
  profile: Profile
}

export default function ProfilePosts({ posts = [], profile }: ProfilePostsProps) {
  // Clean date formatting helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Recent Log"
    }
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-6" aria-label="User Transmissions Feed">
      {/* Section Header */}
      <header className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-zinc-500" />
          <h2 className="font-bold tracking-widest text-zinc-400 text-xs uppercase font-mono">
            Datafeed // Transmissions
          </h2>
        </div>
        <div className="text-[11px] text-cyan-400 font-mono bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/30">
          {posts.length} {posts.length === 1 ? "LOG" : "LOGS"}
        </div>
      </header>

      {/* Feed Area */}
      <div className="mt-6 space-y-4">
        {posts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950/40 p-12 text-center backdrop-blur-sm">
            <CornerDownRight size={20} className="text-zinc-700 mb-2 stroke-[1.5]" />
            <p className="text-xs text-zinc-500 font-medium tracking-wide">
              No active transmissions logged.
            </p>
          </div>
        ) : (
          /* Post Feed List */
          posts.map((post) => (
            <article 
              key={post.id} 
              className="group rounded-xl border border-zinc-900 bg-[#04080e]/40 hover:bg-[#04080e]/60 hover:border-zinc-800/80 transition-all duration-300 backdrop-blur-xl overflow-hidden shadow-md"
            >
              <div className="p-5">
                {/* Author Metadata Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                    <img 
                      src={profile?.avatar_url || '/avatar-placeholder.png'} 
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102" 
                      alt={`${profile?.username || 'User'}'s avatar`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/avatar-placeholder.png'
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200 tracking-tight leading-none mb-1.5">
                      {profile?.username || "Anonymous User"}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                      <Clock size={11} className="text-zinc-600" />
                      <time dateTime={post.created_at}>
                        {formatDate(post.created_at)}
                      </time>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                {post.content && (
                  <p className="text-[14px] text-zinc-300 leading-relaxed font-normal whitespace-pre-wrap selection:bg-cyan-500/20">
                    {post.content}
                  </p>
                )}

                {/* Inline Video Asset Integration */}
                {post.video_url && (
                  <div className="mt-4 relative w-full aspect-video rounded-lg border border-zinc-900 bg-black/40 overflow-hidden shadow-inner">
<video
  src={post.video_url}
  controls
  playsInline
  preload="metadata"
  controlsList="nodownload noplaybackrate"
  disablePictureInPicture
  onContextMenu={(e) => e.preventDefault()}
  className="h-full w-full object-contain"
/>
                    
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
