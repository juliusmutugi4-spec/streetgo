'use client'

import { Home, MessageCircle, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CreateButton from './CreateButton'


interface UserProfile {
  username?: string
  avatar_url?: string | null
}


interface BottomNavProps {
  profile: UserProfile | null
  unreadCount: number
  onCreateSelect: (mode: 'post' | 'prediction') => void
}



export default function BottomNav({
  profile,
  unreadCount,
  onCreateSelect
}: BottomNavProps) {


  const router = useRouter()


  const navigate = (path:string) => {
    router.push(path)
  }



  return (

    <nav
      className="
        lg:hidden
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-[var(--border)]
        bg-[var(--background)]/80
        backdrop-blur-xl
        text-[var(--muted)]
        shadow-[0_-10px_30px_rgba(0,0,0,0.15)]
        select-none
        transition-all
        duration-300
      "
    >


      <div
        className="
          mx-auto
          grid
          h-14
          max-w-xl
          grid-cols-4
          items-center
          justify-items-center
          px-4
        "
      >





        {/* FEED */}


        <button

          onClick={() => navigate('/')}

          className="
            group
            flex
            w-full
            flex-col
            items-center
            justify-center
            py-1
            transition-all
            duration-200
            hover:text-[var(--foreground)]
            active:scale-95
          "

        >

          <Home
            size={18}
            className="
              transition-transform
              duration-200
              group-hover:scale-110
            "
          />


          <span
            className="
              mt-1
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-[var(--muted)]
              group-hover:text-[var(--foreground)]
            "
          >
            Feed
          </span>


        </button>







        {/* CREATE */}


        <div
          className="
            relative
            flex
            w-full
            items-center
            justify-center
          "
        >

          <CreateButton
            onCreateSelect={onCreateSelect}
          />

        </div>









        {/* MESSAGES */}



        <button

          onClick={() => navigate('/messages')}

          className="
            group
            relative
            flex
            w-full
            flex-col
            items-center
            justify-center
            py-1
            transition-all
            duration-200
            hover:text-[var(--foreground)]
            active:scale-95
          "

        >


          <div className="relative">


            <MessageCircle
              size={18}
              className="
                transition-transform
                duration-200
                group-hover:scale-110
              "
            />



            {
              unreadCount > 0 && (

                <span
                  className="
                    absolute
                    -right-2.5
                    -top-1.5
                    flex
                    h-[14px]
                    min-w-[14px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[var(--background)]
                    bg-red-500
                    px-1
                    text-[8px]
                    font-black
                    text-white
                    shadow-lg
                    animate-pulse
                  "
                >

                  {
                    unreadCount > 99
                    ? '99+'
                    : unreadCount
                  }

                </span>

              )
            }



          </div>



          <span
            className="
              mt-1
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-[var(--muted)]
              group-hover:text-[var(--foreground)]
            "
          >
            Comms
          </span>


        </button>








        {/* PROFILE */}



        <button

          onClick={() =>
            navigate(
              profile?.username
              ? `/profile/${profile.username}`
              : '/'
            )
          }

          className="
            group
            flex
            w-full
            flex-col
            items-center
            justify-center
            py-1
            transition-all
            duration-200
            hover:text-[var(--foreground)]
            active:scale-95
          "

        >


          {
            profile?.avatar_url ? (

              <div
                className="
                  relative
                  h-5
                  w-5
                  overflow-hidden
                  rounded-md
                  border
                  border-[var(--border)]
                  transition-all
                  duration-200
                  group-hover:scale-110
                "
              >

                <Image
                  src={profile.avatar_url}
                  alt="Profile"
                  fill
                  className="object-cover"
                />

              </div>


            ) : (


              <User
                size={18}
                className="
                  transition-transform
                  duration-200
                  group-hover:scale-110
                "
              />


            )
          }



          <span
            className="
              mt-1
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-[var(--muted)]
              group-hover:text-[var(--foreground)]
            "
          >
            User
          </span>


        </button>



      </div>


    </nav>

  )
}