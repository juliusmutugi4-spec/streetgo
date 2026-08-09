'use client'

type MessagesSidebarProps = {
  username: string
}

export default function MessagesSidebar({
  username,
}: MessagesSidebarProps) {
  return (
    <div
      className="
        hidden
        lg:flex
        w-60
        bg-[#0c131a]
        border-r
        border-white/[0.06]
        flex-col
        h-full
        select-none
      "
    >
      {/* Profile Card Block */}
      <div className="p-4 border-b border-white/[0.03]">
        <div className="flex items-center gap-3 bg-white/[0.01] border border-white/[0.03] rounded-xl p-3">
          {/* Avatar Graphic with Ring Frame */}
          <div className="relative flex-shrink-0">
            <div
              className="
                w-10
                h-10
                rounded-full
                bg-gradient-to-br
                from-zinc-700
                to-zinc-800
                flex
                items-center
                justify-center
                font-bold
                text-xs
                text-zinc-200
                uppercase
                tracking-wider
              "
            >
              {username?.charAt(0) || 'T'}
            </div>
            {/* Status dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c131a]" />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-[13.5px] text-zinc-200 truncate leading-tight">
              {username || 'Tunda User'}
            </h2>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Ecosystem Options Menu */}
      <div className="p-3 space-y-1 flex-1">
        {/* Feed Option Button */}
        <button
          className="
            w-full
            flex
            items-center
            gap-3
            px-3.5
            py-2.5
            text-[13px]
            font-medium
            text-zinc-400
            hover:text-zinc-200
            rounded-lg
            hover:bg-white/[0.02]
            transition-all
            group
          "
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Feed
        </button>

        {/* Active Messages Option Button */}
        <button
          className="
            w-full
            flex
            items-center
            gap-3
            px-3.5
            py-2.5
            text-[13px]
            font-semibold
            text-zinc-100
            rounded-lg
            bg-white/[0.04]
            border
            border-white/[0.02]
            transition-all
          "
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4 text-emerald-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641l-.318 1.235c-.149.58.419 1.13 1 1l1.523-.343a1.66 1.66 0 011.196.257c1.02.516 2.146.817 3.34.817z" />
          </svg>
          Messages
        </button>

        {/* Profile Option Button */}
        <button
          className="
            w-full
            flex
            items-center
            gap-3
            px-3.5
            py-2.5
            text-[13px]
            font-medium
            text-zinc-400
            hover:text-zinc-200
            rounded-lg
            hover:bg-white/[0.02]
            transition-all
            group
          "
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Profile
        </button>

        {/* Settings Option Button */}
        <button
          className="
            w-full
            flex
            items-center
            gap-3
            px-3.5
            py-2.5
            text-[13px]
            font-medium
            text-zinc-400
            hover:text-zinc-200
            rounded-lg
            hover:bg-white/[0.02]
            transition-all
            group
          "
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.767a1.123 1.123 0 00-.417 1.03c.004.074.006.148.006.222 0 .074-.002.148-.006.222a1.123 1.123 0 00.417 1.03l1.003.767a1.125 1.125 0 01.26 1.43l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.216-.456a1.125 1.125 0 00-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281a1.125 1.125 0 00-.646-.87a6.555 6.555 0 01-.22-.127a1.125 1.125 0 00-1.074-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.43l1.003-.767a1.122 1.122 0 00.417-1.03a6.57 6.57 0 01-.006-.222c0-.074.002-.148.006-.222a1.122 1.122 0 00-.417-1.03l-1.003-.767a1.125 1.125 0 01-.26-1.43l1.296-2.247a1.125 1.125 0 011.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.28z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>
    </div>
  )
}
