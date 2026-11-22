
"use client"

import { useCallback, useEffect, useId, useState } from "react"
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

const STATUS_STYLES: Record<string, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  inactive: "border-gray-700 bg-gray-800/80 text-gray-400",
}

function getStatusStyle(status: string) {
  return (
    STATUS_STYLES[status.toLowerCase()] ??
    "border-gray-700 bg-gray-800 text-gray-300"
  )
}

function formatDate(date: string) {
  if (!date) return "Date unavailable"

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return "Date unavailable"

  return parsed.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-800 bg-gray-900/70 p-5">
      <div className="mb-4 h-4 w-40 rounded bg-gray-800" />
      <div className="mb-3 h-3 w-28 rounded bg-gray-800" />
      <div className="mb-2 h-3 w-48 rounded bg-gray-800" />
      <div className="h-3 w-32 rounded bg-gray-800" />
    </div>
  )
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

  const formId = useId()

  const canCreate = merchantStatus.toLowerCase() === "active"
  const formDisabled = !canCreate || saving

  const loadBranches = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/cyber/branches", {
        cache: "no-store",
        signal,
      })

      const result: BranchResponse = await response
        .json()
        .catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          result.error || `Unable to load branches (${response.status}).`
        )
      }

      setBranches(
        Array.isArray(result.branches) ? result.branches : []
      )

      setMerchantStatus(result.merchantStatus || "")
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load branches right now."
      )
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    void loadBranches(controller.signal)

    return () => controller.abort()
  }, [loadBranches])

  async function handleCreateBranch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const trimmedName = branchName.trim()

    if (!canCreate || saving || trimmedName.length < 2) {
      return
    }

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const payload = {
        branch_name: trimmedName,
        address: address.trim() || null,
        city: city.trim() || null,
        phone: phone.trim() || null,
      }

      const response = await fetch("/api/cyber/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result: BranchResponse = await response
        .json()
        .catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to create branch."
        )
      }

      setSuccess(`"${trimmedName}" has been added successfully.`)

      setBranchName("")
      setAddress("")
      setCity("")
      setPhone("")

      await loadBranches()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the branch."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#080d16] px-4 py-8 text-gray-100 antialiased sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-8 border-b border-gray-800/80 pb-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Link
              href="/cyber/dashboard"
              className="group inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
            >
              <span className="transition-transform group-hover:-translate-x-1">
                ←
              </span>
              Back to dashboard
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-xs font-medium text-emerald-400">
                StreetGO Cyber
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M8 9h.01M16 9h.01M8 12h.01M16 12h.01"
                    />
                  </svg>
                </div>

                <span className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                  Business locations
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Branch Management
              </h1>

              <p className="mt-2 max-w-xl text-sm text-gray-400">
                Manage, organize and expand your cyber business locations
                from one place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-gray-800 bg-gray-900/80 px-5 py-3">
                <p className="text-xs text-gray-500">Total branches</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {loading ? "—" : branches.length}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadBranches()}
                disabled={loading}
                aria-label="Refresh branches"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-gray-400 transition hover:border-gray-700 hover:bg-gray-800 hover:text-white disabled:opacity-50"
              >
                <svg
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7v5h-5M4 17v-5h5M5.5 8.5A7 7 0 0118 6.5M18.5 15.5A7 7 0 016 17.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* BUSINESS APPROVAL STATUS */}
        {merchantStatus && (
          <section className="mb-8">
            <div
              className={`overflow-hidden rounded-2xl border ${
                canCreate
                  ? "border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 to-gray-900/60"
                  : "border-amber-500/20 bg-gradient-to-r from-amber-950/20 to-gray-900/60"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      canCreate
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5 2a10 10 0 11-20 0 10 10 0 0120 0z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Business approval
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {canCreate
                        ? "Your business is approved and ready to manage locations."
                        : "Branch management access is awaiting business approval."}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                    canCreate
                      ? STATUS_STYLES.active
                      : STATUS_STYLES.pending
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {merchantStatus}
                </span>
              </div>

              {!canCreate && (
                <div className="border-t border-amber-500/10 px-5 py-3 sm:px-6">
                  <p className="text-xs leading-5 text-amber-300/80">
                    You can view your branches, but creating new locations
                    will become available once your business registration
                    has been approved.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ALERTS */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-950/30 px-4 py-3.5 text-sm text-red-300"
          >
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.3 3.86l-8 14A2 2 0 004 20h16a2 2 0 00-1.73-2.14l-8-14a2 2 0 00-3.47 0z"
                />
              </svg>
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-xs font-medium text-red-300 transition hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-3.5 text-sm text-emerald-300"
          >
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5 2a10 10 0 11-20 0 10 10 0 0120 0z"
                />
              </svg>
              <span>{success}</span>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0 text-xs font-medium text-emerald-300 transition hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* CREATE BRANCH */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 shadow-xl shadow-black/10">
          <div className="border-b border-gray-800 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14m-7-7h14"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Add a new branch
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Register another location for your cyber business.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleCreateBranch}
            className="space-y-5 p-5 sm:p-7"
          >
            {/* BRANCH NAME */}
            <div>
              <label
                htmlFor={`${formId}-name`}
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Branch name <span className="text-red-400">*</span>
              </label>

              <input
                id={`${formId}-name`}
                name="branch_name"
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={branchName}
                onChange={(e) => {
                  setBranchName(e.target.value)
                  setSuccess("")
                }}
                placeholder="e.g. Mars Cyber - Industrial Area"
                disabled={formDisabled}
                className="w-full rounded-xl border border-gray-800 bg-gray-950/80 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <p className="mt-1.5 text-xs text-gray-600">
                Give this location a name your customers and staff will recognize.
              </p>
            </div>

            {/* CITY AND PHONE */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${formId}-city`}
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  City or town
                </label>

                <input
                  id={`${formId}-city`}
                  name="city"
                  type="text"
                  maxLength={60}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Nairobi"
                  disabled={formDisabled}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950/80 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor={`${formId}-phone`}
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Branch phone number
                </label>

                <input
                  id={`${formId}-phone`}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  maxLength={20}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  disabled={formDisabled}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950/80 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <label
                htmlFor={`${formId}-address`}
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Physical address
              </label>

              <input
                id={`${formId}-address`}
                name="address"
                type="text"
                maxLength={160}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, building, floor, or landmark"
                disabled={formDisabled}
                className="w-full rounded-xl border border-gray-800 bg-gray-950/80 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* SUBMIT */}
            <div className="flex flex-col gap-3 border-t border-gray-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-gray-500">
                Your branch information can be updated as your business grows.
              </p>

              <button
                type="submit"
                disabled={
                  formDisabled ||
                  branchName.trim().length < 2
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-gray-950 shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {saving ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating branch...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 5v14m-7-7h14"
                      />
                    </svg>
                    Create branch
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* BRANCH DIRECTORY */}
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Your branches
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                All registered locations belonging to your business.
              </p>
            </div>

            {!loading && branches.length > 0 && (
              <span className="text-xs text-gray-500">
                {branches.length} location{branches.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : branches.length === 0 ? (
            /* EMPTY STATE */
            <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-900/30 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900 text-gray-500">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"
                  />
                </svg>
              </div>

              <h3 className="text-base font-semibold text-white">
                No branches registered yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Your registered locations will appear here. Create your
                first branch above to start organizing your cyber business.
              </p>
            </div>
          ) : (
            /* BRANCH CARDS */
            <div className="grid gap-4 sm:grid-cols-2">
              {branches.map((branch) => {
                const locationText = [
                  branch.address,
                  branch.city,
                ]
                  .filter(Boolean)
                  .join(", ")

                return (
                  <article
                    key={branch.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 p-5 transition-all hover:border-gray-700 hover:bg-gray-900"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-800 bg-gray-950 text-gray-400 transition group-hover:border-emerald-500/20 group-hover:text-emerald-400">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M8 9h.01M16 9h.01M8 12h.01M16 12h.01"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words text-base font-semibold text-white">
                            {branch.branch_name}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            Branch location
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(
                          branch.status
                        )}`}
                      >
                        {branch.status}
                      </span>
                    </div>

                    <div className="space-y-3 border-t border-gray-800 pt-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 21a2 2 0 01-2.828 0l-4.243-4.343a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>

                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-400">
                            Location
                          </p>
                          <p className="mt-1 break-words text-sm text-gray-300">
                            {locationText || "No address added"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 5a2 2 0 012-2h2.5a1 1 0 011 .8l1 4a1 1 0 01-.5 1.1L7.5 10a11 11 0 005 5l1.1-1.5a1 1 0 011.1-.5l4 1a1 1 0 01.8 1V17a2 2 0 01-2 2h-1C9.5 19 5 14.5 5 8V5z"
                          />
                        </svg>

                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-400">
                            Phone
                          </p>
                          <p className="mt-1 text-sm text-gray-300">
                            {branch.phone || "No phone number added"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
                          />
                        </svg>

                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-400">
                            Registered
                          </p>
                          <p className="mt-1 text-sm text-gray-300">
                            {formatDate(branch.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-gray-800/80 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              StreetGO Cyber · Branch management
            </p>

            <Link
              href="/cyber/dashboard"
              className="text-xs text-gray-500 transition hover:text-emerald-400"
            >
              Return to dashboard →
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
