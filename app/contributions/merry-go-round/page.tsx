"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function MerryGoRoundPage() {
  const router = useRouter()

  const [groupName, setGroupName] = useState("")
  const [phone, setPhone] = useState("")
  const [memberCount, setMemberCount] = useState<5 | 6>(6)
  const [amount, setAmount] = useState("")
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly")
  const [startDate, setStartDate] = useState("")

const normalizedPhone = phone.replace(/\D/g, "")

const canContinue =
  groupName.trim() &&
  normalizedPhone.length === 10 &&
  normalizedPhone.startsWith("07") &&
  amount &&
  Number(amount) > 0 &&
  startDate

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-4">
          <button
            onClick={() => router.back()}
            className="mr-3 rounded-full p-2 transition hover:bg-white/10"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-lg font-black">
              MERRY-GO-ROUND
            </h1>

            <p className="text-[11px] text-slate-400">
              Create your group
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <section className="mx-auto max-w-2xl px-5 py-8">
        <div className="mb-8">
          <div className="mb-3 text-4xl">🔄</div>

          <h2 className="text-3xl font-black">
            Create your group
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Set the basic rules before inviting your members.
          </p>
        </div>

        <div className="space-y-6">

          {/* Group Name */}
          <div>
            <label className="mb-2 block text-sm font-bold">
              Group name
            </label>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Eastlands Friends"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
            />
          </div>






          {/* Members */}
          <div>
            <label className="mb-2 block text-sm font-bold">
              Number of members
            </label>

            <div className="grid grid-cols-2 gap-3">
              {[5, 6].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setMemberCount(count as 5 | 6)}
                  className={`rounded-2xl border p-4 text-center transition ${
                    memberCount === count
                      ? "border-emerald-400 bg-emerald-400/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="text-2xl font-black">
                    {count}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    members
                  </div>
                </button>
              ))}
            </div>
          </div>


{/* Organizer Safaricom Number */}
<div>
  <label className="mb-2 block text-sm font-bold">
    Organizer Safaricom number
  </label>

  <input
    type="tel"
    inputMode="numeric"
    value={phone}
    onChange={(e) =>
      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
    }
    placeholder="07XXXXXXXX"
    className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
  />

  <p className="mt-2 text-xs leading-5 text-slate-500">
    This number will be used for your contribution payments and,
    when it is your turn, your M-PESA payout.
  </p>
</div>






          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm font-bold">
              Contribution amount
            </label>

            <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] focus-within:border-emerald-400">
              <div className="flex items-center px-4 text-sm font-bold text-emerald-400">
                KES
              </div>

              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1,000"
                className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="mb-2 block text-sm font-bold">
              Contribution frequency
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFrequency("weekly")}
                className={`rounded-2xl border p-4 transition ${
                  frequency === "weekly"
                    ? "border-emerald-400 bg-emerald-400/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="font-black">Weekly</div>

                <div className="mt-1 text-xs text-slate-400">
                  Every week
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFrequency("monthly")}
                className={`rounded-2xl border p-4 transition ${
                  frequency === "monthly"
                    ? "border-emerald-400 bg-emerald-400/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="font-black">Monthly</div>

                <div className="mt-1 text-xs text-slate-400">
                  Every month
                </div>
              </button>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="mb-2 block text-sm font-bold">
              Start date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none focus:border-emerald-400"
            />
          </div>

          {/* Preview */}
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Group preview
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">
                  Members
                </p>

                <p className="mt-1 text-lg font-black">
                  {memberCount}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Pool per round
                </p>

                <p className="mt-1 text-lg font-black">
                  KES{" "}
                  {amount
                    ? (Number(amount) * memberCount).toLocaleString()
                    : "0"}
                </p>
              </div>
            </div>
          </div>

          {/* Continue */}
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => {
              if (!canContinue) return

const params = new URLSearchParams({
  groupName: groupName.trim(),
  members: String(memberCount),
  amount: String(Number(amount)),
  frequency,
  startDate,
  phone: normalizedPhone,
})

              router.push(
                `/contributions/merry-go-round/review?${params.toString()}`
              )
            }}
            className="w-full rounded-2xl bg-emerald-400 px-5 py-4 text-base font-black text-[#02130b] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            CONTINUE
          </button>
        </div>
      </section>
    </main>
  )
}