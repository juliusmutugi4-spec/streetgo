"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
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

interface PairingCode {
  code: string
  expiresAt: string
}

interface CyberComputerResponse {
  computers?: Computer[]
  merchantStatus?: string
  error?: string
}

interface CyberBranchResponse {
  branches?: Branch[]
  error?: string
}

function formatDate(value: string | null) {
  if (!value) return "Never connected"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Unknown"

  return date.toLocaleString()
}

function formatExpiry(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Unknown expiry"

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatus(status = "") {
  const normalized = status.toLowerCase()

  if (["online", "connected", "active"].includes(normalized)) {
    return {
      label: "Online",
      color: "text-emerald-300",
      background: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      dot: "bg-emerald-400",
    }
  }

  if (["offline", "disconnected"].includes(normalized)) {
    return {
      label: "Offline",
      color: "text-zinc-300",
      background: "bg-zinc-500/10",
      border: "border-zinc-500/20",
      dot: "bg-zinc-500",
    }
  }

  if (["pending", "pairing", "unpaired"].includes(normalized)) {
    return {
      label: "Pending pairing",
      color: "text-amber-300",
      background: "bg-amber-500/10",
      border: "border-amber-500/20",
      dot: "bg-amber-400",
    }
  }

  return {
    label: status || "Unknown",
    color: "text-blue-300",
    background: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  }
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: string
  className?: string
}) {
  const common = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  switch (name) {
    case "computer":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      )

    case "branch":
      return (
        <svg {...common}>
          <path d="M3 21V8l9-5 9 5v13" />
          <path d="M9 21v-6h6v6M7 9h2M15 9h2" />
        </svg>
      )

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 7v5h-5M4 17v-5h5" />
          <path d="M5.5 9a7 7 0 0 1 11.7-2L20 12" />
          <path d="M18.5 15a7 7 0 0 1-11.7 2L4 12" />
        </svg>
      )

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )

    case "copy":
      return (
        <svg {...common}>
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
        </svg>
      )

    case "search":
      return (
        <svg {...common}>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      )

    default:
      return null
  }
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  accent = "blue",
}: {
  title: string
  value: number | string
  subtitle: string
  icon: string
  accent?: "blue" | "green" | "gray" | "amber"
}) {
  const accents = {
    blue: "border-blue-500/15 text-blue-300 bg-blue-500/[0.06]",
    green: "border-emerald-500/15 text-emerald-300 bg-emerald-500/[0.06]",
    gray: "border-zinc-700/70 text-zinc-300 bg-zinc-500/[0.04]",
    amber: "border-amber-500/15 text-amber-300 bg-amber-500/[0.06]",
  }

  const valueColor = {
    blue: "text-blue-300",
    green: "text-emerald-300",
    gray: "text-white",
    amber: "text-amber-300",
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d111a] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">{title}</p>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${accents[accent]}`}
        >
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>

      <p className={`mt-4 text-3xl font-bold tracking-tight ${valueColor[accent]}`}>
        {value}
      </p>

      <p className="mt-1.5 text-xs text-zinc-600">{subtitle}</p>
    </div>
  )
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

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [pairingCodes, setPairingCodes] = useState<
    Record<string, PairingCode>
  >({})

  const [pairingLoading, setPairingLoading] = useState<string | null>(null)
  const [customerPageLoading, setCustomerPageLoading] = useState<string | null>(null)
  const [copiedComputer, setCopiedComputer] = useState<string | null>(null)

  const canRegister = merchantStatus.toLowerCase() === "active"

  const onlineCount = computers.filter((computer) => {
    const status = computer.device_status?.toLowerCase()

    return status === "online" || status === "connected" || status === "active"
  }).length

  const offlineCount = computers.filter((computer) => {
    const status = computer.device_status?.toLowerCase()

    return status === "offline" || status === "disconnected"
  }).length

  const branchName = useCallback(
    (id: string) => {
      return (
        branches.find((branch) => branch.id === id)?.branch_name ||
        "Branch not found"
      )
    },
    [branches]
  )

  const filteredComputers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return computers.filter((computer) => {
      const normalizedStatus = computer.device_status?.toLowerCase() || ""

      const matchesSearch =
        !query ||
        computer.computer_name.toLowerCase().includes(query) ||
        (computer.operating_system || "").toLowerCase().includes(query) ||
        branchName(computer.branch_id).toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "online" &&
          ["online", "connected", "active"].includes(normalizedStatus)) ||
        (statusFilter === "offline" &&
          ["offline", "disconnected"].includes(normalizedStatus)) ||
        (statusFilter === "pending" &&
          ["pending", "pairing", "unpaired"].includes(normalizedStatus))

      return matchesSearch && matchesStatus
    })
  }, [computers, search, statusFilter, branchName])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const [computerResponse, branchResponse] = await Promise.all([
        fetch("/api/cyber/computers", { cache: "no-store" }),
        fetch("/api/cyber/branches", { cache: "no-store" }),
      ])

      const computerData: CyberComputerResponse =
        await computerResponse.json()

      const branchData: CyberBranchResponse =
        await branchResponse.json()

      if (!computerResponse.ok) {
        throw new Error(
          computerData.error || "Unable to load computers."
        )
      }

      if (!branchResponse.ok) {
        throw new Error(
          branchData.error || "Unable to load branches."
        )
      }

      setComputers(computerData.computers || [])
      setBranches(branchData.branches || [])
      setMerchantStatus(computerData.merchantStatus || "")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load computer data."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
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
          computer_name: computerName.trim(),
          branch_id: branchId,
          operating_system: operatingSystem,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to register computer."
        )
      }

      setSuccess(
        "Computer registered successfully. It is now ready for pairing."
      )

      setComputerName("")

      await loadData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register computer."
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleOpenCustomerPage(computerId: string) {
    try {
      setCustomerPageLoading(computerId)
      setError("")
      setSuccess("")

      const newTab = window.open("about:blank", "_blank")

      const response = await fetch("/api/cyber/computers/customer-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          computer_id: computerId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        newTab?.close()
        throw new Error(result.error || "Unable to open customer page.")
      }

      if (newTab) {
        newTab.location.href = result.customer_url
      } else {
        window.location.href = result.customer_url
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to open customer page."
      )
    } finally {
      setCustomerPageLoading(null)
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
        body: JSON.stringify({
          computer_id: computerId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to generate pairing code."
        )
      }

      setPairingCodes((current) => ({
        ...current,
        [computerId]: {
          code: result.pairing_code,
          expiresAt: result.expires_at,
        },
      }))

      setSuccess("Pairing code generated successfully.")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate pairing code."
      )
    } finally {
      setPairingLoading(null)
    }
  }

  async function handleCopyCode(computerId: string, code: string) {
    try {
      await navigator.clipboard.writeText(code)

      setCopiedComputer(computerId)

      window.setTimeout(() => {
        setCopiedComputer((current) =>
          current === computerId ? null : current
        )
      }, 2000)
    } catch {
      setError("Unable to copy pairing code. Please copy it manually.")
    }
  }

  return (
    <main className="min-h-screen bg-[#080b12] px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/cyber/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Back to dashboard
          </Link>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <Icon name="computer" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                    StreetGO Cyber
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-600">
                    Device management
                  </p>
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Computer management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Register computers, pair your devices and monitor your cyber
                network from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 sm:self-auto"
            >
              <Icon
                name="refresh"
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh data
            </button>
          </div>
        </header>

        {/* Overview */}
        <section className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total computers"
            value={loading ? "—" : computers.length}
            subtitle="Registered devices"
            icon="computer"
            accent="blue"
          />

          <SummaryCard
            title="Online"
            value={loading ? "—" : onlineCount}
            subtitle="Connected devices"
            icon="computer"
            accent="green"
          />

          <SummaryCard
            title="Offline"
            value={loading ? "—" : offlineCount}
            subtitle="Not currently connected"
            icon="clock"
            accent="gray"
          />

          <SummaryCard
            title="Branches"
            value={loading ? "—" : branches.length}
            subtitle="Business locations"
            icon="branch"
            accent="amber"
          />
        </section>

        {/* Merchant approval status */}
        {merchantStatus && (
          <section className="mb-7 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.035] p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <Icon name="shield" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  Business verification
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Your business account registration status
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  canRegister
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                }`}
              >
                {merchantStatus.toUpperCase()}
              </span>
            </div>

            {!canRegister && (
              <p className="mt-4 text-sm leading-6 text-zinc-500">
                Computer registration will become available once your business
                approval is complete.
              </p>
            )}
          </section>
        )}

        {/* Feedback */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-300"
          >
            <span className="font-bold">!</span>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-sm text-emerald-300"
          >
            <span className="font-bold">✓</span>
            <p>{success}</p>
          </div>
        )}

        {/* Register computer */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d111a] shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          <div className="border-b border-zinc-800 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                <Icon name="plus" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Register a computer
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Add a device to your cyber network.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5 p-5 sm:p-7"
          >
            <div>
              <label
                htmlFor="computerName"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Computer name <span className="text-emerald-400">*</span>
              </label>

              <input
                id="computerName"
                required
                minLength={2}
                maxLength={100}
                value={computerName}
                onChange={(e) => setComputerName(e.target.value)}
                placeholder="e.g. PC-01, Gaming-PC-01"
                disabled={!canRegister || saving}
                className="w-full rounded-xl border border-zinc-800 bg-[#080b12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 disabled:opacity-50"
              />

              <p className="mt-2 text-xs text-zinc-600">
                Use a unique name so you can easily identify this device.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="branchId"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Branch <span className="text-emerald-400">*</span>
                </label>

                <select
                  id="branchId"
                  required
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  disabled={!canRegister || saving || branches.length === 0}
                  className="w-full rounded-xl border border-zinc-800 bg-[#080b12] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 disabled:opacity-50"
                >
                  <option value="">Select a branch</option>

                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>

                {branches.length === 0 && !loading && (
                  <p className="mt-2 text-xs text-amber-300">
                    Register a branch before adding computers.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="operatingSystem"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Operating system
                </label>

                <select
                  id="operatingSystem"
                  value={operatingSystem}
                  onChange={(e) => setOperatingSystem(e.target.value)}
                  disabled={!canRegister || saving}
                  className="w-full rounded-xl border border-zinc-800 bg-[#080b12] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 disabled:opacity-50"
                >
                  <option>Windows 11</option>
                  <option>Windows 10</option>
                  <option>Windows 8.1</option>
                  <option>Linux</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-xs leading-5 text-zinc-600">
                After registration, generate a pairing code to connect this
                computer to the StreetGO Cyber Agent.
              </p>

              <button
                type="submit"
                disabled={!canRegister || saving || branches.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-[#04110c] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="plus" className="h-4 w-4" />
                {saving ? "Registering computer…" : "Register computer"}
              </button>
            </div>
          </form>
        </section>

        {/* Device list */}
        <section>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your computers</h2>

              <p className="mt-1 text-sm text-zinc-500">
                Devices registered to your cyber business.
              </p>
            </div>

            <span className="text-xs text-zinc-600">
              {computers.length} registered device
              {computers.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Search and filter */}
          {!loading && computers.length > 0 && (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search computer, branch or OS…"
                  aria-label="Search computers"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0d111a] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-700"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter computers by status"
                className="rounded-xl border border-zinc-800 bg-[#0d111a] px-4 py-3 text-sm text-zinc-300 outline-none focus:border-zinc-700 sm:w-48"
              >
                <option value="all">All statuses</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="pending">Pending pairing</option>
              </select>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-zinc-800 bg-[#0d111a] p-6"
                >
                  <div className="h-5 w-40 rounded bg-zinc-800" />
                  <div className="mt-4 h-3 w-24 rounded bg-zinc-800" />
                  <div className="mt-6 h-24 rounded bg-zinc-800/50" />
                </div>
              ))}
            </div>
          ) : computers.length === 0 ? (
            /* Empty state */
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#0d111a] px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-500">
                <Icon name="computer" className="h-7 w-7" />
              </div>

              <h3 className="font-semibold text-white">
                No computers registered yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                Register your first computer above to begin pairing your
                StreetGO Cyber Agent.
              </p>
            </div>
          ) : filteredComputers.length === 0 ? (
            /* No search results */
            <div className="rounded-2xl border border-zinc-800 bg-[#0d111a] px-6 py-12 text-center">
              <h3 className="font-medium text-white">No matching computers</h3>

              <p className="mt-2 text-sm text-zinc-500">
                Try another search or change the status filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setStatusFilter("all")
                }}
                className="mt-4 text-sm font-medium text-emerald-300 hover:text-emerald-200"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredComputers.map((computer) => {
                const status = getStatus(computer.device_status)
                const pairing = pairingCodes[computer.id]

                return (
                  <article
                    key={computer.id}
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d111a] transition hover:border-zinc-700"
                  >
                    {/* Computer header */}
                    <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-blue-300">
                          <Icon name="computer" className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-white">
                            {computer.computer_name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {computer.operating_system ||
                              "Operating system unknown"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${status.background} ${status.border} ${status.color}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    </div>

                    {/* Computer details */}
                    <div className="grid grid-cols-2 gap-4 p-5">
                      <div>
                        <p className="text-xs text-zinc-600">Branch</p>

                        <p className="mt-1 truncate text-sm font-medium text-zinc-300">
                          {branchName(computer.branch_id)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-600">
                          Operating system
                        </p>

                        <p className="mt-1 text-sm text-zinc-300">
                          {computer.operating_system || "Unknown"}
                        </p>
                      </div>

                      <div className="col-span-2 rounded-xl border border-zinc-800/70 bg-black/10 p-3">
                        <div className="flex items-center gap-2">
                          <Icon
                            name="clock"
                            className="h-4 w-4 text-zinc-600"
                          />

                          <p className="text-xs text-zinc-600">
                            Last connection
                          </p>
                        </div>

                        <p className="mt-1.5 text-sm text-zinc-400">
                          {formatDate(computer.last_seen_at)}
                        </p>
                      </div>
                    </div>

                    {/* Customer Page */}
                    <div className="border-t border-zinc-800 p-5">
                      <button
                        type="button"
                        onClick={() => void handleOpenCustomerPage(computer.id)}
                        disabled={customerPageLoading !== null}
                        className="w-full rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {customerPageLoading === computer.id
                          ? "Opening customer page…"
                          : "Open Customer Page"}
                      </button>
                    </div>
                    {/* Pairing */}
                    <div className="border-t border-zinc-800 p-5">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-white">
                          Device pairing
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          Generate a temporary code to connect this computer
                          to the StreetGO Cyber Agent.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleGeneratePairing(computer.id)}
                        disabled={pairingLoading !== null}
                        className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {pairingLoading === computer.id
                          ? "Generating pairing code…"
                          : pairing
                            ? "Generate new pairing code"
                            : "Generate pairing code"}
                      </button>

                      {pairing && (
                        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-emerald-300">
                              Temporary pairing code
                            </p>

                            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">
                              One-time use
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="break-all font-mono text-2xl font-bold tracking-[0.15em] text-white">
                              {pairing.code}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                void handleCopyCode(
                                  computer.id,
                                  pairing.code
                                )
                              }
                              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-800"
                            >
                              <Icon name="copy" className="h-3.5 w-3.5" />

                              {copiedComputer === computer.id
                                ? "Copied"
                                : "Copy"}
                            </button>
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                            <Icon
                              name="clock"
                              className="h-3.5 w-3.5"
                            />

                            Expires {formatExpiry(pairing.expiresAt)}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5 text-xs text-zinc-600">
          <p>StreetGO Cyber · Device management</p>

          <Link
            href="/cyber/dashboard"
            className="transition hover:text-zinc-300"
          >
            Return to dashboard →
          </Link>
        </footer>
      </div>
    </main>
  )
}


