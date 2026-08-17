'use client'

import { Trophy, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

type TopMenuProps = {
  onLogout: () => void
  onClose?: () => void
}

export default function TopMenu({
  onLogout,
  onClose,
}: TopMenuProps) {

  const router = useRouter()

  const menuRef = useRef<HTMLDivElement>(null)


  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {

        if (onClose) onClose()

      }

    }


    document.addEventListener(
      'mousedown',
      handleClickOutside
    )


    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }

  }, [onClose])



  const handleNavigation = (path: string) => {

    router.push(path)

    if (onClose) onClose()

  }



  return (

    <div
      ref={menuRef}
      className="
        absolute
        top-full
        right-0
        mt-2
        z-50
        w-52
        overflow-hidden
        rounded-xl
        border
        border-[var(--border)]
        bg-[var(--background)]
        text-[var(--foreground)]
        shadow-xl
        select-none
        animate-in
        fade-in
        slide-in-from-top-1
        duration-150
      "
    >


      <div className="
        space-y-0.5
        p-1.5
      ">



        {/* SETTINGS */}

        <button

          onClick={() => handleNavigation('/settings')}

          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-2.5
            py-2
            text-left
            text-sm
            font-medium
            text-[var(--foreground)]
            transition-colors
            hover:bg-[var(--surface-hover)]
          "

        >

          <Settings
            size={16}
            className="
              text-[var(--muted)]
              group-hover:text-[var(--foreground)]
            "
          />

          <span className="flex-1">
            Settings
          </span>

        </button>





        {/* LEADERBOARD */}

        <button

          onClick={() => handleNavigation('/leaderboard')}

          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-2.5
            py-2
            text-left
            text-sm
            font-medium
            text-[var(--foreground)]
            transition-colors
            hover:bg-[var(--surface-hover)]
          "

        >

          <Trophy
            size={16}
            className="
              text-[var(--muted)]
              group-hover:text-[var(--foreground)]
            "
          />

          <span className="flex-1">
            Leaderboard
          </span>


        </button>





        {/* SEPARATOR */}

        <div
          className="
            my-1
            h-px
            bg-[var(--border)]
          "
        />





        {/* LOGOUT */}

        <button

          onClick={onLogout}

          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-2.5
            py-2
            text-left
            text-sm
            font-medium
            text-red-500
            transition-colors
            hover:bg-red-500/10
          "

        >

          <LogOut size={16}/>

          <span className="flex-1">
            Log Out
          </span>


        </button>


      </div>


    </div>

  )

}