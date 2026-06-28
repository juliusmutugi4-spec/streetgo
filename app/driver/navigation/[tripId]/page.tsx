'use client'

type Props = {
  params: {
    tripId: string
  }
}

export default function DriverNavigationPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

      <h1 className="text-3xl font-bold">
        Driver Navigation
      </h1>

      <p className="mt-4 text-cyan-400">
        Trip ID:
      </p>

      <p className="text-sm text-zinc-400 break-all">
        {params.tripId}
      </p>

    </main>
  )
}