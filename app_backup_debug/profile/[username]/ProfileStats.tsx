'use client'

import { Star, Users, UserPlus, FileText } from 'lucide-react'

interface Props {
  reputation: number
  followersCount: number
  followingCount: number
  postsCount: number
  onFollowersClick: () => void
  onPostsClick: () => void
}

export default function ProfileStats({
  reputation,
  followersCount,
  followingCount,
  postsCount,
  onFollowersClick,
  onPostsClick,
}: Props) {
  const formatNum = (num: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num)

  return (
    <div className="w-full grid grid-cols-12 gap-2 antialiased selection:bg-amber-500/20">
      
      {/* 1. Reputation (Lines up perfectly on mobile) */}
      <div className="col-span-3 rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400/10 shrink-0" />
          <span className="text-[9px] font-bold uppercase tracking-wide text-zinc-500 truncate">Rep</span>
        </div>
        <div className="my-0.5 leading-none">
          <span className="text-sm font-black tracking-tight text-white block truncate">
            {formatNum(reputation)}
          </span>
        </div>
        <div className="h-0.5 w-full rounded-full bg-zinc-900 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '70%' }} />
        </div>
      </div>
<div className="col-span-9 rounded-lg border border-zinc-800 bg-zinc-950 p-1.5">

  <div className="grid grid-cols-3 h-full">

    {/* Followers */}
    <button
      onClick={onFollowersClick}
      className="flex flex-col justify-between text-left px-2 border-r border-zinc-800"
    >
      <div className="flex items-center gap-1">
        <Users className="h-2.5 w-2.5 text-zinc-500" />
        <span className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">
          Followers
        </span>
      </div>

      <span className="text-sm font-black text-white">
        {formatNum(followersCount)}
      </span>

      <span className="text-[8px] text-emerald-400">
        Stable
      </span>
    </button>

{/* Following */}
<div className="flex flex-col justify-between px-2 border-r border-zinc-800">

  <div className="flex items-center gap-1">
    <UserPlus className="h-2.5 w-2.5 text-zinc-500" />

    <span className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">
      Following
    </span>
  </div>

  <span className="text-sm font-black text-white">
    {formatNum(followingCount)}
  </span>

  <span className="text-[8px] text-zinc-500">
    Network
  </span>

</div>


{/* Posts */}
<button
  onClick={onPostsClick}
  className="group flex flex-col justify-between text-left px-2"
>
  <div className="flex items-center gap-1">
    <FileText className="h-2.5 w-2.5 text-zinc-500 group-hover:text-violet-400 transition-colors" />

    <span className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">
      Posts
    </span>
  </div>

  <span className="text-sm font-black text-white group-hover:translate-x-0.5 transition-transform">
    {formatNum(postsCount)}
  </span>

  <span className="text-[8px] text-zinc-500">
    Total
  </span>
</button>


    {/* Leav
    
    
    e Following and Posts for the next step */}

  </div>

</div>
    </div>
  )
}
