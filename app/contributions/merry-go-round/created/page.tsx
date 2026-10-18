"use client"

import {
  useRouter,
  useSearchParams,
} from "next/navigation"

import {
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"

import {
  Suspense,
  useState,
} from "react"

function MerryGoRoundCreatedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [copied, setCopied] = useState(false)

  const groupNumber =
    searchParams.get("groupNumber") || ""

  const groupId =
    searchParams.get("groupId") || ""

  const phone =
    searchParams.get("phone") || ""

  const verified =
    searchParams.get("verified") === "1"

  const copyGroupNumber = async () => {
    if (!groupNumber) return

    try {
      await navigator.clipboard.writeText(
        groupNumber
      )

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      console.error(
        "Could not copy group number"
      )
    }
  }

  const openGroup = () => {
    if (!groupId) {
      console.error("Missing group ID")
      return
    }

    if (!verified) {
      router.push(
        `/contributions/merry-go-round/organizer-verify?groupId=${encodeURIComponent(
          groupId
        )}&groupNumber=${encodeURIComponent(
          groupNumber
        )}&phone=${encodeURIComponent(
          phone
        )}`
      )

      return
    }

    router.push(
      `/contributions/merry-go-round/group?groupId=${encodeURIComponent(
        groupId
      )}`
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-md">

        {/* Success */}
        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/10">
            <Check
              size={42}
              className="text-emerald-400"
            />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            STREETGO CONTRIBUTIONS
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Group Created
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Your Merry-Go-Round has been created
            successfully. You can now invite your
            members.
          </p>

        </div>

        {/* Group Number */}
        <div className="mt-8 rounded-3xl border border-emerald-400/30 bg-emerald-400/[0.06] p-6">

          <p className="text-center text-xs font-black uppercase tracking-wider text-emerald-400">
            Your Group Number
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#020617] p-5 text-center">

            <p className="break-all text-2xl font-black tracking-widest text-white">
              {groupNumber ||
                "GROUP NUMBER UNAVAILABLE"}
            </p>

          </div>

          <button
            type="button"
            disabled={!groupNumber}
            onClick={copyGroupNumber}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy size={17} />

            {copied
              ? "COPIED"
              : "COPY GROUP NUMBER"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-slate-500">
            Share this number only with the people
            you want to join your group.
          </p>

        </div>

        {/* Organizer Security */}
        <div
          className={`mt-5 rounded-3xl border p-5 ${
            verified
              ? "border-emerald-500/30 bg-emerald-950/20"
              : "border-cyan-500/30 bg-cyan-950/20"
          }`}
        >

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                verified
                  ? "bg-emerald-400/10"
                  : "bg-cyan-400/10"
              }`}
            >
              <ShieldCheck
                size={22}
                className={
                  verified
                    ? "text-emerald-400"
                    : "text-cyan-400"
                }
              />
            </div>

            <div>
              <p
                className={`text-sm font-black ${
                  verified
                    ? "text-emerald-300"
                    : "text-cyan-300"
                }`}
              >
                {verified
                  ? "Organizer verified"
                  : "Organizer verification required"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {verified
                  ? "Your Safaricom number has been verified."
                  : "Verify your Safaricom number before opening the group."}
              </p>
            </div>

          </div>

          {!verified && (
            <p className="mt-4 text-xs leading-5 text-slate-400">
              This protects the contribution group
              and ensures that future M-PESA
              contribution and payout transactions
              are connected to the correct organizer.
            </p>
          )}

        </div>

        {/* How members join */}
        <div className="mt-5 rounded-3xl border border-blue-900/50 bg-blue-950/20 p-5">

          <p className="text-sm font-black text-blue-300">
            How members join
          </p>

          <div className="mt-4 space-y-3 text-xs leading-5 text-slate-400">

            <p>
              1. Member opens StreetGO
              Contributions.
            </p>

            <p>
              2. Member selects JOIN WITH
              INVITATION.
            </p>

            <p>
              3. Member enters this group number.
            </p>

            <p>
              4. StreetGO verifies the member&apos;s
              account.
            </p>

            <p>
              5. Member joins the group.
            </p>

          </div>

        </div>

        {/* Database status */}
        <div className="mt-5 rounded-3xl border border-emerald-900/40 bg-emerald-950/20 p-5">

          <p className="text-sm font-black text-emerald-300">
            Group secured
          </p>

          <p className="mt-2 text-xs leading-5 text-emerald-100/70">
            This group has been saved to StreetGO.
            Its membership and contribution records
            will be linked to this group.
          </p>

        </div>

        {/* Open / Verify */}
        <button
          type="button"
          disabled={!groupId}
          onClick={openGroup}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-[#03130d] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {verified
            ? "OPEN GROUP"
            : "VERIFY ORGANIZER NUMBER"}

          <ArrowRight size={18} />
        </button>

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push("/contributions")
          }
          className="mt-3 w-full rounded-2xl border border-slate-800 px-5 py-4 text-sm font-bold text-slate-400 transition hover:bg-white/[0.03]"
        >
          BACK TO CONTRIBUTIONS
        </button>

      </div>
    </main>
  )
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-md text-center">
        <div className="mt-20">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-emerald-400/20" />

          <p className="mt-5 text-sm font-bold text-slate-400">
            Loading contribution group...
          </p>
        </div>
      </div>
    </main>
  )
}

export default function MerryGoRoundCreatedPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MerryGoRoundCreatedContent />
    </Suspense>
  )
}