'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import TopMenu from './TopMenu'
import ThemeToggle from './ThemeToggle'
import { Bell, Menu, X, Video } from 'lucide-react'


interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
}


interface TopNavProps {
  user: UserProfile | null
  onLogin: () => void
  onLogout: () => void
}



export default function TopNav({
  user,
  onLogin,
  onLogout,
}: TopNavProps) {


  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)

  const navMenuRef = useRef<HTMLDivElement | null>(null)



  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {

      if (
        navMenuRef.current &&
        !navMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
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

  }, [])




  return (

    <header
      className="
        sticky
        top-0
        z-40
        w-full
        border-b
        border-[var(--border)]
        bg-[var(--background)]/90
        text-[var(--foreground)]
        backdrop-blur-xl
        transition-all
        duration-300
      "
    >


      <div
        className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          px-3
          py-2.5
          sm:px-6
          sm:py-3
        "
      >



        {/* LEFT */}

        <div
          className="
            flex
            items-center
            gap-3
            sm:gap-6
          "
        >



          {/* LOGO */}

          <button
            onClick={() => router.push('/')}
            className="
              group
              flex
              items-center
              rounded-md
            "
          >

            <h1
              className="
                text-base
                sm:text-lg
                font-black
                uppercase
                tracking-wider
                text-[var(--foreground)]
                transition-colors
                group-hover:text-[var(--accent)]
              "
            >

              street
              <span className="text-[var(--accent)]">
                go
              </span>

            </h1>

          </button>







          {/* MAP - DESKTOP ONLY */}

          <div className="hidden sm:block">

            <button
              onClick={() => router.push('/map')}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-[var(--border)]
                bg-[var(--surface)]
                transition
                hover:border-[var(--border-hover)]
                hover:bg-[var(--surface-hover)]
              "
            >

              <div className="relative h-5 w-5">

                <Image
                  src="/map-icon.png"
                  alt="map"
                  fill
                  className="object-contain"
                  priority
                />

              </div>

            </button>

          </div>


        </div>








        {/* RIGHT */}

        <div
          className="
            flex
            items-center
            gap-1.5
            sm:gap-3
          "
        >






          {/* FEEDS DESKTOP ONLY */}

          <button
            onClick={() => router.push('/videos')}
            className="
              hidden
              sm:flex
              group
              items-center
              gap-2
              rounded-lg
              border
              border-[var(--border)]
              bg-[var(--surface)]
              px-3
              py-1.5
              text-xs
              font-medium
              text-[var(--muted)]
              transition
              hover:border-[var(--border-hover)]
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--foreground)]
            "
          >

            <Video size={14}/>

            <span>
              Feeds
            </span>


            <span
              className="
                relative
                flex
                h-1.5
                w-1.5
              "
            >

              <span
                className="
                  absolute
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-[var(--accent)]
                  opacity-75
                "
              />

              <span
                className="
                  relative
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-[var(--accent)]
                "
              />

            </span>


          </button>







          {/* NOTIFICATION */}

          {
            user && (

              <button
                onClick={() => router.push('/notifications')}
                className="
                  flex
                  h-8
                  w-8
                  sm:h-9
                  sm:w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]
                  text-[var(--muted)]
                  transition
                  hover:bg-[var(--surface-hover)]
                  hover:text-[var(--foreground)]
                "
              >

                <Bell size={15}/>

              </button>

            )
          }








          {/* LOGIN MOBILE/DESKTOP */}

          {
            !user && (

              <button
                onClick={onLogin}
                className="
                  rounded-lg
                  bg-[var(--primary)]
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-[var(--primary-foreground)]
                  transition
                  hover:opacity-90
                "
              >

                Sign In

              </button>

            )
          }









          {/* THEME */}

          <ThemeToggle />










          {/* MENU */}

          <div
            ref={navMenuRef}
            className="relative"
          >


            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`
                flex
                h-8
                w-8
                sm:h-9
                sm:w-9
                items-center
                justify-center
                rounded-lg
                border
                transition

                ${
                  menuOpen

                  ?

                  `
                  border-[var(--border-hover)]
                  bg-[var(--surface-hover)]
                  text-[var(--foreground)]
                  `

                  :

                  `
                  border-[var(--border)]
                  bg-[var(--surface)]
                  text-[var(--muted)]
                  hover:bg-[var(--surface-hover)]
                  hover:text-[var(--foreground)]
                  `
                }
              `}
            >

              {
                menuOpen
                ?
                <X size={15}/>
                :
                <Menu size={15}/>
              }


            </button>





            {
              menuOpen && (

                <div
                  className="
                    absolute
                    right-0
                    top-10
                    z-50
                    w-56
                    rounded-xl
                    border
                    border-[var(--border)]
                    bg-[var(--background)]
                    p-1
                    shadow-xl
                  "
                >

                  <TopMenu
                    onLogout={onLogout}
                    onClose={() => setMenuOpen(false)}
                  />

                </div>

              )
            }


          </div>



        </div>



      </div>


    </header>

  )

}