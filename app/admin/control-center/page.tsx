'use client'

import Link from 'next/link'

export default function ControlCenter() {

  return (
    <main className="min-h-screen bg-[#09090b] text-white p-8">

      <h1 className="text-3xl font-bold">
        👑 StreetGO Control Center
      </h1>

      <p className="text-zinc-400 mt-2">
        Manage platform operations and administrators.
      </p>


      <div className="grid md:grid-cols-3 gap-5 mt-8">


        <Link
          href="/admin/admins"
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800"
        >
          <h2 className="font-semibold">
            👑 Admin Team
          </h2>

          <p className="text-sm text-zinc-400 mt-2">
            Add and manage StreetGO administrators.
          </p>

        </Link>



        <Link
          href="/admin/drivers"
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800"
        >
          <h2 className="font-semibold">
            🚗 Drivers
          </h2>

          <p className="text-sm text-zinc-400 mt-2">
            Approve and manage drivers.
          </p>

        </Link>



        <Link
          href="/admin/videos"
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800"
        >
          <h2 className="font-semibold">
            🎬 Content
          </h2>

          <p className="text-sm text-zinc-400 mt-2">
            Manage videos and uploads.
          </p>

        </Link>


      </div>

    </main>
  )
}