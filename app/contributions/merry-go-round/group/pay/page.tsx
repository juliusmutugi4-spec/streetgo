"use client"

import { useRouter } from "next/navigation"

export default function ContributionPayPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-md">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push("/contributions/merry-go-round/group")
          }
          className="mb-8 text-sm font-bold text-blue-300"
        >
          ← BACK TO GROUP
        </button>


        {/* HEADER */}

        <div className="mb-8">

          <p className="text-xs font-black tracking-[0.2em] text-emerald-400">
            STREETGO CONTRIBUTIONS
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Make Contribution
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Confirm your contribution before we request payment.
          </p>

        </div>


        {/* PAYMENT CARD */}

        <div className="rounded-3xl border border-blue-900/60 bg-[#071426] p-5 shadow-2xl">

          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            Contribution Group
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Eastlands Friends
          </h2>


          {/* AMOUNT */}

          <div className="mt-6 rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-5 text-center">

            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Amount Due
            </p>

            <p className="mt-2 text-4xl font-black text-white">
              KES 1,000
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Round 1 contribution
            </p>

          </div>


          {/* DETAILS */}

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">

              <span className="text-sm text-slate-400">
                Frequency
              </span>

              <span className="font-bold">
                Monthly
              </span>

            </div>


            <div className="flex items-center justify-between border-b border-slate-800 pb-3">

              <span className="text-sm text-slate-400">
                Current pool
              </span>

              <span className="font-bold">
                KES 5,000
              </span>

            </div>


            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-400">
                Pool target
              </span>

              <span className="font-bold text-emerald-400">
                KES 6,000
              </span>

            </div>

          </div>


          {/* PAYMENT NOTICE */}

          <div className="mt-6 rounded-2xl border border-blue-900/50 bg-blue-950/20 p-4">

            <p className="text-xs font-black text-blue-300">
              M-PESA PAYMENT
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Your verified Safaricom number will receive an
              M-PESA payment request. You will confirm the payment
              on your phone.
            </p>

          </div>


          {/* PAY BUTTON */}

          <button
            type="button"
            onClick={() => {
              console.log("Contribution payment requested")
            }}
            className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-[#03130d] transition hover:bg-emerald-300"
          >
            REQUEST M-PESA PAYMENT
          </button>


          <button
            type="button"
            onClick={() =>
              router.push("/contributions/merry-go-round/group")
            }
            className="mt-3 w-full rounded-2xl border border-slate-800 px-5 py-4 text-sm font-bold text-slate-400 hover:bg-white/[0.03]"
          >
            CANCEL
          </button>

        </div>


        {/* SECURITY */}

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">

          <p className="text-xs font-black text-slate-300">
            SECURITY
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            StreetGO will never ask for your M-PESA PIN.
            Only approve a payment that you initiated yourself.
          </p>

        </div>

      </div>
    </main>
  )
}