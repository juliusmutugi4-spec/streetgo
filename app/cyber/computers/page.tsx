"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

interface Branch {
  id: string
  branch_name: string
}

interface Computer {
  id: string
  branch_id: string
  computer_name: string
  device_status: string
  operating_system: string | null
  last_seen_at: string | null
  created_at: string
}

export default function CyberComputersPage() {
  const [computers, setComputers] = useState<Computer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [merchantStatus, setMerchantStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [computerName, setComputerName] = useState("")
  const [branchId, setBranchId] = useState("")
  const [operatingSystem, setOperatingSystem] = useState("Windows 11")
  const [pairingCodes, setPairingCodes] = useState<
    Record<string, { code: string; expiresAt: string }>
  >({})
  const [pairingLoading, setPairingLoading] = useState<string | null>(null)

  const canRegister = merchantStatus === "active"

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const [computerResponse, branchResponse] = await Promise.all([
        fetch("/api/cyber/computers", { cache: "no-store" }),
        fetch("/api/cyber/branches", { cache: "no-store" }),
      ])

      const computerData = await computerResponse.json()
      const branchData = await branchResponse.json()

      if (!computerResponse.ok) {
        throw new Error(computerData.error || "Unable to load computers.")
      }

      if (!branchResponse.ok) {
        throw new Error(branchData.error || "Unable to load branches.")
      }

      setComputers(computerData.computers || [])
      setBranches(branchData.branches || [])
      setMerchantStatus(computerData.merchantStatus || "")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load computer data."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canRegister) return

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/cyber/computers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          computer_name: computerName,
          branch_id: branchId,
          operating_system: operatingSystem,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to register computer.")
      }

      setSuccess("Computer registered. It is waiting for device pairing.")
      setComputerName("")
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to register computer."
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleGeneratePairing(computerId: string) {
    try {
      setPairingLoading(computerId)
      setError("")
      setSuccess("")

      const response = await fetch("/api/cyber/pairing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ computer_id: computerId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to generate pairing code.")
      }

      setPairingCodes((current) => ({
        ...current,
        [computerId]: {
          code: result.pairing_code,
          expiresAt: result.expires_at,
        },
      }))

      setSuccess("Pairing code generated. It expires in 10 minutes.")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate pairing code."
      )
    } finally {
      setPairingLoading(null)
    }
  }
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/cyber/dashboard"
          className="mb-4 inline-block text-sm text-gray-400 hover:text-white"
        >
          ← Back to dashboard
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Computer Management</h1>
            <p className="mt-2 text-sm text-gray-400">
              Register and monitor computers across your cyber branches.
            </p>
          </div>

          <div className="rounded-full border border-gray-700 px-4 py-2 text-sm">
            {computers.length} computers
          </div>
        </div>

        {merchantStatus && (
          <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Business approval</span>
              <span className="text-sm font-semibold text-yellow-400">
                {merchantStatus.toUpperCase()}
              </span>
            </div>

            {!canRegister && (
              <p className="mt-3 text-sm text-gray-400">
                Computer registration will become available after business approval.
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
          <h2 className="mb-5 text-xl font-semibold">Register a computer</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Computer name *
              </label>
              <input
                required
                minLength={2}
                maxLength={100}
                value={computerName}
                onChange={(e) => setComputerName(e.target.value)}
                placeholder="e.g. PC-01"
                disabled={!canRegister || saving}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Branch *
              </label>
              <select
                required
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                disabled={!canRegister || saving || branches.length === 0}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50"
              >
                <option value="">Select a branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>

              {branches.length === 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Create a branch before registering computers.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Operating system
              </label>
              <select
                value={operatingSystem}
                onChange={(e) => setOperatingSystem(e.target.value)}
                disabled={!canRegister || saving}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 disabled:opacity-50"
              >
                <option>Windows 11</option>
                <option>Windows 10</option>
                <option>Windows 8.1</option>
                <option>Linux</option>
                <option>Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!canRegister || saving || branches.length === 0}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {saving ? "Registering..." : "Register computer"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-5 text-xl font-semibold">Your computers</h2>

          {loading ? (
            <p className="text-gray-400">Loading computers...</p>
          ) : computers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center">
              <h3 className="font-semibold">No computers registered</h3>
              <p className="mt-2 text-sm text-gray-400">
                Registered computers will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {computers.map((computer) => (
                <article
                  key={computer.id}
                  className="rounded-xl border border-gray-800 bg-gray-900 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{computer.computer_name}</h3>
                    <span className="rounded-full bg-gray-800 px-3 py-1 text-xs">
                      {computer.device_status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-400">
                    {computer.operating_system || "Operating system unknown"}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Last seen:{" "}
                    {computer.last_seen_at
                      ? new Date(computer.last_seen_at).toLocaleString()
                      : "Never connected"}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGeneratePairing(computer.id)}
                    disabled={pairingLoading !== null}
                    className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {pairingLoading === computer.id
                      ? "Generating..."
                      : "Generate pairing code"}
                  </button>

                  {pairingCodes[computer.id] && (
                    <div className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950 p-4">
                      <p className="text-xs text-emerald-300">
                        One-time pairing code
                      </p>
                      <p className="mt-2 break-all font-mono text-xl font-bold tracking-wider text-white">
                        {pairingCodes[computer.id].code}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            pairingCodes[computer.id].code
                          )
                        }
                        className="mt-3 rounded-md border border-emerald-700 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-900"
                      >
                        Copy code
                      </button>
                      <p className="mt-2 text-xs text-emerald-300">
                        Expires:{" "}
                        {new Date(
                          pairingCodes[computer.id].expiresAt
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

