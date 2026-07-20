'use client'

interface Props {
  reputation: number
  followersCount: number
  followingCount: number
  postsCount: number
  onFollowersClick: () => void
  onPostsClick: () => void
}

interface StatItemProps {
  value: number
  label: string
  suffix?: string
  onClick?: () => void
}

function StatItem({ value, label, suffix = "", onClick }: StatItemProps) {
  // Utility to cleanly format big numbers (e.g., 14200 -> "14.2K")
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    return num.toString()
  }

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      type={onClick ? "button" : undefined} // Prevents unintended form submissions if inside an edit form wrapper
      className={`
        flex items-baseline gap-1 select-none text-left
        ${onClick ? 'hover:text-cyan-400 transition-colors active:scale-[0.98] outline-none' : ''}
      `}
    >
      <span className="text-xs font-bold text-zinc-100 tracking-tight transition-colors inherited-color">
        {formatNumber(value)}{suffix}
      </span>
      <span className="text-[11px] text-zinc-500 font-medium">
        {label}
      </span>
    </Component>
  )
}

export default function ProfileStats({
  reputation,
  followersCount,
  followingCount,
  postsCount,
  onFollowersClick,
  onPostsClick,
}: Props) {
  return (
    <div className="w-full p-0 m-0">
      {/* High-density minimalist flex container */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 py-0.5">
        
        {/* Reputation Level Matrix */}
        <StatItem value={reputation} label="Reputation" suffix=" XP" />
        
        {/* Sleek Dot Separator */}
        <span className="text-[10px] text-zinc-700 select-none hidden xs:inline">•</span>

        {/* Followers Active Listener Trigger */}
        <StatItem value={followersCount} label="Followers" onClick={onFollowersClick} />
        
        {/* Sleek Dot Separator */}
        <span className="text-[10px] text-zinc-700 select-none hidden xs:inline">•</span>

        {/* Following Meta Counters */}
        <StatItem value={followingCount} label="Following" />
        
        {/* Sleek Dot Separator */}
        <span className="text-[10px] text-zinc-700 select-none hidden xs:inline">•</span>

        {/* Post History Data Metrics */}
        <StatItem value={postsCount} label="Posts" onClick={onPostsClick} />

      </div>
    </div>
  )
}
