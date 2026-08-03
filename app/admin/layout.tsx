'use client'

import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#060608] text-white flex">

      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6">

        <h1 className="text-2xl font-black mb-10">
          StreetGO Admin
        </h1>

        <nav className="space-y-2">

          <Link
            href="/admin"
            className="block px-4 py-3 rounded-xl hover:bg-zinc-800"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/admin/drivers"
            className="block px-4 py-3 rounded-xl hover:bg-zinc-800"
          >
            🚖 Drivers
          </Link>

          <Link
            href="/admin/videos"
            className="block px-4 py-3 rounded-xl hover:bg-zinc-800"
          >
            🎬 Videos
          </Link>

        </nav>

      </aside>

      {/* Page Content */}
      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  )
}