"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw, CheckCircle2, XCircle, Monitor } from "lucide-react"

type Application = {
  id: string
  owner_user_id: string
  business_name: string
  business_phone: string | null
  business_email: string | null
  registration_number: string | null
  status: string
  created_at: string
}

export default function CyberApprovalsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const loadApplications = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/cyber", {
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to load applications")
      }

      setApplications(result.applications || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  async function reviewApplication(
    applicationId: string,
    decision: "approve" | "reject"
  ) {
    const application = applications.find(
      (item) => item.id === applicationId
    )

    if (!application) return

    const action = decision === "approve" ? "approve" : "reject"

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${application.business_name}?`
      )
    ) {
      return
    }

    setProcessing(applicationId)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/admin/cyber", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          decision,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to review application")
      }

      setApplications((current) =>
        current.filter((item) => item.id !== applicationId)
      )

      setMessage(result.message)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      )
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-400">
              <Monitor className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-widest">
                StreetGO Cyber
              </span>
            </div>

            <h1 className="text-2xl font-semibold">
              Business Approvals
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Review and approve cyber café owner registrations.
            </p>
          </div>

          <button
            onClick={loadApplications}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-sm text-zinc-400">Pending applications</p>
            <p className="mt-2 text-3xl font-semibold">
              {loading ? "—" : applications.length}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-sm text-zinc-400">Review system</p>
            <p className="mt-2 text-lg font-semibold text-emerald-400">
              Active
            </p>
          </div>
        </div>

        {message && (
          <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Registration queue
            </h2>
            <span className="text-xs text-zinc-500">
              Oldest applications first
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-zinc-800 p-10 text-center text-sm text-zinc-400">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <h3 className="mt-4 font-medium">All caught up</h3>
              <p className="mt-2 text-sm text-zinc-400">
                There are no pending cyber business applications.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {application.business_name}
                        </h3>
                        <span className="mt-1 inline-block rounded-full border border-amber-800/70 bg-amber-950/40 px-2.5 py-1 text-xs text-amber-300">
                          Pending review
                        </span>
                      </div>

                      <div className="grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
                        <p>
                          <span className="text-zinc-500">Phone: </span>
                          {application.business_phone || "Not provided"}
                        </p>
                        <p>
                          <span className="text-zinc-500">Email: </span>
                          {application.business_email || "Not provided"}
                        </p>
                        <p>
                          <span className="text-zinc-500">Registration no: </span>
                          {application.registration_number || "Not provided"}
                        </p>
                        <p>
                          <span className="text-zinc-500">Submitted: </span>
                          {new Date(application.created_at).toLocaleString()}
                        </p>
                      </div>

                      <p className="break-all text-xs text-zinc-600">
                        Owner ID: {application.owner_user_id}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:justify-center">
                      <button
                        onClick={() =>
                          reviewApplication(application.id, "approve")
                        }
                        disabled={processing !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {processing === application.id ? "Processing..." : "Approve"}
                      </button>

                      <button
                        onClick={() =>
                          reviewApplication(application.id, "reject")
                        }
                        disabled={processing !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-900 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-950/50 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
