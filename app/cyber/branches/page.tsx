
"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

interface Branch {
  id: string
  branch_name: string
  address: string | null
  city: string | null
  phone: string | null
  status: string
  created_at: string
}

interface BranchResponse {
  branches?: Branch[]
  merchantStatus?: string
  error?: string
}

export default function CyberBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [merchantStatus, setMerchantStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [branchName, setBranchName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")

  const canCreate = merchantStatus === "active"

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/cyber/branches", {
        cache: "no-store",
      })

      const result: BranchResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to load branches.")
      }

      setBranches(result.branches || [])
      setMerchantStatus(result.merchantStatus || "")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBranches()
  }, [loadBranches])

  async function handleCreateBranch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!canCreate) return

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/cyber/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branch_name: branchName,
          address,
          city,
          phone,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to create branch.")
      }

      setSuccess("Branch created successfully.")
      setBranchName("")
      setAddress("")
      setCity("")
      setPhone("")

      await loadBranches()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/cyber/dashboard"
              className="mb-3 inline-block text-sm text-gray-400 hover:text-white"
            >
              ← Back to dashboard
            </Link>

            <h1 className="text-3xl font-bold">Branch Management</h1>

            <p className="mt-2 text-sm text-gray-400">
              Manage your cyber business locations.
            </p>
          </div>

          <div className="rounded-full border border-gray-700 px-4 py-2 text-sm">
            {branches.length} branches
          </div>
        </div>

        {merchantStatus && (
          <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-300">Business approval</span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  canCreate
                    ? "bg-green-900 text-green-300"
                    : "bg-yellow-900 text-yellow-300"
                }`}
              >
                {merchantStatus.toUpperCase()}
              </span>
            </div>

            {!canCreate && (
              <p className="mt-3 text-sm text-gray-400">
                Branch creation will become available after your
                business registration is approved.
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-800 bg-green-950 p-3 text-sm text-green-300">
            {success}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-7">
          <h2 className="mb-5 text-xl font-semibold">Add a branch</h2>

          <form onSubmit={handleCreateBranch} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Branch name *
              </label>
              <input
                required
                minLength={2}
                maxLength={100}
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Mars Cyber - Industrial Area"
                disabled={!canCreate || saving}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  City
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Nairobi"
                  disabled={!canCreate || saving}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Phone number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  disabled={!canCreate || saving}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Physical address
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, building or landmark"
                disabled={!canCreate || saving}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!canCreate || saving}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {saving ? "Creating..." : "Create branch"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-5 text-xl font-semibold">Your branches</h2>

          {loading ? (
            <p className="text-gray-400">Loading branches...</p>
          ) : branches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center">
              <h3 className="font-semibold">No branches yet</h3>
              <p className="mt-2 text-sm text-gray-400">
                Your branches will appear here after you create them.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {branches.map((branch) => (
                <article
                  key={branch.id}
                  className="rounded-xl border border-gray-800 bg-gray-900 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{branch.branch_name}</h3>
                    <span className="rounded-full bg-gray-800 px-3 py-1 text-xs">
                      {branch.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-400">
                    {[branch.address, branch.city]
                      .filter(Boolean)
                      .join(", ") || "No address added"}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    {branch.phone || "No phone number"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
