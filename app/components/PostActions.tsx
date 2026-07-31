'use client'

import { Heart, MessageCircle, Share2 } from "lucide-react"
import ReactionButton from "./ReactionButton"

interface PostActionsProps {
  liked: boolean
  likes: number
  comments: any[]
  reaxCount: number
 
  toggleLike: () => void
  handleSendReax: () => Promise<void>
 
  setOpenRoom: React.Dispatch<React.SetStateAction<boolean>>
  post: { id: string; content: string }
}

export default function PostActions({
  liked,
  likes,
  comments,
  reaxCount,
  
  toggleLike,
  handleSendReax,

setOpenRoom,
post,
}: PostActionsProps) {
  
  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: "StreetGO",
          text: post.content,
          url,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      await navigator.clipboard.writeText(url)
      // Custom minimal toast notification recommended instead of raw alert
      alert("Link copied to clipboard!")
    }
  }

  return (
    <div className="w-full bg-[#242526] px-4 select-none">
      {/* METRICS ROW (Facebook-style counts above buttons) */}
      {(likes > 0 || reaxCount > 0 || comments.length > 0) && (
        <div className="flex items-center justify-between py-2 text-[13px] text-[#b0b3b8] border-b border-[#3e4042]">
          {/* Left: Interactions */}
          <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
            <div className="flex items-center -space-x-1">
              {likes > 0 && (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1877f2]">
                  <Heart size={10} fill="white" className="text-white" />
                </span>
              )}
            </div>
            <span>{likes + reaxCount}</span>
          </div>

          {/* Right: Comments & Shares */}
          <div className="flex items-center gap-3 text-[#b0b3b8]">
            {comments.length > 0 && (
<button
  onClick={() => setOpenRoom(true)}
  className="hover:underline text-[13px]"
>
  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
</button>
            )}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS ROW */}
      <div className="flex items-center justify-between py-1 my-0.5">
        {/* LIKE BUTTON */}
        <button
          onClick={toggleLike}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[#b0b3b8] font-semibold text-[14px] transition-colors duration-150 ease-in-out hover:bg-white/10 active:scale-95"
        >
          <Heart
            size={18}
            fill={liked ? "#1877f2" : "none"}
            className={`transition-transform duration-200 ${liked ? "text-[#1877f2] scale-110" : "text-[#b0b3b8]"}`}
          />
          <span className={liked ? "text-[#1877f2]" : ""}>Like</span>
        </button>

        {/* COMMENT BUTTON */}
        <button
         onClick={() => setOpenRoom(true)}
className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[#b0b3b8] font-semibold text-[14px] transition-colors duration-150 ease-in-out hover:bg-white/10 active:scale-95"
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>

        {/* REACTION/TIP BUTTON */}
        <div className="flex-1 flex items-center justify-center rounded-md transition-colors duration-150 ease-in-out hover:bg-white/10">
          <ReactionButton handleSendReax={handleSendReax} reaxCount={reaxCount} />
        </div>

        {/* SHARE BUTTON */}
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[#b0b3b8] font-semibold text-[14px] transition-colors duration-150 ease-in-out hover:bg-white/10 active:scale-95"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}
