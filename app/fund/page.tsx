"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/app/lib/supabase-browser"

type DestinationType = "phone" | "paybill" | "till" | "bank"

export default function FundPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [destinationType, setDestinationType] =
    useState<DestinationType>("phone")

  const [phone, setPhone] = useState("")
  const [paybill, setPaybill] = useState("")
  const [account, setAccount] = useState("")
  const [till, setTill] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccount, setBankAccount] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function createSlug(text: string) {
    return (
      text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 8)
    )
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Enter a fundraiser title.")
      return
    }

    if (!targetAmount || Number(targetAmount) <= 0) {
      setError("Enter a valid target amount.")
      return
    }

    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push("/login")
        return
      }

      const slug = createSlug(title)

      const { data, error: insertError } = await supabase
        .from("fundraising_campaigns")
        .insert({
          organizer_id: session.user.id,
          title: title.trim(),
          description: description.trim() || null,
          target_amount: Number(targetAmount),
          slug,

          destination_type: destinationType,

          destination_phone:
            destinationType === "phone" ? phone.trim() || null : null,

          destination_paybill:
            destinationType === "paybill" ? paybill.trim() || null : null,

          destination_account:
            destinationType === "paybill" ? account.trim() || null : null,

          destination_till:
            destinationType === "till" ? till.trim() || null : null,

          destination_bank_name:
            destinationType === "bank" ? bankName.trim() || null : null,

          destination_bank_account:
            destinationType === "bank"
              ? bankAccount.trim() || null
              : null,
        })
        .select("id, slug")
        .single()

      if (insertError) {
        throw insertError
      }

      router.push("/fund/dashboard")
    } catch (err: any) {
      console.error("FUNDRAISER CREATE ERROR:", err)

      setError(
        err?.message ||
          err?.details ||
          "Could not create fundraiser. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">
            STREETGO FUND
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Create a fundraiser
          </h1>

          <p className="mt-2 text-white/60">
            Create your campaign and share one StreetGO link with
            contributors.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          {/* TITLE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Fundraiser title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Help John with hospital bills"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people what this fundraiser is about..."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* TARGET AMOUNT */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Target amount
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-black/30">
              <span className="px-4 text-white/50">
                KES
              </span>

              <input
                type="number"
                min="1"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="100000"
                className="w-full bg-transparent px-2 py-3 outline-none"
              />
            </div>
          </div>

          {/* DESTINATION */}
          <div>
            <label className="mb-3 block text-sm font-medium">
              Where should the fundraiser money go?
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* PHONE - ENABLED */}
              <button
                type="button"
                onClick={() => setDestinationType("phone")}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  destinationType === "phone"
                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                    : "border-white/10 bg-black/20 text-white/70"
                }`}
              >
                Phone Number
              </button>

              {/* PAYBILL - DISABLED */}
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/30 opacity-50"
              >
                PayBill
              </button>

              {/* TILL - DISABLED */}
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/30 opacity-50"
              >
                Till Number
              </button>

              {/* BANK - DISABLED */}
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/30 opacity-50"
              >
                Bank
              </button>
            </div>
          </div>

          {/* PHONE */}
          {destinationType === "phone" && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Recipient phone number
              </label>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* PAYBILL */}
          {destinationType === "paybill" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  PayBill number
                </label>

                <input
                  value={paybill}
                  onChange={(e) => setPaybill(e.target.value)}
                  placeholder="PayBill number"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Account / Reference
                </label>

                <input
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="Account number"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TILL */}
          {destinationType === "till" && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Till number
              </label>

              <input
                value={till}
                onChange={(e) => setTill(e.target.value)}
                placeholder="Till number"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* BANK */}
          {destinationType === "bank" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Bank name
                </label>

                <input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank name"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Account number
                </label>

                <input
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Bank account"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating fundraiser..."
              : "Create Fundraiser"}
          </button>
        </form>
      </div>
    </main>
  )
}