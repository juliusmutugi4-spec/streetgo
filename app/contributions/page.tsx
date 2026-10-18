"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, ChevronRight } from "lucide-react"

export default function ContributionsPage() {
  const router = useRouter()

  // Temporary: later this will come from Supabase
  const hasGroups = false

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-4">
          <button
            onClick={() => router.back()}
            className="mr-3 rounded-full p-2 transition hover:bg-white/10"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-lg font-black tracking-tight">
              STREETGO CONTRIBUTIONS
            </h1>

            <p className="text-[11px] text-slate-400">
              Build together. Contribute together.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-5 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
            Contribution Hub
          </p>

          <h2 className="mt-2 text-3xl font-black">
            My Contributions
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Manage your groups, contributions and payouts in one place.
          </p>
        </div>

        {/* Existing groups */}
        {hasGroups && (
          <div className="space-y-4">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">
                My Groups
              </h3>

              <span className="text-xs text-slate-500">
                Active
              </span>
            </div>

            {/* Example group card */}
            <button
              onClick={() =>
                router.push("/contributions/merry-go-round")
              }
              className="w-full rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-emerald-950/40 p-5 text-left transition hover:border-emerald-400/60"
            >
              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-3xl">
                  🔄
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black">
                    Eastlands Friends
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    6 members · KES 1,000/month
                  </p>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        Round 2 of 6
                      </span>

                      <span className="font-bold text-emerald-400">
                        KES 5,000 / 6,000
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: "83.33%" }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-400">
                      YOUR CONTRIBUTION: PAID
                    </span>

                    <ChevronRight
                      size={20}
                      className="text-emerald-400"
                    />
                  </div>
                </div>

              </div>
            </button>
          </div>
        )}

        {/* No groups */}
        {!hasGroups && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/10 text-4xl">
              🔄
            </div>

            <h3 className="mt-5 text-xl font-black">
              You have no contribution groups yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Create a group or join one using an invitation from
              another StreetGO member.
            </p>

            <div className="mt-6 space-y-3">

              <button
                onClick={() =>
                  router.push("/contributions/merry-go-round")
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 font-black text-[#02130b] transition hover:bg-emerald-300"
              >
                <Plus size={20} />
                CREATE MERRY-GO-ROUND
              </button>

<button
  type="button"
  onClick={() =>
    router.push("/contributions/merry-go-round/join")
  }
  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-bold text-slate-300 transition hover:bg-white/[0.07]"
>
  JOIN WITH INVITATION
</button>
            </div>
          </div>
        )}

      </section>
    </main>
  )
}