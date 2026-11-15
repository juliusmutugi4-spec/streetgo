"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

interface Branch {
  id: string
  branch_name: string
}

interface Computer {
  id: string
  computer_name: string
  branch_id: string
}

interface Rate {
  id: string
  branch_id?: string
  computer_id?: string
  hourly_rate_kes: number
}

interface TimePackage {
  id: string
  branch_id: string
  computer_id: string | null
  package_name: string
  duration_minutes: number
  price_kes: number
  is_active: boolean
}

export default function CyberPricingPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [computers, setComputers] = useState<Computer[]>([])
  const [branchPricing, setBranchPricing] = useState<Rate[]>([])
  const [computerPricing, setComputerPricing] = useState<Rate[]>([])
  const [packages, setPackages] = useState<TimePackage[]>([])
  const [merchantStatus, setMerchantStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [branchId, setBranchId] = useState("")
  const [branchRate, setBranchRate] = useState("")
  const [computerId, setComputerId] = useState("")
  const [computerRate, setComputerRate] = useState("")
  const [packageBranchId, setPackageBranchId] = useState("")
  const [packageComputerId, setPackageComputerId] = useState("")
  const [packageName, setPackageName] = useState("")
  const [duration, setDuration] = useState("60")
  const [price, setPrice] = useState("")

  const canManage = merchantStatus === "active"

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/cyber/pricing", {
        cache: "no-store",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unable to load pricing.")
      }

      setBranches(data.branches || [])
      setComputers(data.computers || [])
      setBranchPricing(data.branchPricing || [])
      setComputerPricing(data.computerPricing || [])
      setPackages(data.packages || [])
      setMerchantStatus(data.merchantStatus || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load pricing.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function savePricing(payload: Record<string, unknown>) {
    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/cyber/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unable to save pricing.")
      }

      setSuccess("Pricing saved successfully.")
      await loadData()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save pricing.")
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleBranchRate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canManage) return

    if (await savePricing({
      action: "branch_rate",
      branch_id: branchId,
      hourly_rate_kes: Number(branchRate),
    })) {
      setBranchRate("")
    }
  }

  async function handleComputerRate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canManage) return

    if (await savePricing({
      action: "computer_rate",
      computer_id: computerId,
      hourly_rate_kes: Number(computerRate),
    })) {
      setComputerRate("")
    }
  }

  async function handlePackage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canManage) return

    if (await savePricing({
      action: "create_package",
      branch_id: packageBranchId,
      computer_id: packageComputerId || null,
      package_name: packageName,
      duration_minutes: Number(duration),
      price_kes: Number(price),
    })) {
      setPackageName("")
      setDuration("60")
      setPrice("")
      setPackageComputerId("")
    }
  }

  async function togglePackage(pkg: TimePackage) {
    await savePricing({
      action: "update_package",
      package_id: pkg.id,
      package_name: pkg.package_name,
      duration_minutes: pkg.duration_minutes,
      price_kes: Number(pkg.price_kes),
      is_active: !pkg.is_active,
    })
  }

  function branchName(id: string) {
    return branches.find((item) => item.id === id)?.branch_name || "Unknown branch"
  }

  function computerName(id: string) {
    return computers.find((item) => item.id === id)?.computer_name || "Unknown PC"
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/cyber/dashboard" className="mb-4 inline-block text-sm text-gray-400 hover:text-white">
          ← Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage hourly rates and customer time packages.
          </p>
        </div>

        {merchantStatus && (
          <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-4">
            <div className="flex justify-between gap-3">
              <span className="text-gray-300">Business approval</span>
              <span className="text-sm font-semibold text-yellow-400">
                {merchantStatus.toUpperCase()}
              </span>
            </div>
            {!canManage && (
              <p className="mt-3 text-sm text-gray-400">
                Pricing changes become available after business approval.
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

        {loading ? (
          <p className="text-gray-400">Loading pricing...</p>
        ) : (
          <>
            <section className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-7">
              <h2 className="mb-2 text-xl font-semibold">Branch hourly rates</h2>
              <p className="mb-5 text-sm text-gray-400">
                Default hourly rate for computers in a branch.
              </p>

              <form onSubmit={handleBranchRate} className="space-y-4">
                <select required value={branchId} onChange={(e) => setBranchId(e.target.value)}
                  disabled={!canManage || saving || branches.length === 0}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50">
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                  ))}
                </select>

                <input required type="number" min="0.01" max="100000" step="0.01"
                  value={branchRate} onChange={(e) => setBranchRate(e.target.value)}
                  placeholder="Hourly rate in KES" disabled={!canManage || saving}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50" />

                <button disabled={!canManage || saving || branches.length === 0}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-40">
                  Save branch rate
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {branchPricing.map((item) => (
                  <div key={item.id} className="flex justify-between rounded-lg bg-gray-950 p-4">
                    <span>{branchName(item.branch_id!)}</span>
                    <strong>KES {Number(item.hourly_rate_kes).toFixed(2)}/hr</strong>
                  </div>
                ))}
                {branchPricing.length === 0 && (
                  <p className="text-sm text-gray-500">No branch rates configured.</p>
                )}
              </div>
            </section>

            <section className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-7">
              <h2 className="mb-2 text-xl font-semibold">Computer-specific rates</h2>
              <p className="mb-5 text-sm text-gray-400">
                Optional rates that override the branch hourly rate.
              </p>

              <form onSubmit={handleComputerRate} className="space-y-4">
                <select required value={computerId} onChange={(e) => setComputerId(e.target.value)}
                  disabled={!canManage || saving || computers.length === 0}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50">
                  <option value="">Select computer</option>
                  {computers.map((computer) => (
                    <option key={computer.id} value={computer.id}>
                      {computer.computer_name} — {branchName(computer.branch_id)}
                    </option>
                  ))}
                </select>

                <input required type="number" min="0.01" max="100000" step="0.01"
                  value={computerRate} onChange={(e) => setComputerRate(e.target.value)}
                  placeholder="Hourly rate in KES" disabled={!canManage || saving}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50" />

                <button disabled={!canManage || saving || computers.length === 0}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-40">
                  Save computer rate
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {computerPricing.map((item) => (
                  <div key={item.id} className="flex justify-between rounded-lg bg-gray-950 p-4">
                    <span>{computerName(item.computer_id!)}</span>
                    <strong>KES {Number(item.hourly_rate_kes).toFixed(2)}/hr</strong>
                  </div>
                ))}
                {computerPricing.length === 0 && (
                  <p className="text-sm text-gray-500">No computer-specific rates configured.</p>
                )}
              </div>
            </section>

            <section className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-7">
              <h2 className="mb-2 text-xl font-semibold">Create time package</h2>
              <p className="mb-5 text-sm text-gray-400">
                Create packages customers can select from their computers.
              </p>

              <form onSubmit={handlePackage} className="space-y-4">
                <select required value={packageBranchId}
                  onChange={(e) => {
                    setPackageBranchId(e.target.value)
                    setPackageComputerId("")
                  }}
                  disabled={!canManage || saving || branches.length === 0}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50">
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                  ))}
                </select>

                <select value={packageComputerId} onChange={(e) => setPackageComputerId(e.target.value)}
                  disabled={!canManage || saving || !packageBranchId}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50">
                  <option value="">All computers in this branch</option>
                  {computers.filter((computer) => computer.branch_id === packageBranchId).map((computer) => (
                    <option key={computer.id} value={computer.id}>{computer.computer_name}</option>
                  ))}
                </select>

                <input required minLength={2} maxLength={80} value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="Package name e.g. Standard" disabled={!canManage || saving}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input required type="number" min="1" max="1440" step="1"
                    value={duration} onChange={(e) => setDuration(e.target.value)}
                    placeholder="Duration in minutes" disabled={!canManage || saving}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50" />

                  <input required type="number" min="0.01" max="100000" step="0.01"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price in KES" disabled={!canManage || saving}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50" />
                </div>

                <button disabled={!canManage || saving || branches.length === 0}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-40">
                  {saving ? "Saving..." : "Create time package"}
                </button>
              </form>
            </section>

            <section>
              <h2 className="mb-5 text-xl font-semibold">Time packages</h2>

              {packages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center">
                  <h3 className="font-semibold">No packages created</h3>
                  <p className="mt-2 text-sm text-gray-400">Customer packages will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {packages.map((pkg) => (
                    <article key={pkg.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold">{pkg.package_name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs ${pkg.is_active ? "bg-green-950 text-green-300" : "bg-gray-800 text-gray-400"}`}>
                          {pkg.is_active ? "Active" : "Disabled"}
                        </span>
                      </div>

                      <p className="mt-3 text-2xl font-bold">KES {Number(pkg.price_kes).toFixed(2)}</p>
                      <p className="mt-1 text-sm text-gray-400">
                        {pkg.duration_minutes} minutes · {branchName(pkg.branch_id)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {pkg.computer_id ? computerName(pkg.computer_id) : "All branch computers"}
                      </p>

                      <button type="button" onClick={() => void togglePackage(pkg)}
                        disabled={!canManage || saving}
                        className="mt-4 rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800 disabled:opacity-40">
                        {pkg.is_active ? "Disable package" : "Enable package"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
