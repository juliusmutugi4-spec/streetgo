'use client'


import { Flame, MessageSquare, Send, Sparkles } from "lucide-react"
import ReactionButton from "./ReactionButton"
import PostCardMeta from "./PostCardMeta"


interface PostActionsProps {
  liked: boolean
  likes: number
  comments: any[]
  reaxCount: number
  toggleLike: () => void
  handleSendReax: () => Promise<void>
  setOpenRoom: React.Dispatch<React.SetStateAction<boolean>>
  post: { id: string; content: string }
onOpenDispatch: (post: any) => void
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
  onOpenDispatch,
}: PostActionsProps) {

  // Pure Web Audio API synthesized interface sounds (No external files required)
  const playSound = (type: 'click' | 'success' | 'pop') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.06); // E5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    playSound('success');
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
    }
  }

  const handleLikeClick = () => {
    playSound(liked ? 'click' : 'pop');
    toggleLike();
  };

  const handleCommentClick = () => {
    playSound('click');
    setOpenRoom(true);
  };
return (
  <div
    className="
      w-full
      bg-[var(--surface)]
      px-4
      select-none
      border-t
      border-[var(--border)]
      rounded-b-xl
      transition-colors
      duration-300
    "
  >



<PostCardMeta
  likes={likes}
  reaxCount={reaxCount}
  commentsCount={comments.length}
/>


    {/* ACTION BUTTONS */}

    <div
      className="
        flex
        items-center
        justify-between
        gap-1
        py-1.5
      "
    >



      {/* IGNITE */}


      <button

        onClick={handleLikeClick}

        className="
          flex-1
          flex
          items-center
          justify-center
          gap-2
          rounded-lg
          py-2
          text-[13px]
          font-semibold
          tracking-wide
          text-[var(--muted)]
          transition-all
          duration-200
          hover:bg-[var(--surface-hover)]
          hover:text-[var(--foreground)]
          active:scale-95
          group
        "

      >

        <Flame

          size={16}

          className={`transition-all duration-300 ${
            liked

            ?

            "text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] scale-110"

            :

            "text-[var(--muted)] group-hover:text-rose-400"
          }`}

        />


        <span
          className={
            liked
            ? "text-rose-400"
            : ""
          }
        >
          Ignite
        </span>


      </button>






      {/* DISCUSS */}


      <button

        onClick={handleCommentClick}

        className="
          flex-1
          flex
          items-center
          justify-center
          gap-2
          rounded-lg
          py-2
          text-[13px]
          font-semibold
          tracking-wide
          text-[var(--muted)]
          transition-all
          duration-200
          hover:bg-[var(--surface-hover)]
          hover:text-[var(--foreground)]
          active:scale-95
          group
        "

      >

        <MessageSquare
          size={16}
          className="
            transition-colors
            group-hover:text-cyan-400
          "
        />

        <span>
          Discuss
        </span>


      </button>







      {/* REAX */}

      <div
        onClick={() => playSound('pop')}

        className="
          flex-1
          flex
          items-center
          justify-center
          rounded-lg
          transition-all
          duration-200
          hover:bg-[var(--surface-hover)]
        "
      >

        <ReactionButton
          handleSendReax={handleSendReax}
          reaxCount={reaxCount}
        />

      </div>








      {/* DISPATCH */}


      <div className="relative flex-1">


        <button

          onClick={() => {
            playSound('success')
            onOpenDispatch(post)
          }}

          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-lg
            py-2
            text-[13px]
            font-semibold
            tracking-wide
            text-[var(--muted)]
            transition-all
            duration-200
            hover:bg-emerald-400/5
            hover:text-[var(--foreground)]
            active:scale-[0.97]
            group
          "

        >

          <Send

            size={16}

            strokeWidth={1.8}

            className="
              transition-all
              duration-200
              group-hover:text-emerald-400
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "

          />


          <span>
            Dispatch
          </span>


        </button>


      </div>



    </div>


  </div>
)
}
