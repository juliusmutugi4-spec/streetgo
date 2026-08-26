'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Car, 
  Film, 
  CircleDollarSign,
  Satellite,
  LogOut, 
  User 
} from 'lucide-react'

import type { ComponentType } from 'react'

interface NavigationItem {
  name: string
  href: string
  icon: ComponentType<{ className?: string }>
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Drivers',
    href: '/admin/drivers',
    icon: Car
  },
  {
    name: 'Videos',
    href: '/admin/videos',
    icon: Film
  },
  {
    name: 'Finance',
    href: '/admin/finance',
    icon: CircleDollarSign
  },
  {
    name: 'Satellite Radar',
    href: '/admin/satellite',
    icon: Satellite
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50 antialiased">

      {/* SIDEBAR */}
      <aside className="
        fixed inset-y-0 left-0
        flex w-64 flex-col
        border-r border-zinc-800
        bg-zinc-900/50
        backdrop-blur-xl
        px-6 py-8
      ">

        {/* BRAND */}
        <div className="flex h-10 items-center px-4">
          <span className="
            text-xl font-bold tracking-tight
            bg-gradient-to-r from-white to-zinc-400
            bg-clip-text text-transparent
          ">
            StreetGO Admin
          </span>
        </div>


        {/* NAVIGATION */}
        <nav className="mt-10 flex-1 space-y-1">

          {navigation.map((item)=>{

            const Icon = item.icon

            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/')

            return (

              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3
                  rounded-lg px-4 py-3
                  text-sm font-medium
                  transition-all duration-200
                  group

                  ${
                    isActive
                    ?
                    `
                    bg-zinc-800
                    text-white
                    shadow-sm
                    ring-1 ring-zinc-700
                    `
                    :
                    `
                    text-zinc-400
                    hover:bg-zinc-800/50
                    hover:text-zinc-200
                    `
                  }
                `}
              >

                <Icon
                  className={`
                    h-4 w-4 shrink-0

                    ${
                      isActive
                      ?
                      'text-white'
                      :
                      'text-zinc-500 group-hover:text-zinc-300'
                    }
                  `}
                />

                {item.name}

              </Link>

            )

          })}

        </nav>


        {/* USER FOOTER */}
        <div className="
          mt-auto
          border-t border-zinc-800
          pt-6
        ">

          <div className="
            flex items-center
            justify-between
            px-4
          ">

            <div className="
              flex items-center gap-3
            ">

              <div className="
                flex h-8 w-8
                items-center justify-center
                rounded-full
                bg-zinc-800
                border border-zinc-700
              ">
                <User className="
                  h-4 w-4
                  text-zinc-400
                "/>
              </div>


              <div className="
                flex flex-col
              ">

                <span className="
                  text-xs
                  font-medium
                  text-zinc-200
                ">
                  Admin User
                </span>

                <span className="
                  text-[10px]
                  text-zinc-500
                ">
                  System Control
                </span>

              </div>

            </div>


            <button
              className="
                rounded-lg
                p-1.5
                text-zinc-500
                hover:bg-zinc-800
                hover:text-zinc-300
                transition-colors
              "
            >

              <LogOut className="
                h-4 w-4
              "/>

            </button>


          </div>

        </div>


      </aside>



      {/* MAIN CONTENT */}

      <div className="
        pl-64
        flex
        min-w-0
        flex-1
        flex-col
      ">

        <main className="
          relative
          min-w-0
          w-full
          max-w-[1500px]
        ">

          {children}

        </main>

      </div>


    </div>
  )
}